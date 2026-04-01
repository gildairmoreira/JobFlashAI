"use client";

import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import { Check, Sparkles, Languages, Zap, ShieldCheck } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { createCheckoutSession } from "./actions";
import { getGlobalSettings } from "@/app/(main)/billing/actions";
import { getUserSubscription } from "@/app/actions/auth-actions";
import { cn } from "@/lib/utils";

export default function PremiumModal() {
  const { open, setOpen } = usePremiumModal();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = React.useState<any>(null);
  const [sub, setSub] = React.useState<any>(null);

  React.useEffect(() => {
    if (open) {
      getGlobalSettings().then(setSettings);
      getUserSubscription().then(setSub);
    }
  }, [open]);

  const proPrice = settings?.proPrice ? `R$ ${settings.proPrice.toFixed(2).replace('.', ',')}` : "R$ 19,90";
  const monthlyPrice = settings?.monthlyPrice ? `R$ ${settings.monthlyPrice.toFixed(2).replace('.', ',')}` : "R$ 49,90";

  async function handlePremiumClick(priceId: "pro" | "monthly") {
    try {
      setLoading(true);
      const redirectUrl = await createCheckoutSession(priceId);
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error('URL de redirecionamento não encontrada');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Algo deu errado. Por favor, tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!loading) {
          setOpen(open);
        }
      }}
    >
      <DialogContent className="max-w-[95vw] sm:max-w-2xl p-0 border-none bg-white dark:bg-stone-950 shadow-2xl rounded-[2rem] max-h-[90vh] flex flex-col outline-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 z-50" />
        
        <div className="overflow-y-auto p-6 sm:p-8 pt-4 sm:pt-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">            <DialogHeader className="mb-4 text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 dark:text-white">
              Escolha seu <span className="text-indigo-600">Plano Premium</span>
            </DialogTitle>
            
            {sub?.currentPeriodEnd && new Date(sub.currentPeriodEnd) > new Date() ? (
              <div className="mt-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 p-2 rounded-xl flex items-center justify-center gap-2">
                <Zap className="w-3 h-3 text-indigo-600" />
                <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-tight">
                  Benefício Ativo: Seus novos dias serão somados ao vencimento atual!
                </p>
              </div>
            ) : (
              <p className="text-stone-500 dark:text-stone-400 mt-1 text-xs sm:text-sm px-2">
                Desbloqueie ferramentas de IA e destaque-se no mercado.
              </p>
            )}
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PLANO SEMANAL */}
          <div className="bg-stone-50 dark:bg-stone-900/50 p-6 rounded-[2rem] border border-stone-100 dark:border-stone-800 flex flex-col justify-between transition-all hover:border-stone-200 dark:hover:border-stone-700">
            <div>
              <div className="mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">ESSENCIAL</span>
                <h3 className="text-xl font-black text-stone-900 dark:text-white mt-1">Semanal</h3>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-stone-900 dark:text-white">{proPrice}</span>
                  <span className="text-stone-400 text-xs font-bold">/ 7 dias</span>
                </div>
              </div>

              <ul className="space-y-2 mb-4">
                <FeatureItem label="5 Currículos ativos" />
                <FeatureItem label="Sugestões de IA completas" />
                <FeatureItem label="Exportação PDF HD" />
                <FeatureItem label="Tradução por IA" disabled />
              </ul>
            </div>

            <Button
              onClick={() => handlePremiumClick('pro')}
              className="w-full py-6 font-bold rounded-2xl bg-white dark:bg-stone-800 text-stone-900 dark:text-white hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 shadow-sm transition active:scale-[0.98]"
              disabled={loading}
            >
              {sub?.currentPeriodEnd && new Date(sub.currentPeriodEnd) > new Date() ? "Adicionar +7 Dias" : "Começar Semanal"}
            </Button>
          </div>

          {/* PLANO MENSAL */}
          <div className="relative group p-[2px] rounded-[2rem] overflow-hidden">
            {/* Gradiente Animado de Borda */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 animate-gradient" />
            
            <div className="relative bg-white dark:bg-stone-950 p-6 rounded-[calc(2rem-2px)] h-full flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <div className="inline-flex items-center gap-1 bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest mb-2">
                    ⭐ RECOMENDADO
                  </div>
                  <h3 className="text-xl font-black text-stone-900 dark:text-white mt-0.5">Mensal</h3>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-stone-900 dark:text-white">{monthlyPrice}</span>
                    <span className="text-stone-400 text-xs font-bold">/ mês</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  <FeatureItem label="Currículos ILIMITADOS" highlight />
                  <FeatureItem label="Tradução Profissional (IA)" highlight icon={<Languages className="w-4 h-4" />} />
                  <FeatureItem label="Design Premium Exclusivo" />
                  <FeatureItem label="Suporte Prioritário" />
                </ul>
              </div>

              <Button
                variant="premium"
                onClick={() => handlePremiumClick('monthly')}
                className="w-full py-6 font-black rounded-2xl text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition active:scale-[0.98]"
                disabled={loading}
              >
                {sub?.currentPeriodEnd && new Date(sub.currentPeriodEnd) > new Date() ? "🔥 Adicionar +31 Dias" : "🔥 Ativar Mensal"}
              </Button>
            </div>
          </div>

          </div>
        </div>

        <div className="px-8 pb-6 flex items-center justify-center gap-4 opacity-40 shrink-0">
          <div className="flex items-center gap-1.5 grayscale">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Pagamento Seguro</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeatureItem({ label, disabled, highlight, icon }: { label: string, disabled?: boolean, highlight?: boolean, icon?: React.ReactNode }) {
  return (
    <li className={cn(
      "flex items-center gap-2.5 text-xs sm:text-sm transition-opacity",
      disabled ? "opacity-30 grayscale" : "opacity-100",
      highlight ? "font-bold text-indigo-600 dark:text-indigo-400" : "text-stone-600 dark:text-stone-400"
    )}>
      <div className={cn(
        "shrink-0 p-0.5 rounded-full",
        disabled ? "bg-stone-200 dark:bg-stone-800" : highlight ? "bg-indigo-100 dark:bg-indigo-900/30" : "bg-stone-100 dark:bg-stone-800"
      )}>
        {icon || <Check className={cn("w-3.5 h-3.5", disabled ? "text-stone-400" : "text-indigo-600 dark:text-indigo-400")} />}
      </div>
      <span className={disabled ? "line-through italic" : ""}>{label}</span>
    </li>
  );
}
