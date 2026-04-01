import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";

// Sincroniza o status de todas as transações com o Mercado Pago
// Detecta estornos (refunds), pagamentos rejeitados e atualiza o banco local
export async function POST() {
  // Verifica se o usuário é admin
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const userId = session.user.id;
  const userSub = await prisma.userSubscription.findUnique({ where: { userId } });
  const isMaster = session.user.email === "gildair457@gmail.com";
  const isAdmin = isMaster || userSub?.role === "ADMIN" || userSub?.role === "MASTER_ADMIN";

  if (!isAdmin) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({ error: "MERCADOPAGO_ACCESS_TOKEN não configurado" }, { status: 500 });
  }

  const client = new MercadoPagoConfig({ accessToken });
  const paymentApi = new Payment(client);

  // Busca todas as transações PAID do banco
  const paidTransactions = await (prisma as any).transaction.findMany({
    where: { status: "PAID" },
    select: { id: true, caktoTransactionId: true, userId: true },
  });

  let synced = 0;
  let refunded = 0;
  let cancelled = 0;
  let errors = 0;
  const details: { id: string; oldStatus: string; newStatus: string }[] = [];

  for (const tx of paidTransactions) {
    try {
      // Consulta o status atual do pagamento no Mercado Pago
      const paymentDetails = await paymentApi.get({ id: tx.caktoTransactionId });
      const mpStatus = paymentDetails.status;

      if (mpStatus === "refunded" || mpStatus === "charged_back") {
        // Marca a transação como REFUNDED no banco
        await (prisma as any).transaction.update({
          where: { id: tx.id },
          data: { status: "REFUNDED" },
        });

        // Se o plano do usuário depende SOMENTE dessa transação, desativa
        const userSubscription = await prisma.userSubscription.findUnique({
          where: { userId: tx.userId },
        });

        if (userSubscription?.caktoTransactionId === tx.caktoTransactionId) {
          await prisma.userSubscription.update({
            where: { userId: tx.userId },
            data: { planType: "FREE", currentPeriodEnd: null },
          });
        }

        refunded++;
        details.push({ id: tx.caktoTransactionId, oldStatus: "PAID", newStatus: "REFUNDED" });
      } else if (mpStatus === "cancelled" || mpStatus === "rejected") {
        await (prisma as any).transaction.update({
          where: { id: tx.id },
          data: { status: mpStatus === "cancelled" ? "CANCELLED" : "REFUSED" },
        });
        cancelled++;
        details.push({ id: tx.caktoTransactionId, oldStatus: "PAID", newStatus: mpStatus.toUpperCase() });
      }
      // Se o status ainda é approved, não faz nada

      synced++;
    } catch (err: any) {
      console.error(`[sync-refunds] Erro ao consultar pagamento ${tx.caktoTransactionId}:`, err?.message || err);
      errors++;
    }
  }

  console.log(`[sync-refunds] Concluído: ${synced} verificados, ${refunded} estornados, ${cancelled} cancelados, ${errors} erros`);

  return NextResponse.json({
    total: paidTransactions.length,
    synced,
    refunded,
    cancelled,
    errors,
    details,
  });
}
