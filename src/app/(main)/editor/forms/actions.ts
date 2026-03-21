"use server";

import { canUseAITools } from "@/lib/permissions";
import genAI from "@/lib/gemini";
import prisma from "@/lib/prisma";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import {
  GenerateSummaryInput,
  generateSummarySchema,
  GenerateWorkExperienceInput,
  generateWorkExperienceSchema,
  WorkExperience,
} from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";



import { generateWithRetry } from "@/lib/gemini";
import crypto from "crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
});

// Helper to generate a consistent hash for caching
function generateCacheKey(systemMessage: string, userMessage: string): string {
  return crypto.createHash("sha256").update(systemMessage + userMessage).digest("hex");
}

export async function getUserAILimits() {
  const { userId } = await auth();
  if (!userId) return { exp: 0, summary: 0, custom: 0 };

  const userUsage = await (prisma as any).userUsage.findUnique({
    where: { userId },
  });

  return {
    exp: (userUsage as any)?.aiExperienceUses || 0,
    summary: (userUsage as any)?.aiSummaryUses || 0,
    custom: (userUsage as any)?.aiCustomUses || 0,
  };
}

export async function generateSummary(input: GenerateSummaryInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Não autorizado");
  }

  const { success } = await ratelimit.limit(userId);
  if (!success) {
    throw new Error("Você atingiu o limite de requisições. Tente novamente em 1 minuto.");
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Atualize sua assinatura para usar este recurso");
  }

  const { jobTitle, workExperiences, educations, skills } =
    generateSummarySchema.parse(input);

  const systemMessage = `
    Você é um gerador de currículos de emprego com IA. Sua tarefa é escrever um resumo de introdução profissional para um currículo com base nos dados fornecidos pelo usuário.
    IMPORTANTE: Escreva SEMPRE em primeira pessoa de forma BASTANTE natural e humana ("Tenho vasta experiência em...", "Atuei como...", "Sou experiente com..."). NUNCA use aspas, nunca seja robótico, e NUNCA use frases impessoais do tipo "possui conhecimento em" ou "é um profissional".
    Retorne apenas o resumo e não inclua nenhuma outra informação na resposta. Mantenha-o conciso, profissional e envolvente.
    `;

  const userMessage = `
    Please generate a professional resume summary from this data:

    Job title: ${jobTitle || "N/A"}

    Work experience:
    ${workExperiences
      ?.map(
        (exp) => `
        Cargo: ${exp.position || "N/A"} na ${exp.company || "N/A"} de ${exp.startDate || "N/A"} até ${exp.endDate || "Presente"}

        Descrição:
        ${exp.description || "N/A"}
        `,
      )
      .join("\n\n")}

      Educação:
    ${educations
      ?.map(
        (edu) => `
        Grau: ${edu.degree || "N/A"} na ${edu.school || "N/A"} de ${edu.startDate || "N/A"} até ${edu.endDate || "N/A"}
        `,
      )
      .join("\n\n")}

      Habilidades:
      ${skills}
    `;

  const cacheKey = generateCacheKey(systemMessage, userMessage);

  // 1. Check Cache
  const cachedResult = await (prisma as any).aiGenerationCache.findUnique({
    where: { promptHash: cacheKey }
  });

  if (cachedResult) {
     console.log("[CACHE HIT] Returning cached summary.");
     return cachedResult.result;
  }

  // 2. Generate with Retry & Tuning
  const aiResponse = await generateWithRetry(systemMessage, userMessage);

  // 3. Save to Cache
  try {
     await (prisma as any).aiGenerationCache.create({
         data: {
             promptHash: cacheKey,
             result: aiResponse
         }
     });
  } catch(e) { /* ignore duplicate key errors if concurrent */ }

  return aiResponse;
}

export async function generateWorkExperience(
  input: GenerateWorkExperienceInput,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { success } = await ratelimit.limit(userId);
  if (!success) {
    throw new Error("Você atingiu o limite de requisições. Tente novamente em 1 minuto.");
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);
  const isFreeUser = !canUseAITools(subscriptionLevel);

  if (isFreeUser) {
    // For free users, check if they have used their 1 free generation
    const userUsage = await (prisma as any).userUsage.findUnique({
      where: { userId },
    });

    if (userUsage && userUsage.aiExperienceUses >= 1) {
      throw new Error("FREE_LIMIT_REACHED");
    }

    // Increment usage -> We'll do this ONLY if generation succeeds to avoid burning the limit on errors
  }

  const { description } = generateWorkExperienceSchema.parse(input);

  const systemMessage = `
  Você é um gerador de currículos de emprego com IA. Sua tarefa é gerar uma única entrada de experiência profissional com base na entrada do usuário.
  IMPORTANTE: Na descrição, escreva sempre em primeira pessoa ("Desenvolvi", "Implementei", "Colaborei", etc.), de forma muito natural e com tom de dono do projeto. NUNCA use terceira pessoa ou voz passiva ("foi desenvolvido", "possui familiaridade").
  Sua resposta deve aderir à seguinte estrutura. Você pode omitir campos se eles não puderem ser inferidos dos dados fornecidos, mas não adicione novos.

  Cargo: <cargo>
  Empresa: <nome da empresa>
  Data de início: <formato: AAAA-MM-DD> (somente se fornecido)
  Data de término: <formato: AAAA-MM-DD> (somente se fornecido)
  Descrição: <uma descrição otimizada em formato de bullet, pode ser inferida do cargo>
  `;

  const userMessage = `
  Forneça uma entrada de experiência profissional a partir desta descrição:
  ${description}
  `;

  const cacheKey = generateCacheKey(systemMessage, userMessage);

  let aiResponse = "";
  let isCached = false;

  // 1. Check Cache
  const cachedResult = await (prisma as any).aiGenerationCache.findUnique({
    where: { promptHash: cacheKey }
  });

  if (cachedResult) {
      console.log("[CACHE HIT] Returning cached work experience.");
      aiResponse = cachedResult.result;
      isCached = true;
  } else {
     // 2. Generate
     aiResponse = await generateWithRetry(systemMessage, userMessage);
     
     // 3. Save Cache
     try {
         await (prisma as any).aiGenerationCache.create({
             data: { promptHash: cacheKey, result: aiResponse }
         });
     } catch(e) { }
  }

  // 4. If Free User and not cached (actually performed work), increment usages
  // Actually, even if cached, they are "using" their perk.
  if (isFreeUser) {
      await (prisma as any).userUsage.upsert({
        where: { userId },
        update: { aiExperienceUses: { increment: 1 } },
        create: { userId, aiExperienceUses: 1 },
      });
  }

  return {
    position: aiResponse.match(/Cargo:\s*(.*)/i)?.[1]?.trim() || "",
    company: aiResponse.match(/Empresa:\s*(.*)/i)?.[1]?.trim() || "",
    description: (aiResponse.match(/Descrição:([\s\S]*)/i)?.[1] || "").trim(),
    startDate: aiResponse.match(/Data de início:\s*(\d{4}-\d{2}-\d{2})/i)?.[1],
    endDate: aiResponse.match(/Data de término:\s*(\d{4}-\d{2}-\d{2})/i)?.[1],
  } satisfies WorkExperience;
}

export async function generateCustomSection(input: { description: string }) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Não autorizado");
  }

  const { success } = await ratelimit.limit(userId);
  if (!success) {
    throw new Error("Você atingiu o limite de requisições. Tente novamente em 1 minuto.");
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Atualize sua assinatura para usar este recurso");
  }

  const { description } = input;

  const systemMessage = `
    Você é um assistente de IA especializado em criar seções personalizadas para currículos.
    
    INSTRUÇÕES IMPORTANTES:
    1. SEMPRE crie conteúdo baseado EXATAMENTE na descrição fornecida pelo usuário
    2. NUNCA peça mais informações, diga que está incompleta ou gere conteúdo genérico não relacionado
    3. Use criatividade apenas para expandir os detalhes fornecidos de forma profissional, mantendo fidelidade ao input
    4. Escreva sempre em primeira pessoa ("Desenvolvi", "Criei", "Implementei")
    5. Use formatação Markdown (listas, negrito, itálico, links)
    6. Para seções de projetos: Gere uma lista com os projetos mencionados, incluindo descrições breves, tecnologias e placeholders para links de repositório ([Link do Repositório](url)) e deploy ([Link do Deploy](url))
    7. O objetivo é gerar um template editável para o usuário preencher detalhes adicionais
    8. Sempre comece com um título apropriado como a primeira linha em texto simples, sem cabeçalhos Markdown como # ou ### (ex: Projetos), seguido do conteúdo em Markdown.
    
    Exemplo de formato para projetos se for da area de tecnologia:
    Projetos
    - **Projeto Cripto Currency**: Desenvolvi um aplicativo de criptomoedas usando API CoinGecko. Tecnologias: React, JavaScript. [Link do Repositório](https://github.com/seu-repo) | [Link do Deploy](https://deploy-url.com)
    - **Gerador de Currículo com IA**: Criei um gerador de currículos usando Gemini AI. Tecnologias: Next.js, TypeScript. [Link do Repositório](https://github.com/seu-repo) | [Link do Deploy](https://deploy-url.com)
    - **Jogo em Python**: Implementei um jogo usando Pygame para disciplina de OOP. Tecnologias: Python, Pygame. [Link do Repositório](https://github.com/seu-repo) | [Link do Deploy](https://deploy-url.com)
    
    IMPORTANTE: O título deve ser texto simples sem formatação Markdown. Foque em gerar um template com título e conteúdo, nada mais. Expanda apenas o necessário para torná-lo profissional e editável.
  `;

  const userMessage = `Crie uma seção personalizada para currículo baseada na seguinte descrição: ${description}`;

  const cacheKey = generateCacheKey(systemMessage, userMessage);
  
  const cachedResult = await (prisma as any).aiGenerationCache.findUnique({
    where: { promptHash: cacheKey }
  });

  if (cachedResult) {
      console.log("[CACHE HIT] Returning cached custom section.");
      return cachedResult.result;
  }

  const aiResponse = await generateWithRetry(systemMessage, userMessage);

  try {
     await (prisma as any).aiGenerationCache.create({
         data: { promptHash: cacheKey, result: aiResponse }
     });
  } catch(e) {}

  return aiResponse;
}
