"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import usePremiumModal from "@/hooks/usePremiumModal";

interface Props {
  canCreate: boolean;
  canImport: boolean;
  variant?: "default" | "nav";
}

export default function ImportResumeButton({ canCreate, canImport, variant = "default" }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const premiumModal = usePremiumModal();

  const handleUploadClick = () => {
    if (!canImport) {
      premiumModal.setOpen(true);
      return;
    }
    
    if (!canCreate) {
      toast({
        title: "Limite atingido",
        description: "Você atingiu o limite de currículos. Faça upgrade do seu plano.",
        variant: "destructive",
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, envie apenas arquivos em formato PDF.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resumes/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocorreu um erro durante a importação");
      }

      toast({
        title: "Sucesso!",
        description: "Seu currículo foi importado com sucesso! Revise os campos preenchidos pela IA.",
      });

      if (data.resumeId) {
        router.push(`/editor?resumeId=${data.resumeId}`);
      } else {
        router.refresh();
      }

    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erro na importação",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (variant === "nav") {
    return (
      <>
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUploadClick}
          disabled={isUploading}
          className="flex gap-2 text-stone-600 hover:text-indigo-600 transition-colors h-9 px-3 rounded-lg"
          title="Importar PDF"
        >
          {isUploading ? <Loader2 className="size-4 animate-spin text-indigo-600" /> : <Upload className="size-4" />}
          <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider">
            {isUploading ? "..." : "Importar"}
          </span>
        </Button>
      </>
    );
  }

  return (
    <>
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        onClick={handleUploadClick}
        disabled={isUploading}
        className="flex gap-2 w-full sm:w-auto shrink-0 border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-all rounded-xl shadow-sm px-6 h-12 md:h-10"
      >
        {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        <span className="font-medium">
          {isUploading ? "Importando..." : "Importar Currículo"}
        </span>
      </Button>
      <p className="sr-only">
        Dica: Importe seu currículo existente para economizar tempo.
      </p>
    </>
  );
}
