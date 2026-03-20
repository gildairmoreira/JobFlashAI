"use client";

import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import { SubscriptionLevel } from "@/lib/subscription";
import { ResumeServerData } from "@/lib/types";
import { CheckCircle2, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";
import { createJobFitGeneration, getJobFitStatus } from "./job-actions";

interface JobFitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumes: ResumeServerData[];
  subscriptionLevel: SubscriptionLevel;
}

type Step = "job-description" | "select-resume" | "processing" | "done";

export default function JobFitModal({
  open,
  onOpenChange,
  resumes,
  subscriptionLevel,
}: JobFitModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const premiumModal = usePremiumModal();
  
  const [step, setStep] = useState<Step>("job-description");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    resumes[0]?.id || ""
  );
  
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [finishedResumeId, setFinishedResumeId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep("job-description");
      setJobDescription("");
      setProgress(0);
      setGenerationId(null);
      setFinishedResumeId(null);
      if (resumes.length > 0) {
        setSelectedResumeId(resumes[0].id);
      }
    }
  }, [open]);

  // Polling logic when in 'processing' step
  useEffect(() => {
    if (step !== "processing" || !generationId) return;

    const interval = setInterval(async () => {
      try {
        const statusData = await getJobFitStatus(generationId);
        
        // Pseudo progress calculations base on sectionsCompleted vs total possible steps (estimated at 5)
        setProgress(Math.min((statusData.sectionsCompleted / 5) * 100, 95));

        if (statusData.status === "done") {
          clearInterval(interval);
          setProgress(100);
          setFinishedResumeId(statusData.outputResumeId);
          setTimeout(() => setStep("done"), 500);
        } else if (statusData.status === "error") {
          clearInterval(interval);
          setStep("job-description");
          toast({
            variant: "destructive",
            title: "Erro na IA",
            description: statusData.errorMessage || "Ocorreu um erro ao gerar o currículo.",
          });
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [step, generationId, toast]);

  const handleNext = () => {
    // Everyone has access to Vaga-Fit now, we only stop them if they hit the limit,
    // which is checked in the backend createJobFitGeneration call.

    if (step === "job-description") {
      if (jobDescription.length < 50) {
        toast({
          variant: "destructive",
          description: "A descrição da vaga precisa ter no mínimo 50 caracteres para uma boa geração.",
        });
        return;
      }
      setStep("select-resume");
    } else if (step === "select-resume") {
      handleGenerate();
    }
  };

  const handleGenerate = () => {
    if (!selectedResumeId) return;

    startTransition(async () => {
      try {
        const genId = await createJobFitGeneration(selectedResumeId, jobDescription);
        setGenerationId(genId);
        setStep("processing");
      } catch (error: any) {
        if (error.message === "LIMIT_REACHED") {
          toast({
            variant: "destructive",
            title: "Limite Atingido",
            description: "Você já atingiu seu limite de gerações Vaga-Fit para o seu plano atual. Acesse a área de faturamento para renovar ou melhorar seu plano.",
          });
        } else if (error.message === "UNAUTHORIZED_PLAN") {
          onOpenChange(false);
          premiumModal.setOpen(true);
        } else {
          toast({
            variant: "destructive",
            title: "Ocorreu um erro",
            description: "Não foi possível iniciar a geração.",
          });
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (step === "processing") return; // Prevent closing while generating
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Vaga-Fit IA
          </DialogTitle>
          {step === "job-description" && (
            <DialogDescription>
              Cole a descrição da vaga desejada. A IA irá reescrever suas experiências e resumo para dar "match" com o ATS da empresa.
            </DialogDescription>
          )}
          {step === "select-resume" && (
            <DialogDescription>
              Selecione qual dos seus currículos será usado como base para gerar a nova versão. Seus dados pessoais não serão adulterados.
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4">
          {step === "job-description" && (
            <div className="space-y-4">
              <Label htmlFor="job-description">Descrição da Vaga</Label>
              <Textarea
                id="job-description"
                placeholder="Cole aqui os requisitos, responsabilidades e descrição da vaga..."
                className="min-h-[250px] resize-none"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {jobDescription.length} / 5000
              </p>
            </div>
          )}

          {step === "select-resume" && (
            <RadioGroup value={selectedResumeId} onValueChange={setSelectedResumeId} className="space-y-3">
              {resumes.map((res) => (
                <div key={res.id} className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value={res.id} id={res.id} />
                  <Label htmlFor={res.id} className="flex-1 cursor-pointer">
                    <span className="font-semibold block">{res.title || "Sem título"}</span>
                    <span className="text-xs text-muted-foreground mt-1 block line-clamp-1">
                      {res.jobTitle || "Sem cargo"} • Atualizado: {new Date(res.updatedAt).toLocaleDateString()}
                    </span>
                  </Label>
                </div>
              ))}
              {resumes.length === 0 && (
                <p className="text-sm text-center text-muted-foreground p-4">
                  Você ainda não tem currículos. Crie um primeiro.
                </p>
              )}
            </RadioGroup>
          )}

          {step === "processing" && (
            <div className="py-12 space-y-6 text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center relative">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Criando o currículo perfeito...</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                  Estamos reescrevendo seu resumo, alinhando suas métricas de experiência à vaga e sugerindo novas palavras-chave ATS. Pode levar até um minuto.
                </p>
              </div>
              <div className="max-w-xs mx-auto space-y-2">
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  Processando seções: {Math.round(progress)}%
                </p>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="py-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Currículo Gerado com Sucesso!</h3>
                <p className="text-muted-foreground mt-2">
                  Uma nova cópia totalmente otimizada para essa vaga foi salva na sua conta.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between flex-row">
          <div>
            {step === "select-resume" && (
              <Button type="button" variant="ghost" onClick={() => setStep("job-description")}>
                Voltar
              </Button>
            )}
          </div>
          <div>
            {step === "job-description" && (
              <Button onClick={handleNext} className="gap-2">
                Continuar <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            {step === "select-resume" && (
              <LoadingButton
                onClick={handleNext}
                loading={isPending}
                disabled={!selectedResumeId || resumes.length === 0}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" /> Gerar Currículo
              </LoadingButton>
            )}
            {step === "done" && finishedResumeId && (
              <Button
                onClick={() => {
                  onOpenChange(false);
                  router.push(`/editor?resumeId=${finishedResumeId}`);
                }}
              >
                Abrir no Editor
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
