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
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, "1 m"),
      analytics: true,
    });
  }
} catch (err) {
  console.warn("Upstash Redis não configurado. Rate limiting desativado.");
}

export async function createJobFitGeneration(sourceResumeId: string, jobDescription: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) throw new Error("Unauthorized");
  
  const userId = session.user.id;

  if (ratelimit) {
    const { success } = await ratelimit.limit(userId);
    if (!success) {
      throw new Error("Você atingiu o limite de requisições. Tente novamente em 1 minuto.");
    }
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);
  if (!canGenerateForJob(subscriptionLevel)) {
    throw new Error("UNAUTHORIZED_PLAN");
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

  return generation.id;
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
