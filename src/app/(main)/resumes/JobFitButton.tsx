"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import React, { useState } from "react";
import JobFitModal from "./JobFitModal";
import { ResumeServerData } from "@/lib/types";
import { SubscriptionLevel } from "@/lib/subscription";
import usePremiumModal from "@/hooks/usePremiumModal";
import { canGenerateForJob } from "@/lib/permissions";

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
        className="flex w-fit gap-2 border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary dark:text-primary-foreground dark:bg-primary/20 dark:hover:bg-primary/30"
      >
        <Sparkles className="size-5" />
        Gerar para Vaga
        {canGenerate && (
          <span className="ml-1 text-[10px] bg-background text-foreground px-1.5 py-0.5 rounded-sm font-bold shadow-sm">
            {usageCount}/10
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
