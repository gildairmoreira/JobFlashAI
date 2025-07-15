"use server";

import { auth } from "@clerk/nextjs/server";
// import stripe from "@/lib/stripe";
// import { env } from "@/env";
import { redirect } from "next/navigation";

// Stripe functionality disabled - all premium features are now free
export async function createCheckoutSession(priceId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  // Mock checkout session - redirect directly to success since all features are free
  // const session = await stripe.checkout.sessions.create({
  //   payment_method_types: ["card"],
  //   line_items: [
  //     {
  //       price: priceId,
  //       quantity: 1,
  //     },
  //   ],
  //   mode: "subscription",
  //   success_url: `${env.NEXT_PUBLIC_BASE_URL}/billing/success`,
  //   cancel_url: `${env.NEXT_PUBLIC_BASE_URL}/billing`,
  //   metadata: {
  //     userId,
  //   },
  // });

  // Simulate successful checkout - redirect to success page
  redirect("/billing/success");
}