import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { resumeDataInclude } from "@/lib/types";
import AtsResumeCard from "./AtsResumeCard";
import { ArrowLeft, BarChart2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Avaliador ATS",
};

export default async function AtsEvaluatorPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Fetch resumes and their ATS scores
  const [resumes, subscriptionLevel] = await Promise.all([
    prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        ...resumeDataInclude,
        // @ts-ignore
        atsScore: true,
      },
    }),
    getUserSubscriptionLevel(userId),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
      <Link href="/resumes" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary w-fit transition-colors mb-2">
        <ArrowLeft className="size-4" />
        Voltar para Currículos
      </Link>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Avaliador de ATS</h1>
        </div>
        <p className="text-muted-foreground">
          Descubra como seu currículo se sai em sistemas de triagem automática e receba dicas personalizadas.
        </p>
      </div>

      {resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-muted-foreground">
          <p>Você ainda não tem nenhum currículo.</p>
          <p className="text-sm">Crie um currículo primeiro para poder avaliá-lo.</p>
        </div>
      ) : (
        <div className="flex w-full grid-cols-2 flex-col gap-4 sm:grid md:grid-cols-3 lg:grid-cols-4">
          {resumes.map((resume: any) => (
            <AtsResumeCard
              key={resume.id}
              resume={resume}
              // @ts-ignore
              atsScore={resume.atsScore}
              subscriptionLevel={subscriptionLevel}
            />
          ))}
        </div>
      )}
    </main>
  );
}
