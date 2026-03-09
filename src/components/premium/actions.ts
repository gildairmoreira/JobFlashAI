'use server';

import { auth, currentUser } from '@clerk/nextjs/server';

export async function createCheckoutSession(planType: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Usuário não autenticado');

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error('Email do usuário não encontrado');

  // Use actual Cakto payment links
  const CAKTO_PRO_CHECKOUT_URL = process.env.CAKTO_PRO_CHECKOUT_URL || "https://pay.cakto.com.br/t5u3oq5_799648";
  const CAKTO_LIFETIME_CHECKOUT_URL = process.env.CAKTO_LIFETIME_CHECKOUT_URL || "https://pay.cakto.com.br/okwgghz_799577";

  let checkoutUrl = planType === 'pro' ? CAKTO_PRO_CHECKOUT_URL : CAKTO_LIFETIME_CHECKOUT_URL;

  // Append user data to the URL so that Cakto fires the webhook with clerk_user_id
  const urlParams = new URLSearchParams({
    "metadata[clerk_user_id]": userId,
    "email": email, // Pre-fill email
  });

  return `${checkoutUrl}?${urlParams.toString()}`;
}