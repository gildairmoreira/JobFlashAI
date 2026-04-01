'use server';

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createCheckoutSession(planType: "pro" | "monthly") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error('Usuário não autenticado');
  }

  const email = session.user.email;
  if (!email) throw new Error('Email do usuário não encontrado');

  // Direciona o usuário para o nosso checkout transparente
  return `/checkout?plan=${planType}`;
}