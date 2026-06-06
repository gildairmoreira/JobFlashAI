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
      include: {
        user: true,
      }
    });

    if (!subscription) {
      return "free"; // Default if not found
    }

    // Admins bypass expiration and freezing
    const isMaster = subscription.user.email === "gildair457@gmail.com";
    if (isMaster || subscription.role === "ADMIN" || subscription.role === "MASTER_ADMIN") {
      return "pro"; 
    }

    // Checking status
    if (subscription.status === "BANNED") {
      return "banned";
    }

    // Handle MONTHLY plan directly
    if (subscription.planType === ("MONTHLY" as PlanType)) {
        // If MONTHLY, check for expiration
        if (subscription.currentPeriodEnd && subscription.currentPeriodEnd < new Date()) {
            // Expired -> change to FREE
            await prisma.userSubscription.update({
                where: { id: subscription.id },
                data: { planType: "FREE" }
            });
            return "free";
        }
        return "monthly";
    }

    // Checking Expiration for PRO
    if (subscription.planType === "PRO") {
      if (subscription.currentPeriodEnd && subscription.currentPeriodEnd < new Date()) {
        // Expired -> change to FREE
        await prisma.userSubscription.update({
          where: { id: subscription.id },
          data: { planType: "FREE" }
        });
        return "free";
      }
      return subscription.planType.toLowerCase() as SubscriptionLevel;
    }

    if (subscription.status === "FROZEN") {
      return "frozen";
    }

    return "free";
  },
);
