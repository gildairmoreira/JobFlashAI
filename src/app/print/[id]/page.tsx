import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ResumePreview from "@/components/ResumePreview";
import { mapToResumeValues } from "@/lib/utils";
import SubscriptionLevelProvider from "@/app/(main)/SubscriptionLevelProvider";
import { getUserSubscriptionLevel } from "@/lib/subscription";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ secret?: string }>;
}

export default async function PrintPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Validate secret to prevent unauthorized access
  const secret = process.env.PDF_SECRET || "default_local_secret";
  if (resolvedSearchParams.secret !== secret) {
    return <div className="p-8 text-black">Unauthorized Access</div>;
  }

  const resume = await prisma.resume.findUnique({
    where: { id: resolvedParams.id },
    include: {
      workExperiences: true,
      educations: true,
      customSections: true,
    },
  });

  if (!resume) {
    notFound();
  }

  const subscriptionLevel = await getUserSubscriptionLevel(resume.userId);
  const resumeValues = mapToResumeValues(resume as any);

  return (
    <div className="flex justify-center bg-white min-h-screen" style={{ width: '794px', margin: '0 auto' }}>
      <SubscriptionLevelProvider userSubscriptionLevel={subscriptionLevel}>
        <ResumePreview resumeData={resumeValues} className="w-full h-full shadow-none border-0" />
      </SubscriptionLevelProvider>
    </div>
  );
}
