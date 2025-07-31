import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import LoadingButton from "@/components/LoadingButton";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
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

export default function GenerateCustomSectionButton({ onSectionGenerated }: Readonly<Props>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { description: "" },
  });

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const aiResponse = await generateCustomSection({ description: values.description });
      // Parse the AI response to extract title and content
      // Como a IA agora gera apenas conteúdo sem título, usar toda a resposta como content
      const lines = aiResponse.trim().split('\n');
      let title = lines[0]?.trim() || 'Seção Personalizada';
      let content = lines.slice(1).join('\n').trim();
      
      if (!content) {
        content = 'Conteúdo gerado pela IA baseado na descrição fornecida.';
      }
      
      onSectionGenerated(title, content);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to generate custom section:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquare className="mr-2 size-4" />
          Preenchimento inteligente (IA)
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerar seção customizada</DialogTitle>
          <DialogDescription>
            Descreva em linguagem natural o que você quer na seção, como "Seção de projetos com 3 projetos e links". A IA gerará tanto o título quanto o conteúdo da seção automaticamente.
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
            <LoadingButton loading={loading} type="submit">
              Gerar
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}