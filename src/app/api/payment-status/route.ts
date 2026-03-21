import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// Retorna o status atual da assinatura e o currentPeriodEnd para comparação no client
// O client compara com o valor ANTERIOR ao checkout para detectar apenas NOVAS aprovações
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ paid: false }, { status: 401 });
  }

  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
    select: { status: true, planType: true, currentPeriodEnd: true },
  });

  return NextResponse.json({
    status: subscription?.status ?? null,
    planType: subscription?.planType ?? null,
    currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
  });
}
