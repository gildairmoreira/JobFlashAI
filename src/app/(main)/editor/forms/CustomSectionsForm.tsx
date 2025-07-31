"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EditorFormProps } from "@/lib/types";
import { optionalString } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import GenerateCustomSectionButton from "./GenerateCustomSectionButton";

const customSectionItemSchema = z.object({
  title: optionalString,
  content: optionalString,
});

const formSchema = z.object({
  customSections: z.array(customSectionItemSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CustomSectionsForm({ resumeData, setResumeData }: Readonly<EditorFormProps>) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customSections: resumeData.customSections?.filter(Boolean) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customSections",
  });

  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger();
      if (!isValid) return;
      const filteredValues = {
        ...values,
        customSections: values.customSections?.filter(section => section && (section.title?.trim() || section.content?.trim())) ?? [],
      };
      setResumeData({ ...resumeData, ...filteredValues });
    });
    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Seções adicionais</h2>
        <p className="text-sm text-muted-foreground">
          Adicione seções personalizadas ao seu currículo, como projetos, certificações, idiomas, etc.
        </p>
      </div>
      <Form {...form}>
        <form className="space-y-3">
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-3 border p-3 rounded-md">
                <FormField
                  control={form.control}
                  name={`customSections.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da seção</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Ex: Projetos, Certificações, Idiomas"
                          style={{ textTransform: 'capitalize' }}
                          onChange={(e) => {
                            const value = e.target.value;
                            const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
                            field.onChange(capitalizedValue);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`customSections.${index}.content`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={5} 
                          placeholder="Descreva o conteúdo desta seção... Você pode usar markdown: **negrito**, *itálico*, - listas"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="destructive" onClick={() => remove(index)}>
                  Remover seção
                </Button>
              </div>
            ))}
            {fields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma seção adicional criada ainda.</p>
                <p className="text-sm">Use os botões abaixo para adicionar seções personalizadas.</p>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              <Button 
                type="button" 
                onClick={() => {
                  const lastSection = fields[fields.length - 1];
                  const lastSectionData = lastSection ? form.getValues(`customSections.${fields.length - 1}`) : null;
                  
                  if (fields.length === 0 || (lastSectionData?.title?.trim() || lastSectionData?.content?.trim())) {
                    append({ title: "", content: "" });
                  }
                }}
                variant="outline"
                disabled={fields.length > 0 && (() => {
                  const lastSection = fields[fields.length - 1];
                  const lastSectionData = lastSection ? form.getValues(`customSections.${fields.length - 1}`) : null;
                  return !lastSectionData?.title?.trim() && !lastSectionData?.content?.trim();
                })()}
              >
                Adicionar seção manualmente
              </Button>
              <GenerateCustomSectionButton 
                onSectionGenerated={(title, content) => append({ title, content })} 
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}