"use client";

import { useRef } from "react";
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

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: resumeTitle,
  });

  const handlePrint = () => {
    reactToPrintFn();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-8">
            <DialogTitle>Visualizar e baixar currículo</DialogTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                onClick={handlePrint} 
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