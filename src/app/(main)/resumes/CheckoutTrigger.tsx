"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createCheckoutSession } from "@/components/premium/actions";
import { useToast } from "@/hooks/use-toast";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

interface CheckoutTriggerProps {
  subscriptionLevel: string;
}

export default function CheckoutTrigger({ subscriptionLevel }: CheckoutTriggerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const hasTriggered = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const plan = searchParams.get("plan");
    
    // Se o plano for reconhecido e o usuário não for master/pro
    if (plan && (plan === "pro" || plan === "monthly") && !hasTriggered.current) {
        
        // Se o usuário clicar em um plano que ele já tem OU quer fazer upgrade, permitimos o redirect.
        // O Mercado Pago/Backend lida com a soma de dias ou troca de plano.
        // Apenas evitamos loops infinitos usando a ref hasTriggered.
        
        hasTriggered.current = true;
        
        const triggerCheckout = async () => {
            try {
                setIsLoading(true);
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
                setIsLoading(false);
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

  return isLoading ? <LoadingOverlay /> : null;
}
