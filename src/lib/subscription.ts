import { env } from "@/env";
import { cache } from "react";
import prisma from "./prisma";

export type SubscriptionLevel = "free" | "pro" | "pro_plus";

export const getUserSubscriptionLevel = cache(
  async (userId: string): Promise<SubscriptionLevel> => {
    const subscription = await prisma.userSubscription.findUnique({
      where: {
        userId,
      },
    });

    if (!subscription || subscription.currentPeriodEnd < new Date()) {
      return "free";
    }

    if (subscription) {
      // For now, any active subscription is treated as "pro"
      return "pro";
    }

    throw new Error("Invalid subscription");
  },
);
