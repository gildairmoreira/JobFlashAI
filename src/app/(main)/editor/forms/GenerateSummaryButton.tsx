import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import { canUseAITools } from "@/lib/permissions";
import { ResumeValues } from "@/lib/validation";
import { WandSparklesIcon } from "lucide-react";
import React, { useState } from "react";
import { useSubscriptionLevel } from "../../SubscriptionLevelProvider";
import { generateSummary } from "./actions";

interface GenerateSummaryButtonProps {
  resumeData: ResumeValues;
  onSummaryGenerated: (summary: string) => void;
}

export default function GenerateSummaryButton({
  resumeData,
  onSummaryGenerated,
}: GenerateSummaryButtonProps) {
  const subscriptionLevel = useSubscriptionLevel();

  const premiumModal = usePremiumModal();

  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!subscriptionLevel || !canUseAITools(subscriptionLevel)) {
      premiumModal.setOpen(true);
      return;
    }

    try {
      setLoading(true);
      const aiResponse = await generateSummary(resumeData);
      onSummaryGenerated(aiResponse);
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("RATE_LIMIT_EXCEEDED")) {
         toast({
          variant: "destructive",
          title: "Alta Demanda 🔥",
          description: "Os servidores estão com alta carga no momento. Por favor, tente novamente em alguns instantes.",
          duration: 6000,
        });
      } else {
        toast({
          variant: "destructive",
          description: "Algo deu errado. Tente novamente em instantes.",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const isPremium = canUseAITools(subscriptionLevel);

  return (
    <LoadingButton
      variant="outline"
      type="button"
      onClick={handleClick}
      loading={loading}
    >
      <WandSparklesIcon className="size-4 mr-2" />
      {isPremium ? "Gerar resumo com IA" : "Desbloquear com Assinatura"}
    </LoadingButton>
  );
}
