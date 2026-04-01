import { canCreateResume, canImportResume } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { resumeDataInclude } from "@/lib/types";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Metadata } from "next";
import { BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ResumeItem from "./ResumeItem";
import Link from "next/link";
import { getUserJobFitUsage } from "./job-actions";
import JobFitButton from "./JobFitButton";
import CreateResumeButtonWrapper from "./CreateResumeButtonWrapper";
import CheckoutTrigger from "./CheckoutTrigger";
import ImportResumeButton from "./ImportResumeButton";

export const metadata: Metadata = {
  title: "Seus currículos",
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return null;
  }

  const userId = session.user.id;

  const [resumes, totalCount, subscriptionLevel, jobFitUsage] = await Promise.all([
    prisma.resume.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: resumeDataInclude,
    }),
    prisma.resume.count({
      where: {
        userId,
      },
    }),
    getUserSubscriptionLevel(userId),
    getUserJobFitUsage(),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-3 py-6 relative">
      <CheckoutTrigger subscriptionLevel={subscriptionLevel} />
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
        <div className="space-y-1 w-full md:w-1/3 text-center md:text-left order-2 md:order-1">
          <h1 className="text-3xl font-bold">Seus currículos</h1>
          <p className="text-muted-foreground">Total: {totalCount}</p>
        </div>
        
        <div className="w-full md:w-1/3 flex flex-col sm:flex-row justify-center gap-3 order-1 md:order-2">
          <CreateResumeButtonWrapper
            canCreate={canCreateResume(subscriptionLevel, totalCount)}
            subscriptionLevel={subscriptionLevel}
          />
          <div className="md:hidden w-full">
            <ImportResumeButton
              canCreate={canCreateResume(subscriptionLevel, totalCount)}
              canImport={canImportResume(subscriptionLevel)}
            />
          </div>
        </div>

        <div className="flex w-full md:w-1/3 items-center justify-center md:justify-end gap-3 order-3">
          <JobFitButton 
            resumes={resumes} 
            subscriptionLevel={subscriptionLevel} 
            usageCount={jobFitUsage} 
          />
          <Button asChild variant="secondary" className="flex gap-2 shrink-0">
            <Link href="/ats-evaluator" prefetch={false}>
              <BarChart2 className="size-4" />
              <span className="hidden sm:inline">Avaliar ATS</span>
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="flex w-full grid-cols-2 flex-col gap-3 sm:grid md:grid-cols-3 lg:grid-cols-4">
        {resumes.map((resume: any, index: number) => {
          const isLocked = index >= 1 && subscriptionLevel !== "pro" && subscriptionLevel !== "monthly";
          
          return (
            <ResumeItem
              key={resume.id}
              resume={resume}
              subscriptionLevel={subscriptionLevel}
              isLocked={isLocked}
            />
          );
        })}
      </div>
    </main>
  );
}
