"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResumeValues } from "@/lib/validation";
import { Printer, Download, Loader2 } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import ResumePreview from "./ResumePreview";

interface PrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeData: ResumeValues;
  resumeTitle?: string;
  resumeId?: string;
}

export default function PrintModal({
  open,
  onOpenChange,
  resumeData,
  resumeTitle = "Currículo",
  resumeId,
}: Readonly<PrintModalProps>) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!resumeId) return;
    try {
      setIsDownloading(true);
      const response = await fetch(`/api/export-pdf?resumeId=${resumeId}`);
      if (!response.ok) throw new Error("Erro na geração do PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resumeTitle.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error(error);
      alert("Houve um erro ao gerar o PDF. Verifique se as alterações foram salvas.");
    } finally {
      setIsDownloading(false);
    }
  };

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: resumeTitle,
  });

  const handlePrint = () => {
    reactToPrintFn();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-8">
            <DialogTitle>Visualizar e baixar currículo</DialogTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={handlePrint} variant="outline" className="flex-1 sm:flex-none flex items-center gap-2">
                <Printer className="size-4" />
                Imprimir
              </Button>
              <Button 
                onClick={handleDownloadPDF} 
                disabled={!resumeId || isDownloading} 
                className="flex-1 sm:flex-none flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isDownloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                {isDownloading ? "Baixando..." : "Baixar PDF"}
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <ResumePreview
                resumeData={resumeData}
                contentRef={contentRef}
                className="shadow-lg border"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}