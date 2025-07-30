// import { env } from "@/env";
import { cache } from "react";
// import prisma from "./prisma";

export type SubscriptionLevel = "free" | "pro" | "pro_plus";

export const getUserSubscriptionLevel = cache(
  async (userId: string): Promise<SubscriptionLevel> => {
    // Temporariamente retornar 'pro_plus' para todos os usuários
    return "pro_plus";
  },
);
