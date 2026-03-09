import { env } from "@/env";
import { cache } from "react";
import prisma from "./prisma";

export type SubscriptionLevel = "free" | "pro" | "lifetime" | "frozen" | "banned";

export const getUserSubscriptionLevel = cache(
  async (userId: string): Promise<SubscriptionLevel> => {
    const subscription = await prisma.userSubscription.findUnique({
      where: {
        userId,
      },
    });

    if (!subscription) {
      return "free"; // Default if not found
    }

    // Checking status
    if (subscription.status === "BANNED") {
      return "banned";
    }

    if (subscription.status === "FROZEN") {
      return "frozen";
    }

    // Checking Expiration for PRO and LIFETIME (which now acts as Monthly)
    if (subscription.planType === "PRO" || subscription.planType === "LIFETIME") {
      if (subscription.currentPeriodEnd && subscription.currentPeriodEnd < new Date()) {
        // Expired -> auto freeze
        await prisma.userSubscription.update({
          where: { id: subscription.id },
          data: { status: "FROZEN" }
        });
        return "frozen";
      }
      return subscription.planType.toLowerCase() as SubscriptionLevel;
    }

    return "free";
  },
);
