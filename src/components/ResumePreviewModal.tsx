"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResumeValues } from "@/lib/validation";
import { PrinterIcon } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import ResumePreview from "@/components/ResumePreview";

interface ResumePreviewModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly resumeData: ResumeValues;
}

export default function ResumePreviewModal({
  isOpen,
  onClose,
  resumeData,
}: ResumePreviewModalProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Currículo",
    pageStyle: `
      @page {
        size: A4;
        margin: 0.5in;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
      }
    `,
    onBeforePrint: () => {
      if (!componentRef.current) {
        throw new Error("Referência do componente não encontrada");
      }
      return Promise.resolve();
    },
    onPrintError: (errorLocation, error) => {
      console.error(`Erro ao imprimir (${errorLocation}):`, error);
    }
  });

  // Função de impressão já configurada acima com useReactToPrint

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-6">
        <DialogHeader className="px-0">
          <DialogTitle>Preview do Currículo</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto bg-gray-100 p-4 my-4 rounded-md" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <div 
            className="bg-white shadow-lg mx-auto" 
            style={{ width: '100%', maxWidth: '210mm', padding: '10mm' }}
            suppressHydrationWarning
          >
            <ResumePreview resumeData={resumeData} contentRef={componentRef} />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button 
            onClick={() => {
              try {
                if (!componentRef.current) {
                  console.error('Referência do componente não encontrada');
                  return;
                }
                handlePrint();
              } catch (error) {
                console.error('Erro ao imprimir:', error);
              }
            }} 
            variant="default" 
            className="gap-2"
          >
            <PrinterIcon className="h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}