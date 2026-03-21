import prisma from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Aceita tanto a chave action (webhook tradicional) quanto a type
    const eventType = body.type || body.action;

    if (eventType === "payment" || eventType === "payment.created" || eventType === "payment.updated") {
      // Diferentes payloads de MP trazem o ID no objeto data ou diretamente
      const paymentId = body.data?.id || body.id;

      if (!paymentId) {
        console.warn("Mercado Pago Webhook: Missing Payment ID");
        return new Response("Missing payment ID", { status: 400 });
      }

      // Iniciamos a SDK do Mercado Pago
      const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
      const payment = new Payment(client);

      // Verificação DE SEGURANÇA: Buscar e validar o pagamento diretamente na API do MP
      // Isso impede que alguém falsifique o payload simulando que foi aprovado
      const paymentDetails = await payment.get({ id: paymentId });

      if (!paymentDetails || !paymentDetails.external_reference) {
          console.warn("Mercado Pago Webhook: Ignorado - Sem external_reference", paymentId);
          return new Response("Payment ignored or missing reference", { status: 200 });
      }

      const [userId, rawPlanType] = paymentDetails.external_reference.split("_");
      const planType = rawPlanType.toUpperCase() as "PRO" | "MONTHLY" | "FREE";

      const amount = paymentDetails.transaction_amount;
      const status = paymentDetails.status;
      const customerEmail = paymentDetails.payer?.email || "";
      const customerName = paymentDetails.payer?.first_name || "";
      const transactionId = paymentDetails.id?.toString();

      if (!userId || !transactionId) {
          return new Response("Invalid external reference", { status: 400 });
      }

      // Log inicial do funil Analytics
      if (status === "pending") {
        await (prisma as any).analyticEvent.create({
            data: {
                userId: userId,
                event: "initiate_checkout",
                metadata: {
                    transactionId,
                    email: customerEmail,
                    product: planType
                }
            }
        });
      }

      // === STATUS PENDENTE (Pix gerado ou cartão em análise) ===
      if (status === "pending" || status === "in_process") {
         await (prisma as any).transaction.upsert({
            where: { caktoTransactionId: transactionId }, // Mantemos na mesma coluna p/ n quebrar Admin Panel
            create: {
                userId: userId,
                caktoTransactionId: transactionId,
                amount: amount || 0,
                status: "PENDING",
                paymentMethod: paymentDetails.payment_method_id || "mercadopago",
                customerEmail,
                customerName,
            },
            update: {
                status: "PENDING",
            }
         });
         return new Response("Pending transaction logged", { status: 200 });
      }

      // === STATUS APROVADO (Conversão Concluída) ===
      if (status === "approved" || status === "authorized") {
         // Pega a assinatura existente para incrementar o tempo (Recorrência/Renovação)
         const existingSub = await prisma.userSubscription.findUnique({ where: { userId } });
         let baseDate = new Date();
         
         // Se ele já tem plano ativo e ainda não venceu, soma em cima do que ele já tem!
         if (existingSub && existingSub.currentPeriodEnd && existingSub.currentPeriodEnd > new Date()) {
             baseDate = existingSub.currentPeriodEnd;
         }
         
         let expirationDate = new Date(baseDate);
         
         if (planType === "PRO") {
             expirationDate.setDate(expirationDate.getDate() + 7);
         } else if (planType === "MONTHLY") {
             expirationDate.setDate(expirationDate.getDate() + 31);
         }

         // Atualiza status do plano do Usuário para Ativo!
         await prisma.userSubscription.upsert({
             where: { userId: userId },
             create: {
                 userId: userId,
                 planType: planType,
                 caktoTransactionId: transactionId,
                 status: "ACTIVE",
                 currentPeriodEnd: expirationDate,
             },
             update: {
                 planType: planType,
                 caktoTransactionId: transactionId,
                 status: "ACTIVE",
                 currentPeriodEnd: expirationDate,
             },
         });

         // Finaliza a Transação como Paga
         await (prisma as any).transaction.upsert({
             where: { caktoTransactionId: transactionId },
             create: {
                 userId: userId,
                 caktoTransactionId: transactionId,
                 amount: amount || 0,
                 status: "PAID",
                 paymentMethod: paymentDetails.payment_method_id || "mercadopago",
                 customerEmail,
                 customerName,
             },
             update: {
                 status: "PAID",
             }
         });

         // Salva conversão real no Funil Analytics
         await (prisma as any).analyticEvent.create({
            data: {
                userId: userId,
                event: "purchase_approved",
                metadata: {
                    transactionId,
                    email: customerEmail,
                    product: planType
                }
            }
         });

         return new Response("Approved Payment! User access liberated.", { status: 200 });
      }

      return new Response("Event ignored for this status", { status: 200 });
    }

    return new Response("Not a payment event", { status: 200 });
  } catch (err) {
    console.error("Mercado Pago Webhook INTERNAL ERROR:", err);
    return new Response("Webhook Handler Failed", { status: 500 });
  }
}
