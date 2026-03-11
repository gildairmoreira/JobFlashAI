import prisma from "@/lib/prisma";
import { resumeDataInclude } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import ResumeEditor from "./ResumeEditor";
import { canCreateResume } from "@/lib/permissions";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ resumeId?: string }>;
}

export const metadata: Metadata = {
  title: "Crie seu currículo",
};

export default async function Page({ searchParams }: PageProps) {
  const { resumeId } = await searchParams;

  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const resumeToEdit = resumeId
    ? await prisma.resume.findUnique({
        where: { id: resumeId, userId },
        include: resumeDataInclude,
      })
    : null;

  if (!resumeToEdit) {
    const [resumeCount, subscriptionLevel] = await Promise.all([
      prisma.resume.count({ where: { userId } }),
      getUserSubscriptionLevel(userId),
    ]);

    if (!canCreateResume(subscriptionLevel, resumeCount)) {
      redirect("/resumes");
    }
  }

  return <ResumeEditor resumeToEdit={resumeToEdit} />;
}
