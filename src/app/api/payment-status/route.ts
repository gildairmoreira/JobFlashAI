import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";

// Retorna o status atual da assinatura e o currentPeriodEnd para comparação no client
// Se o paymentId for fornecido, consulta ativamente a API do MP (útil para feedback imediato do PIX)
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ paid: false }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("paymentId");

  let subscription = await prisma.userSubscription.findUnique({
    where: { userId },
    select: { status: true, planType: true, currentPeriodEnd: true },
  });

  if (paymentId) {
    // Evita conflito com o webhook verificando se já foi pago via Transaction
    const existingTx = await prisma.transaction.findUnique({
      where: { caktoTransactionId: paymentId }
    });

    if (existingTx?.status !== "PAID") {
      try {
        const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
        const payment = new Payment(client);
        const paymentDetails = await payment.get({ id: paymentId });
        
        const status = paymentDetails.status;

        if (status === "approved" || status === "authorized") {
          const extRef = paymentDetails.external_reference || "";
          const pipeIdx = extRef.indexOf("|");
          const planTypeStr = pipeIdx !== -1 ? extRef.substring(pipeIdx + 1) : "MONTHLY";
          const planType = planTypeStr.toUpperCase() as "PRO" | "MONTHLY" | "FREE";

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
          const customerEmail = paymentDetails.payer?.email ?? "";
          const customerName = paymentDetails.payer?.first_name ?? "";

          // Ativa o plano do usuário ativamente
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

          // Registra a transação como paga para o webhook ignorar depois
          await prisma.transaction.upsert({
            where: { caktoTransactionId: paymentId },
            create: {
              userId,
              caktoTransactionId: paymentId,
              amount,
              status: "PAID",
              paymentMethod: paymentDetails.payment_method_id ?? "mercadopago",
              customerEmail,
              customerName,
            },
            update: { status: "PAID" },
          });

          subscription = updatedSub;
          console.log(`🚀 Polling MP Fast Track: Plano ${planType} ativado no frontend para userId=${userId} até ${expirationDate.toISOString()}`);
        }
      } catch (error) {
        console.error("Erro ao verificar status ativamente na API do MP no polling:", error);
      }
    }
  }

  return NextResponse.json({
    status: subscription?.status ?? null,
    planType: subscription?.planType ?? null,
    currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
  });
}
