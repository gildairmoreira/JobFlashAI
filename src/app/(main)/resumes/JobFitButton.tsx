"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import React, { useState } from "react";
import JobFitModal from "./JobFitModal";
import { ResumeServerData } from "@/lib/types";
import { SubscriptionLevel } from "@/lib/subscription";
import usePremiumModal from "@/hooks/usePremiumModal";
import { canGenerateForJob, getJobFitLimit } from "@/lib/permissions";

interface JobFitButtonProps {
  resumes: ResumeServerData[];
  subscriptionLevel: SubscriptionLevel;
  usageCount: number;
}

export default function JobFitButton({
  resumes,
  subscriptionLevel,
  usageCount,
}: JobFitButtonProps) {
  const [open, setOpen] = useState(false);
  const premiumModal = usePremiumModal();
  
  const canGenerate = canGenerateForJob(subscriptionLevel);
  const limit = getJobFitLimit(subscriptionLevel);

  const handleClick = () => {
    if (!canGenerate) {
      premiumModal.setOpen(true);
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant="secondary"
        className="flex w-fit gap-2 border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary dark:bg-primary/10 dark:hover:bg-primary/20 transition-all font-semibold"
      >
        <Sparkles className="size-5" />
        <span className="hidden sm:inline">Vaga-Fit IA</span>
        <span className="sm:hidden">Gerar</span>
        {canGenerate && (
          <span className="ml-1 text-[11px] bg-background border border-primary/10 text-foreground px-1.5 py-0.5 rounded-md font-bold shadow-sm">
            {usageCount}/{limit}
          </span>
        )}
      </Button>

      {canGenerate && (
        <JobFitModal
          open={open}
          onOpenChange={setOpen}
          resumes={resumes}
          subscriptionLevel={subscriptionLevel}
        />
      )}
    </>
  );
}
