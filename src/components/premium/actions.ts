'use server';

import { auth, currentUser } from '@clerk/nextjs/server';

export async function createCheckoutSession(planType: "pro" | "monthly") {
  const { userId } = await auth();
  if (!userId) throw new Error('Usuário não autenticado');

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error('Email do usuário não encontrado');

  // Direciona o usuário para o nosso checkout transparente
  return `/checkout?plan=${planType}`;
}