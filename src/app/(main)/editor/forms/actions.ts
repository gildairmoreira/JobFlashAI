"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateProfessionalSummary, improveWorkExperience } from "@/lib/gemini";
import { canUseAITools } from "@/lib/permissions";
import {
  GenerateSummaryInput,
  generateSummarySchema,
  GenerateWorkExperienceInput,
  generateWorkExperienceSchema,
} from "@/lib/validation";

export async function generateSummary(input: GenerateSummaryInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Não autorizado");
  }

  if (!canUseAITools()) {
    throw new Error("Atualize sua assinatura para usar este recurso");
  }

  const { jobTitle, workExperiences, educations, skills } =
    generateSummarySchema.parse(input);

  const summary = await generateProfessionalSummary({
    jobTitle,
    workExperiences,
    educations,
    skills,
  });

  revalidatePath("/editor");
   return summary;
}

export async function generateWorkExperience(
  input: GenerateWorkExperienceInput,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Não autorizado");
  }

  if (!canUseAITools()) {
    throw new Error("Atualize sua assinatura para usar este recurso");
  }

  const { description } = generateWorkExperienceSchema.parse(input);

  const workExperience = await improveWorkExperience(description);

  return workExperience;
}
