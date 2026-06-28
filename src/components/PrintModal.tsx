"use client";

import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResumeValues } from "@/lib/validation";
import { Download } from "lucide-react";
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

  // Reset do zoom antes de imprimir — o zoom inline é calculado para o container do modal
  // e precisa ser 1 para que o PDF saia em tamanho A4 real
  const onBeforePrint = useCallback(() => {
    const el = contentRef.current;
    if (el) {
      el.dataset.originalZoom = el.style.zoom || "";
      el.style.zoom = "1";
    }
    return Promise.resolve();
  }, []);

  // Restaura o zoom original após imprimir para não quebrar a visualização no modal
  const onAfterPrint = useCallback(() => {
    const el = contentRef.current;
    if (el && el.dataset.originalZoom !== undefined) {
      el.style.zoom = el.dataset.originalZoom;
      delete el.dataset.originalZoom;
    }
  }, []);

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: resumeTitle,
    onBeforePrint,
    onAfterPrint,
    // Injeta CSS de print no iframe — garante A4 correto independente do dispositivo
    pageStyle: `
      @page {
        size: 210mm 297mm;
        margin: 0;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 210mm !important;
        background: white !important;
        overflow: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      /* Esconde tudo por padrão */
      body * {
        visibility: hidden !important;
      }
      /* Mostra apenas o conteúdo do currículo */
      #resumePreviewContent,
      #resumePreviewContent * {
        visibility: visible !important;
      }
      #resumePreviewContent {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 210mm !important;
        height: auto !important;
        max-height: none !important;
        overflow: visible !important;
        zoom: 1 !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
        background: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      /* Remove aspect-ratio do container pai */
      [class*="aspect-"] {
        aspect-ratio: auto !important;
        overflow: visible !important;
        box-shadow: none !important;
        border: none !important;
      }
    `,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-8">
            <DialogTitle>Visualizar e baixar currículo</DialogTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => reactToPrintFn()} 
                className="flex-1 sm:flex-none flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="size-4" />
                Baixar / Imprimir PDF
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