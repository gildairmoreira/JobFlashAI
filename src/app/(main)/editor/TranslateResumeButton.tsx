"use client";

// Botão de tradução de currículo — exclusivo para plano Mensal
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import usePremiumModal from "@/hooks/usePremiumModal";
import { useSubscriptionLevel } from "@/app/(main)/SubscriptionLevelProvider";
import { ResumeValues } from "@/lib/validation";
import { Languages, Loader2 } from "lucide-react";
import { useState } from "react";
import { translateResume } from "./translate-actions";
import { useToast } from "@/hooks/use-toast";

interface TranslateResumeButtonProps {
  resumeData: ResumeValues;
  setResumeData: (data: ResumeValues) => void;
}

export default function TranslateResumeButton({
  resumeData,
  setResumeData,
}: TranslateResumeButtonProps) {
  const subscriptionLevel = useSubscriptionLevel();
  const premiumModal = usePremiumModal();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Apenas plano mensal tem acesso
  const isMonthly = subscriptionLevel === "monthly";

  const isEn = resumeData.language === "en";
  const hasAlternate = !!resumeData.alternateLanguageData;

  function handleClick() {
    if (!isMonthly) {
      premiumModal.setOpen(true);
      return;
    }

    // Se já temos a versão alternativa, apenas trocamos (swap) sem perguntar ou chamar IA
    if (isEn || hasAlternate) {
      handleSwap();
      return;
    }

    setConfirmOpen(true);
  }

  function handleSwap() {
    const {
      jobTitle,
      summary,
      skills,
      workExperiences,
      educations,
      customSections,
      language,
      alternateLanguageData,
    } = resumeData;

    if (!alternateLanguageData) return;

    // Inverte os dados atuais com os dados da outra língua
    setResumeData({
      ...resumeData,
      jobTitle: alternateLanguageData.jobTitle,
      summary: alternateLanguageData.summary,
      skills: alternateLanguageData.skills,
      workExperiences: alternateLanguageData.workExperiences,
      educations: alternateLanguageData.educations,
      customSections: alternateLanguageData.customSections,
      language: alternateLanguageData.language,
      alternateLanguageData: {
        jobTitle,
        summary,
        skills,
        workExperiences,
        educations,
        customSections,
        language,
      },
    });

    toast({
      title: `Idioma alterado para ${alternateLanguageData.language === "en" ? "Inglês" : "Português"}`,
      description: "Conteúdo alternado instantaneamente.",
    });
  }

  async function handleConfirm() {
    setIsLoading(true);
    try {
      const translated = await translateResume(resumeData);

      // Mescla os campos traduzidos com os dados atuais, preservando campos não textuais
      // E salva o estado atual (PT) no alternateLanguageData para permitir o swap
      setResumeData({
        ...resumeData,
        ...(translated.jobTitle !== undefined && { jobTitle: translated.jobTitle }),
        ...(translated.summary !== undefined && { summary: translated.summary }),
        ...(translated.skills !== undefined && { skills: translated.skills }),
        language: "en",
        alternateLanguageData: {
          jobTitle: resumeData.jobTitle,
          summary: resumeData.summary,
          skills: resumeData.skills,
          workExperiences: resumeData.workExperiences,
          educations: resumeData.educations,
          customSections: resumeData.customSections,
          language: "pt",
        },
        workExperiences: translated.workExperiences
          ? resumeData.workExperiences?.map((exp, i) => ({
              ...exp,
              ...(translated.workExperiences?.[i] ?? {}),
            }))
          : resumeData.workExperiences,
        educations: translated.educations
          ? resumeData.educations?.map((edu, i) => ({
              ...edu,
              ...(translated.educations?.[i] ?? {}),
            }))
          : resumeData.educations,
        customSections: translated.customSections
          ? resumeData.customSections?.map((s, i) => ({
              ...s,
              ...(translated.customSections?.[i] ?? {}),
            }))
          : resumeData.customSections,
      });

      toast({
        title: "Currículo traduzido!",
        description: "Todo o conteúdo foi traduzido para inglês com sucesso.",
      });

      setConfirmOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado";
      toast({
        variant: "destructive",
        title: "Erro ao traduzir",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        title={
          isMonthly
            ? isEn
              ? "Voltar para Português"
              : "Traduzir currículo para inglês"
            : "Recurso exclusivo do plano Mensal"
        }
        onClick={handleClick}
        className="flex items-center gap-1.5 text-xs"
      >
        <Languages className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{isEn ? "PT" : "EN"}</span>
        {!isMonthly && (
          <span className="ml-0.5 rounded bg-amber-100 px-1 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            PRO
          </span>
        )}
      </Button>

      {/* Diálogo de confirmação antes de traduzir */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              Traduzir currículo para inglês
            </DialogTitle>
            <div className="space-y-2 pt-2 text-sm text-muted-foreground">
              <p>
                O Gemini irá traduzir automaticamente todo o conteúdo do seu
                currículo para <strong>inglês (EN-US)</strong> adaptado para
                recrutadores internacionais.
              </p>
              <p className="text-amber-600 dark:text-amber-400">
                ⚠️ As alterações serão aplicadas diretamente no editor. Você
                pode desfazer manualmente ou recarregar a página para reverter.
              </p>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traduzindo...
                </>
              ) : (
                <>
                  <Languages className="mr-2 h-4 w-4" />
                  Traduzir agora
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
