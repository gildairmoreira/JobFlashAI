"use client";

import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import { SubscriptionLevel } from "@/lib/subscription";
import { ResumeServerData } from "@/lib/types";
import {
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Info,
  Lock,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { AtsEvaluationDetails, evaluateResumeAts } from "./actions";
import { AtsThermometer } from "./AtsThermometer";

interface ATSDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resume: ResumeServerData;
  atsScore: any;
  subscriptionLevel: SubscriptionLevel;
}

export default function ATSDetailModal({
  open,
  onOpenChange,
  resume,
  atsScore,
  subscriptionLevel,
}: ATSDetailModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const premiumModal = usePremiumModal();
  const [isPending, startTransition] = useTransition();

  const details = atsScore?.details
    ? (atsScore.details as unknown as AtsEvaluationDetails)
    : null;
  const score = atsScore?.score ?? 0;

  const isStale =
    atsScore && new Date(atsScore.updatedAt) < new Date(resume.updatedAt);
  const showBlur = subscriptionLevel !== "pro" && subscriptionLevel !== "monthly";

  const handleEvaluate = () => {
    if (subscriptionLevel === "free") {
      premiumModal.setOpen(true);
      return;
    }

    startTransition(async () => {
      try {
        await evaluateResumeAts(resume.id);
        toast({
          title: "Avaliação concluída!",
          description: "A pontuação ATS do seu currículo foi atualizada.",
        });
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Erro na avaliação",
          description: "Não foi possível gerar a pontuação. Tente novamente.",
        });
      }
    });
  };

  const getScoreColor = (sc: number) => {
    if (sc < 50) return "text-red-500 bg-red-500";
    if (sc < 75) return "text-yellow-500 bg-yellow-500";
    if (sc < 90) return "text-green-400 bg-green-400";
    return "text-emerald-500 bg-emerald-500";
  };

  const getScoreTextColor = (sc: number) => {
    if (sc < 50) return "text-red-600 dark:text-red-400";
    if (sc < 75) return "text-yellow-600 dark:text-yellow-400";
    if (sc < 90) return "text-green-600 dark:text-green-400";
    return "text-emerald-600 dark:text-emerald-400";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-xl">
              Análise ATS: {resume.title || "Sem título"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isStale && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md flex items-center gap-1 font-medium">
                  <AlertTriangle className="h-3 w-3" />
                  Desatualizado
                </span>
              )}
              <LoadingButton
                variant={atsScore ? "outline" : "default"}
                size="sm"
                onClick={handleEvaluate}
                loading={isPending}
                className="gap-2"
              >
                {atsScore ? (
                  <>
                    <RefreshCcw className="h-4 w-4" /> Recalcular
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Avaliar Agora
                  </>
                )}
              </LoadingButton>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/editor?resumeId=${resume.id}`)}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" /> Editor
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          {!atsScore && !isPending ? (
            <div className="py-24 text-center px-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Descubra sua pontuação</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Nossa IA simula os mesmos algoritmos usados por recrutadores (ATS)
                e verifica se seu currículo passa nos filtros iniciais.
              </p>
              <div className="flex justify-center">
                <LoadingButton onClick={handleEvaluate} loading={isPending} className="w-full max-w-xs">
                  {subscriptionLevel === "free" ? "Desbloquear com Pro" : "Iniciar Avaliação"}
                </LoadingButton>
              </div>
            </div>
          ) : !details ? (
            <div className="py-24 text-center px-6">
              <RefreshCcw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Avaliando propriedades semânticas...</p>
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {/* Header: Score Ring + Executive Summary */}
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start bg-secondary/50 rounded-xl p-6 border shadow-sm">
                <div className="relative h-40 w-40 shrink-0">
                  <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" className="stroke-muted fill-transparent" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42"
                      className={`fill-transparent transition-all duration-1000 ease-in-out ${getScoreColor(score).split(" ")[0]}`}
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 - (score / 100) * (2 * Math.PI * 42)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-5xl font-black tracking-tighter ${getScoreTextColor(score)}`}>
                      {score}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">
                      / 100
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-6 text-center md:text-left">
                  <div className="w-full max-w-sm mx-auto md:mx-0">
                    <AtsThermometer score={score} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-2">Visão Geral</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {details.resumo_executivo}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-900">
                      <p className="text-xs font-semibold text-green-800 dark:text-green-400 mb-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Pontos Fortes
                      </p>
                      <p className="text-xl font-bold text-green-700 dark:text-green-500">
                        {details.pontos_fortes.length}
                      </p>
                    </div>
                    <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 border border-red-200 dark:border-red-900">
                      <p className="text-xs font-semibold text-red-800 dark:text-red-400 mb-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> P/ Melhorar
                      </p>
                      <p className="text-xl font-bold text-red-700 dark:text-red-500">
                        {details.pontos_de_melhoria.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categorias */}
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  Métricas Detalhadas
                </h3>
                <div className="grid gap-3">
                  {Object.entries(details.categorias).map(([key, cat]) => (
                    <div key={key} className="bg-card border rounded-lg p-4">
                      <div className="flex justify-between items-end mb-2">
                        <div className="space-y-1">
                          <p className="font-semibold capitalize text-sm">
                            {key.replace("_", " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">{cat.feedback}</p>
                        </div>
                        <p className="text-sm font-bold bg-muted px-2 py-0.5 rounded">
                          {cat.score} <span className="text-muted-foreground font-normal">/ {cat.max}</span>
                        </p>
                      </div>
                      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getScoreColor((cat.score / cat.max) * 100).split(" ")[1]}`}
                          style={{ width: `${(cat.score / cat.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Tips (Gated) */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Dicas Acionáveis Priorizadas
                </h3>

                <div className="relative">
                  <div className={`space-y-3 ${showBlur ? "blur-sm select-none" : ""}`}>
                    {details.dicas_acionaveis.map((tp, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 bg-card border rounded-lg p-4 shadow-sm"
                      >
                        <div
                          className={`mt-0.5 rounded-full p-1 border ${
                            tp.prioridade === "alta"
                              ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-950/20"
                              : tp.prioridade === "media"
                                ? "bg-yellow-50 border-yellow-200 text-yellow-600 dark:bg-yellow-950/20"
                                : "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/20"
                          }`}
                        >
                          {tp.prioridade === "alta" ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : tp.prioridade === "media" ? (
                            <Info className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-relaxed">{tp.dica}</p>
                          <p className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${
                            tp.prioridade === "alta" ? "text-red-500" : tp.prioridade === "media" ? "text-yellow-500" : "text-blue-500"
                          }`}>
                            Prioridade {tp.prioridade}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {showBlur && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[2px] rounded-xl border border-dashed border-primary/50">
                      <div className="bg-card border shadow-xl rounded-2xl p-6 max-w-md text-center">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                          <Lock className="h-6 w-6 text-primary" />
                        </div>
                        <h4 className="text-lg font-bold mb-2">Desbloqueie Dicas Exclusivas</h4>
                        <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                          Assine o plano <strong>PRO</strong> para ver exatamente o que mudar no seu currículo para burlar os robôs do ATS e ser chamado para a entrevista.
                        </p>
                        <Button
                          className="w-full font-bold"
                          onClick={() => {
                            onOpenChange(false);
                            premiumModal.setOpen(true);
                          }}
                        >
                          Fazer Upgrade Agora
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
