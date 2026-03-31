"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { runJobFitGeneration } from "@/lib/ai/job-fit-generator";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { canGenerateForJob, getJobFitLimit } from "@/lib/permissions";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"), // Limite mais restrito para processos pesados
  analytics: true,
});

export async function createJobFitGeneration(sourceResumeId: string, jobDescription: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { success } = await ratelimit.limit(userId);
  if (!success) {
    throw new Error("Você atingiu o limite de requisições. Tente novamente em 1 minuto.");
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
    // @ts-ignore
    const usage = await tx.userUsage.findUnique({ where: { userId } });
    // @ts-ignore
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
    // @ts-ignore
    await tx.userUsage.upsert({
      where: { userId },
      // @ts-ignore
      create: { userId, jobFitUsesThisMonth: 1 },
      // @ts-ignore
      update: { jobFitUsesThisMonth: { increment: 1 } },
    });

    // 4. Criar registro de geração
    // @ts-ignore
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

  // Disparar processamento em background (o Netlify serverless não cortará essa promessa se usarmos res.waitUntil na API, mas em server actions pode cortar dependendo da duração. O ideal é usar Inngest ou background jobs. Para o escopo do SaaS, se não demorar mais de 60s, o Next.js suporta via await sem blockar UI usando promise orquestrada, MAS a melhor forma aqui é devolver o ID e processar assíncrono ou o client fazer poll)
  // Como estamos num Server Action, a execução finaliza quando a response é enviada.
  // Vamos disparar e *não* aguardar. O Node.js pode tentar rodar em background.
  // Em prod (Netlify) isso pode ser cortado se a API terminar.
  // O ideal no Next.js App Router é chamar a função e fazer await, mas mantendo a conexão longa, ou chamar uma rota de API via fetch que faz o background (se for Edge).
  // Para fins do Next.js sem deps externas, faremos chamada assíncrona "fire-and-forget" local.
  runJobFitGeneration(generation.id, userId).catch(console.error);

  return generation.id;
}

export async function getJobFitStatus(generationId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // @ts-ignore
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
  const { userId } = await auth();
  if (!userId) return 0;
  // @ts-ignore
  const usage = await prisma.userUsage.findUnique({ where: { userId } });
  // @ts-ignore
  return usage?.jobFitUsesThisMonth ?? 0;
}
