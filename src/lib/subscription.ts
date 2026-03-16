import { env } from "@/env";
import { PlanType } from "@prisma/client";
import { cache } from "react";
import prisma from "./prisma";

export type SubscriptionLevel = "free" | "pro" | "monthly" | "frozen" | "banned";

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

    // Handle MONTHLY plan directly
    if (subscription.planType === ("MONTHLY" as PlanType)) {
        // If MONTHLY, check for expiration
        if (subscription.currentPeriodEnd && subscription.currentPeriodEnd < new Date()) {
            // Expired -> auto freeze
            await prisma.userSubscription.update({
                where: { id: subscription.id },
                data: { status: "FROZEN" }
            });
            return "frozen";
        }
        return "monthly";
    }

    // Checking Expiration for PRO
    if (subscription.planType === "PRO") {
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
