"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { runJobFitGeneration } from "@/lib/ai/job-fit-generator";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { canGenerateForJob } from "@/lib/permissions";

const MAX_JOB_FIT_USES_PER_MONTH = 10;

export async function createJobFitGeneration(sourceResumeId: string, jobDescription: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verificar plano PRO
  const subscriptionLevel = await getUserSubscriptionLevel(userId);
  if (!canGenerateForJob(subscriptionLevel)) {
    throw new Error("PRO_PLAN_REQUIRED");
  }

  // Verificar limite mensal
  // @ts-ignore
  const usage = await prisma.userUsage.findUnique({ where: { userId } });
  // @ts-ignore
  if (usage && usage.jobFitUsesThisMonth >= MAX_JOB_FIT_USES_PER_MONTH) {
    throw new Error("MONTHLY_LIMIT_REACHED");
  }

  // Verificar propriedade do currículo original (Prevenção de IDOR)
  const sourceResume = await prisma.resume.findFirst({
    where: { id: sourceResumeId, userId }
  });
  if (!sourceResume) {
    throw new Error("Source resume not found or unauthorized");
  }

  // Criar registro de geração
  // @ts-ignore
  const generation = await prisma.jobFitGeneration.create({
    data: {
      userId,
      sourceResumeId,
      jobDescription,
      status: "pending",
      sectionsCompleted: 0,
    },
  });

  // Atualizar contagem
  // @ts-ignore
  await prisma.userUsage.upsert({
    where: { userId },
    // @ts-ignore
    create: { userId, jobFitUsesThisMonth: 1 },
    // @ts-ignore
    update: { jobFitUsesThisMonth: { increment: 1 } },
  });

  // Disparar processamento em background (o Vercel serverless não cortará essa promessa se usarmos res.waitUntil na API, mas em server actions pode cortar dependendo da duração. O ideal é usar Inngest ou background jobs. Para o escopo do SaaS, se não demorar mais de 60s, o Next.js suporta via await sem blockar UI usando promise orquestrada, MAS a melhor forma aqui é devolver o ID e processar assíncrono ou o client fazer poll)
  // Como estamos num Server Action, a execução finaliza quando a response é enviada.
  // Vamos disparar e *não* aguardar. O Node.js pode tentar rodar em background.
  // Em prod (Vercel) isso pode ser cortado se a API terminar.
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
