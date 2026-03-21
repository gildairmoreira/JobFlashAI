import prisma from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { clerkClient } from "@clerk/nextjs/server";
import crypto from "crypto";

// Verifica a assinatura HMAC-SHA256 do Mercado Pago
// Retorna true se válida, false se inválida (nunca lança exceção)
function verifyWebhookSignature(req: Request, dataId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("Webhook MP: MERCADOPAGO_WEBHOOK_SECRET não configurado em produção!");
      return false;
    }
    return true; // Aceita em dev sem secret 
  }

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");

  if (!xSignature) {
    console.warn("Webhook MP: header x-signature ausente");
    return false;
  }

  // Formato esperado: "ts=<timestamp>,v1=<hash>"
  const parts: Record<string, string> = {};
  for (const part of xSignature.split(",")) {
    const [key, value] = part.split("=");
    if (key && value) parts[key.trim()] = value.trim();
  }

  const ts = parts["ts"];
  const v1 = parts["v1"];

  if (!ts || !v1) {
    console.warn("Webhook MP: ts ou v1 ausentes no x-signature");
    return false;
  }

  // Mensagem assinada conforme documentação oficial do MP
  const signedMessage = `id:${dataId};request-id:${xRequestId ?? ""};ts:${ts};`;
  const expectedHash = crypto
    .createHmac("sha256", secret)
    .update(signedMessage)
    .digest("hex");

  // Comparação segura contra timing attacks, com proteção contra buffers de tamanho diferente
  try {
    const v1Buffer = Buffer.from(v1, "hex");
    const expectedBuffer = Buffer.from(expectedHash, "hex");
    if (v1Buffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(v1Buffer, expectedBuffer);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response("Invalid JSON body", { status: 400 });
    }

    // Extrai o dataId do payload para usar na validação de assinatura
    const paymentIdFromBody = body.data?.id || body.id;
    const dataId = paymentIdFromBody?.toString() ?? "";

    // Valida a assinatura do webhook em produção
    if (process.env.NODE_ENV === "production" && !verifyWebhookSignature(req, dataId)) {
      console.warn("Mercado Pago Webhook: Assinatura inválida! Requisição rejeitada.");
      return new Response("Invalid signature", { status: 401 });
    }

    // Aceita tanto a chave action (webhook tradicional) quanto a type
    const eventType = body.type || body.action;
    console.log("Webhook MP recebido - tipo:", eventType, "| paymentId:", dataId);

    if (eventType === "payment" || eventType === "payment.created" || eventType === "payment.updated") {
      if (!dataId) {
        console.warn("Mercado Pago Webhook: Missing Payment ID");
        return new Response("Missing payment ID", { status: 400 });
      }

      // Verificação de segurança: busca o pagamento diretamente na API do MP
      const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
      const payment = new Payment(client);
      const paymentDetails = await payment.get({ id: dataId });

      if (!paymentDetails) {
        console.warn("Webhook MP: pagamento não encontrado no MP:", dataId);
        return new Response("Payment not found", { status: 200 });
      }

      if (!paymentDetails.external_reference) {
        console.warn("Webhook MP: external_reference ausente para pagamento:", dataId);
        return new Response("Payment ignored - missing reference", { status: 200 });
      }

      // CORREÇÃO CRÍTICA: Usamos pipe (|) como separador para evitar conflito com underscores do Clerk userId
      // Formato: "user_2abc123|pro" ou "user_2abc123|monthly"
      const extRef = paymentDetails.external_reference;
      const pipeIdx = extRef.indexOf("|");
      if (pipeIdx === -1) {
        // Fallback: tenta o formato antigo com lastIndexOf underscore
        console.warn("Webhook MP: external_reference sem pipe, tentando formato legado:", extRef);
        const lastUnderscoreIdx = extRef.lastIndexOf("_");
        if (lastUnderscoreIdx === -1) {
          console.warn("Webhook MP: external_reference com formato inválido:", extRef);
          return new Response("Invalid external reference format", { status: 200 });
        }
        var userId = extRef.substring(0, lastUnderscoreIdx);
        var rawPlanType = extRef.substring(lastUnderscoreIdx + 1);
      } else {
        var userId = extRef.substring(0, pipeIdx);
        var rawPlanType = extRef.substring(pipeIdx + 1);
      }
      const planType = rawPlanType.toUpperCase() as "PRO" | "MONTHLY" | "FREE";

      const status = paymentDetails.status;
      const amount = paymentDetails.transaction_amount ?? 0;
      const transactionId = paymentDetails.id?.toString() ?? "";

      // Busca o nome e email reais do usuário pelo userId via Clerk
      // O MP não preenche o payer.first_name no PIX
      let customerName = paymentDetails.payer?.first_name ?? "";
      let customerEmail = paymentDetails.payer?.email ?? "";
      try {
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(userId);
        if (clerkUser) {
          customerName = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || customerName;
          customerEmail = clerkUser.emailAddresses[0]?.emailAddress ?? customerEmail;
        }
      } catch (clerkErr) {
        console.warn("Webhook MP: Não foi possível buscar usuário no Clerk:", clerkErr);
      }

      console.log(`Webhook MP: userId=${userId} | plan=${planType} | status=${status}`);

      if (!userId || !transactionId) {
        return new Response("Invalid external reference", { status: 400 });
      }

      // === STATUS PENDENTE (PIX gerado ou cartão em análise) ===
      if (status === "pending" || status === "in_process") {
        await (prisma as any).transaction.upsert({
          where: { caktoTransactionId: transactionId },
          create: {
            userId,
            caktoTransactionId: transactionId,
            amount,
            status: "PENDING",
            paymentMethod: paymentDetails.payment_method_id ?? "mercadopago",
            customerEmail,
            customerName,
          },
          update: { status: "PENDING" },
        });

        await (prisma as any).analyticEvent.create({
          data: {
            userId,
            event: "initiate_checkout",
            metadata: { transactionId, email: customerEmail, product: planType },
          },
        }).catch(() => {}); // Analytics não deve bloquear o fluxo

        return new Response("Pending transaction logged", { status: 200 });
      }

      // === STATUS APROVADO (Conversão Concluída) ===
      if (status === "approved" || status === "authorized") {
        // Verifica se já existe assinatura para adicionar tempo (renovação/upgrade)
        const existingSub = await prisma.userSubscription.findUnique({ where: { userId } });
        let baseDate = new Date();

        if (existingSub?.currentPeriodEnd && existingSub.currentPeriodEnd > new Date()) {
          baseDate = existingSub.currentPeriodEnd;
        }

        const expirationDate = new Date(baseDate);
        if (planType === "PRO") {
          expirationDate.setDate(expirationDate.getDate() + 7);
        } else if (planType === "MONTHLY") {
          expirationDate.setDate(expirationDate.getDate() + 31);
        }

        // Ativa o plano do usuário
        await prisma.userSubscription.upsert({
          where: { userId },
          create: {
            userId,
            planType,
            caktoTransactionId: transactionId,
            status: "ACTIVE",
            currentPeriodEnd: expirationDate,
          },
          update: {
            planType,
            caktoTransactionId: transactionId,
            status: "ACTIVE",
            currentPeriodEnd: expirationDate,
          },
        });

        // Registra a transação como paga
        await (prisma as any).transaction.upsert({
          where: { caktoTransactionId: transactionId },
          create: {
            userId,
            caktoTransactionId: transactionId,
            amount,
            status: "PAID",
            paymentMethod: paymentDetails.payment_method_id ?? "mercadopago",
            customerEmail,
            customerName,
          },
          update: { status: "PAID" },
        });

        // Salva conversão no funil de analytics
        await (prisma as any).analyticEvent.create({
          data: {
            userId,
            event: "purchase_approved",
            metadata: { transactionId, email: customerEmail, product: planType },
          },
        }).catch(() => {});

        console.log(`✅ Webhook MP: Plano ${planType} ativado para userId=${userId} até ${expirationDate.toISOString()}`);
        return new Response("Approved! User access granted.", { status: 200 });
      }

      return new Response("Event ignored for this status: " + status, { status: 200 });
    }

    return new Response("Not a payment event", { status: 200 });
  } catch (err) {
    console.error("Mercado Pago Webhook INTERNAL ERROR:", err);
    return new Response("Webhook Handler Failed", { status: 500 });
  }
}
