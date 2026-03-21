import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// Verifica se o pagamento do usuário atual foi aprovado
// Chamado a cada 3 segundos pelo checkout client via polling
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ paid: false }, { status: 401 });
  }

  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
    select: { status: true, planType: true, currentPeriodEnd: true },
  });

  // Considera pago se a assinatura ficou ACTIVE com uma data futura de expiração
  const isPaid =
    subscription?.status === "ACTIVE" &&
    subscription.currentPeriodEnd !== null &&
    subscription.currentPeriodEnd > new Date();

  return NextResponse.json({
    paid: isPaid,
    planType: subscription?.planType ?? null,
  });
}
