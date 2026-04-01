import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";

// Retorna o status atual da assinatura e o currentPeriodEnd para comparação no client
// Se o paymentId for fornecido, consulta ativamente a API do MP para feedback imediato do PIX
export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ paid: false }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("paymentId");

  console.log(`[payment-status] userId=${userId} | paymentId=${paymentId}`);

  let subscription = await prisma.userSubscription.findUnique({
    where: { userId },
    select: { status: true, planType: true, currentPeriodEnd: true },
  });

  if (paymentId) {
    // Verifica se já foi processado para evitar reprocessamento
    const existingTx = await (prisma as any).transaction.findUnique({
      where: { caktoTransactionId: paymentId },
    });

    console.log(`[payment-status] existingTx status: ${existingTx?.status ?? "NOT FOUND"}`);

    // Se a transação já está PAID, apenas retorna o status atualizado do banco
    if (existingTx?.status === "PAID") {
      console.log(`[payment-status] Transação já processada, retornando status do DB.`);
      // Recarrega a subscription caso tenha sido atualizada
      subscription = await prisma.userSubscription.findUnique({
        where: { userId },
        select: { status: true, planType: true, currentPeriodEnd: true },
      });
    } else {
      // Consulta ATIVAMENTE a API do Mercado Pago para verificar o status do pagamento
      try {
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
          console.error("[payment-status] MERCADOPAGO_ACCESS_TOKEN não configurado!");
        } else {
          const client = new MercadoPagoConfig({ accessToken });
          const paymentApi = new Payment(client);

          // A API do MP aceita o paymentId como string
          console.log(`[payment-status] Consultando MP API para paymentId=${paymentId}...`);
          const paymentDetails = await paymentApi.get({ id: paymentId });

          const mpStatus = paymentDetails.status;
          console.log(`[payment-status] Status do MP: ${mpStatus} | status_detail: ${paymentDetails.status_detail}`);

          if (mpStatus === "approved" || mpStatus === "authorized") {
            // Extrai o plano do external_reference (formato: "userId|planType")
            const extRef = paymentDetails.external_reference || "";
            const pipeIdx = extRef.indexOf("|");
            const planTypeStr = pipeIdx !== -1 ? extRef.substring(pipeIdx + 1) : "monthly";
            const planType = planTypeStr.toUpperCase() as "PRO" | "MONTHLY" | "FREE";

            console.log(`[payment-status] ✅ APROVADO! extRef=${extRef} | planType=${planType}`);

            // Calcula a data de expiração adicionando tempo ao plano existente
            let baseDate = new Date();
            if (subscription?.currentPeriodEnd && subscription.currentPeriodEnd > new Date()) {
              baseDate = subscription.currentPeriodEnd;
            }

            const expirationDate = new Date(baseDate);
            if (planType === "PRO") {
              expirationDate.setDate(expirationDate.getDate() + 7);
            } else if (planType === "MONTHLY") {
              expirationDate.setDate(expirationDate.getDate() + 31);
            }

            const amount = paymentDetails.transaction_amount ?? 0;

            // Busca o nome e email reais do usuário logado via Better Auth
            const customerName = session.user.name || (paymentDetails.payer?.first_name ?? "");
            const customerEmail = session.user.email || paymentDetails.payer?.email || "";

            // PASSO 1: Ativa o plano do usuário
            console.log(`[payment-status] Upserting UserSubscription...`);
            const updatedSub = await prisma.userSubscription.upsert({
              where: { userId },
              create: {
                userId,
                planType,
                caktoTransactionId: paymentId,
                status: "ACTIVE",
                currentPeriodEnd: expirationDate,
              },
              update: {
                planType,
                caktoTransactionId: paymentId,
                status: "ACTIVE",
                currentPeriodEnd: expirationDate,
              },
            });
            console.log(`[payment-status] UserSubscription upserted OK. periodEnd=${expirationDate.toISOString()}`);

            // PASSO 2: Registra a transação como PAID (para o webhook não reprocessar)
            // A FK exige que UserSubscription.caktoTransactionId == Transaction.caktoTransactionId
            console.log(`[payment-status] Upserting Transaction...`);
            try {
              await (prisma as any).transaction.upsert({
                where: { caktoTransactionId: paymentId },
                create: {
                  userId,
                  caktoTransactionId: paymentId,
                  amount,
                  status: "PAID",
                  paymentMethod: paymentDetails.payment_method_id ?? "pix",
                  customerEmail,
                  customerName,
                },
                update: { status: "PAID" },
              });
              console.log(`[payment-status] Transaction upserted OK.`);
            } catch (txError) {
              // Se a FK falhar, logamos mas NÃO quebramos o fluxo
              // O importante é que o plano já foi ativado acima
              console.warn(`[payment-status] ⚠️ Transaction upsert falhou (FK constraint?):`, txError);
            }

            subscription = updatedSub;
            console.log(`🚀 [payment-status] Plano ${planType} ativado para userId=${userId} até ${expirationDate.toISOString()}`);
          } else {
            console.log(`[payment-status] Status do MP ainda não aprovado: ${mpStatus}`);
          }
        }
      } catch (error: any) {
        console.error(`[payment-status] ❌ Erro ao consultar MP API:`, error?.message || error);
      }
    }
  }

  const response = {
    status: subscription?.status ?? null,
    planType: subscription?.planType ?? null,
    currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
  };

  console.log(`[payment-status] Respondendo:`, JSON.stringify(response));

  return NextResponse.json(response);
}

