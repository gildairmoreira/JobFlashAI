"use server";

import { canDuplicateResume } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { resumeDataInclude } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function deleteResume(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const resume = await prisma.resume.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  if (resume.photoUrl) {
    await del(resume.photoUrl);
  }

  await prisma.resume.delete({
    where: {
      id,
    },
  });

  revalidatePath("/resumes");
}

// Duplica um currículo existente com todas as seções e relações
export async function duplicateResume(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Verificar permissão de plano
  const subscriptionLevel = await getUserSubscriptionLevel(userId);
  if (!canDuplicateResume(subscriptionLevel)) {
    throw new Error("PLAN_REQUIRED");
  }

  // Buscar currículo original com todas as relações
  const original = await prisma.resume.findUnique({
    where: { id, userId },
    include: resumeDataInclude,
  });

  if (!original) {
    throw new Error("Resume not found");
  }

  // Criar cópia com novo título e data
  await prisma.resume.create({
    data: {
      userId,
      title: `Cópia de ${original.title || "Currículo"}`,
      description: original.description,
      photoUrl: original.photoUrl,
      colorHex: original.colorHex,
      borderStyle: original.borderStyle,
      templateId: original.templateId,
      fontFamily: original.fontFamily,
      summary: original.summary,
      firstName: original.firstName,
      lastName: original.lastName,
      jobTitle: original.jobTitle,
      city: original.city,
      country: original.country,
      phone: original.phone,
      email: original.email,
      socialLinks: original.socialLinks ?? [],
      skills: original.skills,
      workExperiences: {
        create: original.workExperiences.map((exp) => ({
          position: exp.position,
          company: exp.company,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description,
        })),
      },
      educations: {
        create: original.educations.map((edu) => ({
          degree: edu.degree,
          school: edu.school,
          startDate: edu.startDate,
          endDate: edu.endDate,
        })),
      },
      customSections: {
        create: original.customSections.map((section) => ({
          title: section.title,
          content: section.content,
        })),
      },
    },
  });

  revalidatePath("/resumes");
}
