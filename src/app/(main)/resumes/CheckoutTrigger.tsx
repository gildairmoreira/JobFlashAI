"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createCheckoutSession } from "@/components/premium/actions";
import { useToast } from "@/hooks/use-toast";

interface CheckoutTriggerProps {
  subscriptionLevel: string;
}

export default function CheckoutTrigger({ subscriptionLevel }: CheckoutTriggerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const hasTriggered = useRef(false);

  useEffect(() => {
    const plan = searchParams.get("plan");
    
    // Se o plano for reconhecido e o usuário não for master/pro
    if (plan && (plan === "pro" || plan === "monthly") && !hasTriggered.current) {
        
        // Se já for premium, não redireciona para não comprar de novo sem querer
        if (subscriptionLevel === "pro" || subscriptionLevel === "monthly") {
            return;
        }

        hasTriggered.current = true;
        
        const triggerCheckout = async () => {
            try {
                toast({
                    title: "Iniciando Checkout...",
                    description: "Preparando seu link de pagamento seguro.",
                });
                
                const redirectUrl = await createCheckoutSession(plan as "pro" | "monthly");
                
                // Limpa a URL ANTES de ir para o checkout para não entrar em loop ao voltar
                const newParams = new URLSearchParams(searchParams.toString());
                newParams.delete("plan");
                const newPath = `${window.location.pathname}${newParams.toString() ? '?' + newParams.toString() : ''}`;
                window.history.replaceState({}, '', newPath);

                if (redirectUrl) {
                    window.location.href = redirectUrl;
                }
            } catch (error) {
                console.error("Checkout Trigger Error:", error);
                toast({
                    variant: "destructive",
                    title: "Erro ao iniciar pagamento",
                    description: "Não foi possível carregar o checkout. Tente novamente.",
                });
            }
        };

        triggerCheckout();
    }
  }, [searchParams, subscriptionLevel, toast]);

  return null;
}
