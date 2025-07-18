import { env } from "@/env";
import { cache } from "react";
import prisma from "./prisma";

export type SubscriptionLevel = "free" | "pro" | "pro_plus";

export const getUserSubscriptionLevel = cache(
  async (userId: string): Promise<SubscriptionLevel> => {
    // All users now have pro_plus access - payment system disabled
    return "pro_plus";
    
    // Original subscription logic commented out
    // const subscription = await prisma.userSubscription.findUnique({
    //   where: {
    //     userId,
    //   },
    // });

    // if (!subscription || subscription.stripeCurrentPeriodEnd < new Date()) {
    //   return "free";
    // }

    // if (
    //   subscription.stripePriceId === env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY
    // ) {
    //   return "pro";
    // }

    // if (
    //   subscription.stripePriceId ===
    //   env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY
    // ) {
    //   return "pro_plus";
    // }

    // throw new Error("Assinatura inválida");
  },
);
