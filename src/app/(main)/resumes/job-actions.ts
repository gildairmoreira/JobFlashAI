"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { runJobFitGeneration } from "@/lib/ai/job-fit-generator";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { canGenerateForJob, getJobFitLimit } from "@/lib/permissions";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    ratelimit = new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL.replace(/^"|"$/g, ''),
        token: process.env.UPSTASH_REDIS_REST_TOKEN.replace(/^"|"$/g, ''),
      }),
      limiter: Ratelimit.slidingWindow(3, "1 m"),
      analytics: true,
    });
  }
} catch (err) {
  console.warn("Upstash Redis não configurado. Rate limiting desativado.");
}

export async function createJobFitGeneration(sourceResumeId: string, jobDescription: string) {
  try {
    let session;
    try {
      session = await auth.api.getSession({
        headers: await headers(),
      });
    } catch (e: any) {
      return { success: false, error: "Auth falhou (fetch): " + e.message };
    }

    if (!session || !session.user) return { success: false, error: "Unauthorized" };
    
    const userId = session.user.id;

    if (ratelimit) {
      try {
        const { success } = await ratelimit.limit(userId);
        if (!success) {
          return { success: false, error: "LIMIT_REACHED_RATELIMIT" };
        }
      } catch (e: any) {
        console.warn("Upstash falhou (fetch), ignorando rate limit temporariamente:", e.message);
        // Falha de forma tolerante (fail-open) para não quebrar a aplicação caso o Redis caia ou esteja mal configurado.
      }
    }

    const subscriptionLevel = await getUserSubscriptionLevel(userId);
    if (!canGenerateForJob(subscriptionLevel)) {
      return { success: false, error: "UNAUTHORIZED_PLAN" };
    }

    // Verificar limite dinâmico
    const limit = getJobFitLimit(subscriptionLevel);

    // TRANSACTIONAL FLOW: Prevenção de Condições de Corrida (Race Conditions)
    // Garante que o usuário não ultrapasse o limite em requisições paralelas
    const generation = await prisma.$transaction(async (tx) => {
      // 1. Verificar limite dinâmico
      const usage = await tx.userUsage.findUnique({ where: { userId } });
      if (usage && usage.jobFitUsesThisMonth >= limit) {
        throw new Error("LIMIT_REACHED");
      }

      // 2. Verificar propriedade do currículo original (Prevenção de IDOR)
      const sourceResume = await tx.resume.findFirst({
        where: { id: sourceResumeId, userId }
      });
      if (!sourceResume) {
        throw new Error("Source resume not found or unauthorized");
      }

      // 3. Registrar o uso preventivamente (Atomic Update)
      await tx.userUsage.upsert({
        where: { userId },
        create: { userId, jobFitUsesThisMonth: 1 },
        update: { jobFitUsesThisMonth: { increment: 1 } },
      });

      // 4. Criar registro de geração
      return await tx.jobFitGeneration.create({
        data: {
          userId,
          sourceResumeId,
          jobDescription,
          status: "pending",
          sectionsCompleted: 0,
        },
      });
    });

    // Disparar processamento em background
    runJobFitGeneration(generation.id, userId).catch(console.error);

    return { success: true, generationId: generation.id };
  } catch (error: any) {
    console.error("Erro no createJobFitGeneration:", error);
    return { success: false, error: error.message || "Ocorreu um erro interno." };
  }
}

export async function getJobFitStatus(generationId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) throw new Error("Unauthorized");

  const userId = session.user.id;

  const generation = await prisma.jobFitGeneration.findFirst({
    where: { id: generationId, userId },
    select: {
      status: true,
      sectionsCompleted: true,
      errorMessage: true,
      outputResumeId: true,
    },
  });

  if (!generation) throw new Error("Not found");
  return generation;
}

export async function getUserJobFitUsage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) return 0;
  
  const userId = session.user.id;

  const usage = await prisma.userUsage.findUnique({ where: { userId } });
  return usage?.jobFitUsesThisMonth ?? 0;
}
