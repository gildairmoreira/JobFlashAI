"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateWithRetry } from "@/lib/gemini";
import { Resume, WorkExperience, Education, CustomSection } from "@prisma/client";

// Tipos para parse do JSON
export interface AtsEvaluationCategory {
  score: number;
  max: number;
  feedback: string;
}

export interface AtsEvaluationDetails {
  score_total: number;
  categorias: {
    formatacao: AtsEvaluationCategory;
    palavras_chave: AtsEvaluationCategory;
    estrutura_secoes: AtsEvaluationCategory;
    completude: AtsEvaluationCategory;
    legibilidade: AtsEvaluationCategory;
  };
  pontos_fortes: string[];
  pontos_de_melhoria: string[];
  dicas_acionaveis: { prioridade: "alta" | "media" | "baixa"; dica: string }[];
  resumo_executivo: string;
}

// Helper to convert resume to plain text for LLM
function serializeResumeToPlainText(
  resume: Resume & {
    workExperiences: WorkExperience[];
    educations: Education[];
    customSections: CustomSection[];
  }
): string {
  let text = `Nome: ${resume.firstName} ${resume.lastName}\n`;
  if (resume.jobTitle) text += `Cargo Desejado: ${resume.jobTitle}\n`;
  if (resume.summary) text += `Resumo:\n${resume.summary}\n\n`;

  if (resume.workExperiences.length > 0) {
    text += `EXPERIÊNCIA PROFISSIONAL:\n`;
    for (const exp of resume.workExperiences) {
      text += `- ${exp.position} em ${exp.company}\n`;
      if (exp.description) text += `  Atividades:\n  ${exp.description}\n`;
    }
    text += "\n";
  }

  if (resume.educations.length > 0) {
    text += `EDUCAÇÃO:\n`;
    for (const edu of resume.educations) {
      text += `- ${edu.degree} em ${edu.school}\n`;
    }
    text += "\n";
  }

  if (resume.skills && resume.skills.length > 0) {
    text += `HABILIDADES: ${resume.skills.join(", ")}\n\n`;
  }

  if (resume.customSections.length > 0) {
    for (const sec of resume.customSections) {
      text += `${sec.title?.toUpperCase() || "OUTROS"}:\n${sec.content}\n\n`;
    }
  }

  return text;
}

export async function evaluateResumeAts(resumeId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const resume = await prisma.resume.findUnique({
    where: { id: resumeId, userId },
    include: {
      workExperiences: true,
      educations: true,
      customSections: true,
    },
  });

  if (!resume) throw new Error("Resume not found");

  const plainText = serializeResumeToPlainText(resume);

  const systemPrompt = `Você é um especialista em sistemas ATS (Applicant Tracking System) e recrutamento corporativo. 
Sua tarefa é avaliar um currículo e retornar uma pontuação objetiva de compatibilidade com sistemas ATS.
Retorne APENAS um JSON válido, sem nenhum texto antes ou depois, sem markdown (sem \`\`\`json). NUNCA invente informações.`;

  const userPrompt = `Avalie o seguinte currículo segundo critérios ATS e retorne um JSON com EXATAMENTE esta estrutura:
{
  "score_total": <número inteiro 0-100>,
  "categorias": {
    "formatacao": { "score": <0-20>, "max": 20, "feedback": "<1 frase direta>" },
    "palavras_chave": { "score": <0-25>, "max": 25, "feedback": "<1 frase direta>" },
    "estrutura_secoes": { "score": <0-20>, "max": 20, "feedback": "<1 frase direta>" },
    "completude": { "score": <0-20>, "max": 20, "feedback": "<1 frase direta>" },
    "legibilidade": { "score": <0-15>, "max": 15, "feedback": "<1 frase direta>" }
  },
  "pontos_fortes": ["<string>", "<string>", "<string>"],
  "pontos_de_melhoria": ["<string>", "<string>", "<string>"],
  "dicas_acionaveis": [
    { "prioridade": "alta", "dica": "<ação específica>" },
    { "prioridade": "alta", "dica": "<ação específica>" },
    { "prioridade": "media", "dica": "<ação específica>" },
    { "prioridade": "baixa", "dica": "<ação específica>" }
  ],
  "resumo_executivo": "<2-3 frases resumindo a avaliação geral>"
}

CURRÍCULO PARA AVALIAR:
${plainText}`;

  // Consider rate limiting logic here if necessary in the future
  
  const responseText = await generateWithRetry(systemPrompt, userPrompt);

  let parsedDetails: AtsEvaluationDetails;
  try {
    // Strip markdown formatting if the model accidentally includes it
    const cleanJson = responseText.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    parsedDetails = JSON.parse(cleanJson);

    // Basic validation
    if (parsedDetails.score_total === undefined || !parsedDetails.categorias) {
       throw new Error("Invalid structure");
    }
  } catch (error) {
    console.error("Failed to parse ATS LLM response:", responseText, error);
    throw new Error("Failed to process ATS evaluation. Invalid response from AI.");
  }

  // Save to DB
  // @ts-ignore
  await prisma.resumeAtsScore.upsert({
    where: { resumeId: resume.id },
    create: {
      userId,
      resumeId: resume.id,
      score: parsedDetails.score_total,
      details: parsedDetails as any, // Prisma doesn't strictly type JSON fields for TS inference easily
    },
    update: {
      score: parsedDetails.score_total,
      details: parsedDetails as any,
    },
  });

  revalidatePath("/ats-evaluator");
  return parsedDetails;
}
