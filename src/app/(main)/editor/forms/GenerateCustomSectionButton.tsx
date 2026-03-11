import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import LoadingButton from "@/components/LoadingButton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquare } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { generateCustomSection } from "./actions";

const formSchema = z.object({
  description: z.string().trim().min(1, "Obrigatório").min(20, "Deve ter pelo menos 20 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  onSectionGenerated: (title: string, content: string) => void;
};

import { useSubscriptionLevel } from "../../SubscriptionLevelProvider";
import usePremiumModal from "@/hooks/usePremiumModal";
import { canUseAITools } from "@/lib/permissions";

export default function GenerateCustomSectionButton({ onSectionGenerated }: Readonly<Props>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const subscriptionLevel = useSubscriptionLevel();
  const premiumModal = usePremiumModal();
  const isPremium = canUseAITools(subscriptionLevel);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { description: "" },
  });

  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCooldown && cooldownRemaining > 0) {
      timer = setTimeout(() => {
        setCooldownRemaining(cooldownRemaining - 1);
      }, 1000);
    } else if (cooldownRemaining === 0) {
      setIsCooldown(false);
    }
    return () => clearTimeout(timer);
  }, [isCooldown, cooldownRemaining]);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const aiResponse = await generateCustomSection({ description: values.description });
      const lines = aiResponse.trim().split('\n');
      const title = lines[0]?.trim() || 'Seção Personalizada';
      const content = lines.slice(1).join('\n').trim() || 'Conteúdo gerado pela IA baseado na descrição fornecida.';

      onSectionGenerated(title, content);
      setOpen(false);
      form.reset();

      // Start cooldown ONLY for free users to prevent spam
      if (!isPremium) {
         setIsCooldown(true);
         setCooldownRemaining(30);
      }
    } catch (error: any) {
      console.error("Failed to generate custom section:", error);
      if (error.message.includes("RATE_LIMIT_EXCEEDED")) {
         toast({
          variant: "destructive",
          title: "Alta Demanda 🔥",
          description: "Servidores gratuitos lotados no momento. Assine o plano PRO para servidores dedicados e geração instantânea!",
          duration: 6000,
        });
        setOpen(false);
        premiumModal.setOpen(true);
      } else {
        toast({
          variant: "destructive",
          description: "Algo deu errado. Tente novamente em instantes.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    if (!isPremium) {
      premiumModal.setOpen(true);
    } else {
      setOpen(true);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" type="button" onClick={handleOpenDialog}>
        <MessageSquare className="mr-2 size-4" />
        {isPremium ? "Gerar seção com IA" : "Desbloquear com Assinatura"}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar seção customizada</DialogTitle>
          <DialogDescription>
            Descreva em linguagem natural o que você quer na seção, como &quot;Seção de projetos com 3 projetos e links&quot;. A IA gerará tanto o título quanto o conteúdo da seção automaticamente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      placeholder="Ex: Quero uma seção de projetos com 3 projetos que eu fiz, incluindo links para eles. Sou desenvolvedor web."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton loading={loading || isCooldown} disabled={isCooldown}>
              {isCooldown ? `Aguarde ${cooldownRemaining}s...` : "Gerar"}
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}