"use client";

import { env } from "@/env";
import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { createCheckoutSession } from "./actions";

const premiumFeatures = ["Ferramentas de IA", "Até 3 currículos"];
const premiumPlusFeatures = ["Currículos ilimitados", "Personalizações de design"];

export default function PremiumModal() {
  const { open, setOpen } = usePremiumModal();

  // All premium features are now free - no payment processing needed
  // const { toast } = useToast();
  // const [loading, setLoading] = useState(false);

  // async function handlePremiumClick(priceId: string) {
  //   try {
  //     setLoading(true);
  //     const redirectUrl = await createCheckoutSession(priceId);
  //     window.location.href = redirectUrl;
  //   } catch (error) {
  //     console.error(error);
  //     toast({
  //       variant: "destructive",
  //       description: "Algo deu errado. Tente novamente.",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>🎉 JobFlashAI - Todas as funcionalidades liberadas!</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-lg mb-4">Ótimas notícias! Todas as funcionalidades premium estão agora disponíveis gratuitamente!</p>
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-green-700">Funcionalidades Incluídas:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <ul className="space-y-2">
                    {premiumFeatures.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="size-4 text-green-500" />
                        <span className="text-green-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <ul className="space-y-2">
                    {premiumPlusFeatures.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="size-4 text-green-500" />
                        <span className="text-green-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setOpen(false)}
              className="mt-6 bg-green-600 hover:bg-green-700"
            >
              Começar a usar agora!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
