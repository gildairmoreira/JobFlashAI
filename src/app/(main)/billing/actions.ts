"use server";

// import { env } from "@/env";
// import stripe from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";

// Stripe functionality disabled - billing portal not needed since all features are free
export async function createCustomerPortalSession() {
  const user = await currentUser();

  if (!user) {
    throw new Error("Não autorizado");
  }

  // Mock billing portal - return billing page since no payment management needed
  // const stripeCustomerId = user.privateMetadata.stripeCustomerId as
  //   | string
  //   | undefined;

  // if (!stripeCustomerId) {
  //   throw new Error("ID do cliente Stripe não encontrado");
  // }

  // const session = await stripe.billingPortal.sessions.create({
  //   customer: stripeCustomerId,
  //   return_url: `${env.NEXT_PUBLIC_BASE_URL}/billing`,
  // });

  // if (!session.url) {
  //   throw new Error("Falha ao criar sessão do portal do cliente");
  // }

  // Return billing page directly since no payment management needed
  return "/billing";
}
