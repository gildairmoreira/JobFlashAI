"use server";

import { generateWithRetry } from "@/lib/gemini";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { ResumeValues } from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";

// Tipos dos campos que serão traduzidos
interface TranslateResumeInput {
  jobTitle?: string;
  summary?: string;
  workExperiences?: Array<{
    position?: string;
    company?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  }>;
  educations?: Array<{
    degree?: string;
    school?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
  }>;
  skills?: string[];
  customSections?: Array<{
    title?: string;
    content?: string;
  }>;
}

// Retorno parcial com apenas os campos textuais traduzidos
interface TranslatedFields {
  jobTitle?: string;
  summary?: string;
  workExperiences?: Array<{
    position?: string;
    company?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  }>;
  educations?: Array<{
    degree?: string;
    school?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
  }>;
  skills?: string[];
  customSections?: Array<{
    title?: string;
    content?: string;
  }>;
  language?: string;
}

export async function translateResume(
  resumeData: ResumeValues
): Promise<TranslatedFields> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Não autorizado");
  }

  // Verifica se o nível de assinatura é mensal
  const subscriptionLevel = await getUserSubscriptionLevel(userId);
  if (subscriptionLevel !== "monthly") {
    throw new Error("MONTHLY_REQUIRED");
  }

  // Monta o payload de dados textuais
  const input: TranslateResumeInput = {
    jobTitle: resumeData.jobTitle,
    summary: resumeData.summary,
    workExperiences: resumeData.workExperiences?.map((exp) => ({
      position: exp.position,
      company: exp.company,
      description: exp.description,
      startDate: exp.startDate,
      endDate: exp.endDate,
    })),
    educations: resumeData.educations?.map((edu) => ({
      degree: edu.degree,
      school: edu.school,
      startDate: edu.startDate,
      endDate: edu.endDate,
    })),
    skills: resumeData.skills,
    customSections: resumeData.customSections?.map((s) => ({
      title: s.title,
      content: s.content,
    })),
  };

  const systemMessage = `You are a professional resume translator specializing in HR and recruitment.
Translate the provided resume JSON from Brazilian Portuguese (PT-BR) to English (EN-US).

CRITICAL RULES:
1. Translate ONLY text values — do NOT change JSON keys, dates, URLs, or email addresses.
2. Use natural, professional English appropriate for international recruiters.
3. Adapt job titles and descriptions culturally (e.g., "Estágio" → "Internship", "Analista Sênior" → "Senior Analyst").
4. Keep bullet points, formatting structure, and line breaks intact.
5. Return ONLY valid JSON, no markdown code blocks, no explanations.
6. If a field is empty or null, keep it as-is.
7. Company names should NOT be translated.`;

  const userMessage = `Translate this resume data to English:\n${JSON.stringify(input, null, 2)}`;

  const aiResponse = await generateWithRetry(systemMessage, userMessage);

  // Limpa a resposta removendo possíveis blocos de código Markdown
  const cleaned = aiResponse
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as TranslatedFields;
    parsed.language = "en";
    return parsed;
  } catch {
    throw new Error("Falha ao processar a resposta da IA. Tente novamente.");
  }
}
