import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import usePremiumModal from "@/hooks/usePremiumModal";
import { canUseAITools } from "@/lib/permissions";
import {
  GenerateWorkExperienceInput,
  generateWorkExperienceSchema,
  WorkExperience,
} from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { WandSparklesIcon } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
// Not checking subscription here because WorkExp has 1 free usage
import { generateWorkExperience } from "./actions";

interface GenerateWorkExperienceButtonProps {
  onWorkExperienceGenerated: (workExperience: WorkExperience) => void;
}

export default function GenerateWorkExperienceButton({
  onWorkExperienceGenerated,
}: GenerateWorkExperienceButtonProps) {
  //const subscriptionLevel = useSubscriptionLevel();

  const premiumModal = usePremiumModal();

  const [showInputDialog, setShowInputDialog] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        type="button"
        onClick={() => {
          setShowInputDialog(true);
        }}
      >
        <WandSparklesIcon className="size-4" />
        Preenchimento inteligente (IA - 1x Grátis)
      </Button>
      <InputDialog
        open={showInputDialog}
        onOpenChange={setShowInputDialog}
        onWorkExperienceGenerated={(workExperience) => {
          onWorkExperienceGenerated(workExperience);
          setShowInputDialog(false);
        }}
        onPremiumRequired={() => {
          setShowInputDialog(false);
          premiumModal.setOpen(true);
        }}
      />
    </>
  );
}

interface InputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkExperienceGenerated: (workExperience: WorkExperience) => void;
  onPremiumRequired: () => void;
}

function InputDialog({
  open,
  onOpenChange,
  onWorkExperienceGenerated,
  onPremiumRequired,
}: InputDialogProps) {
  const { toast } = useToast();

  const form = useForm<GenerateWorkExperienceInput>({
    resolver: zodResolver(generateWorkExperienceSchema),
    defaultValues: {
      description: "",
    },
  });

  async function onSubmit(input: GenerateWorkExperienceInput) {
    try {
      const response = await generateWorkExperience(input);
      onWorkExperienceGenerated(response);
    } catch (error: any) {
      console.error(error);
      if (error.message.includes("FREE_LIMIT_REACHED")) {
        toast({
          variant: "destructive",
          description: "Você já usou seu teste grátis 😢",
        });
        onPremiumRequired();
      } else {
        toast({
          variant: "destructive",
          description: "Algo deu errado. Verifique se o texto não é muito grande.",
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar experiência profissional</DialogTitle>
          <DialogDescription>
            Descreva esta experiência profissional e a IA gerará uma entrada otimizada para você.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={`Ex.: "de nov 2019 a dez 2020 trabalhei no Google como engenheiro de software, minhas tarefas eram: ..."`}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton loading={form.formState.isSubmitting}>
              Gerar
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
