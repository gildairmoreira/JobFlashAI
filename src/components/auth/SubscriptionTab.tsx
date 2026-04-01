"use client";

import { useEffect, useState } from "react";
import { getUserSubscription } from "@/app/actions/auth-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import usePremiumModal from "@/hooks/usePremiumModal";

export function SubscriptionTab() {
    const premiumModal = usePremiumModal();
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSub() {
            try {
                const sub = await getUserSubscription();
                setSubscription(sub);
            } catch (error) {
                console.error("Erro ao buscar assinatura", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSub();
    }, []);

    if (loading) {
        return (
            <div className="flex h-40 flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Carregando dados da assinatura...</p>
            </div>
        );
    }

    const isPremium = subscription && subscription.planType !== "FREE";
    const planName = subscription?.planType === "PRO" ? "Plano PRO (7 Dias)" : subscription?.planType === "MONTHLY" ? "Plano MENSAL" : "Plano FREE";

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Detalhes do Plano
                </h3>
                
                <div className="rounded-xl border border-border/50 bg-muted/10 p-5 space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status Atual</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold tracking-tight">{planName}</span>
                                {isPremium ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 rounded-full">Ativo</Badge>
                                ) : (
                                    <Badge variant="outline" className="rounded-full">Grátis</Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {subscription?.currentPeriodEnd && (
                        <div className="pt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Expira em: <span className="font-semibold text-foreground">{new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}</span>
                        </div>
                    )}
                </div>
            </div>

            {isPremium ? (
                <div className="space-y-4">
                    <Button 
                        onClick={() => premiumModal.setOpen(true)} 
                        variant="outline"
                        className="w-full border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold py-6 rounded-2xl transition-all"
                    >
                        🚀 Estender Assinatura / Ver Planos
                    </Button>
                    
                    <div className="p-4 rounded-2xl border border-border/50 bg-muted/5">
                        <p className="text-[10px] sm:text-xs text-muted-foreground text-center leading-relaxed">
                            Para suporte ou cancelamento, entre em contato através do nosso canal de suporte.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
                    <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Melhore sua conta</p>
                            <p className="text-xs text-amber-800/80 dark:text-amber-200/60 leading-relaxed">
                                No plano Free você está limitado. Consiga o JobFit AI e analise seu currículo com inteligência para vagas reais.
                            </p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => premiumModal.setOpen(true)} 
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-6 rounded-xl"
                    >
                        Ver Planos Premium
                    </Button>
                </div>
            )}
        </div>
    );
}
