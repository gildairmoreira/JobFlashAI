"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResumeValues } from "@/lib/validation";
import { Printer } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import ResumePreview from "./ResumePreview";

interface PrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeData: ResumeValues;
  resumeTitle?: string;
}

export default function PrintModal({
  open,
  onOpenChange,
  resumeData,
  resumeTitle = "Currículo",
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle>Visualizar e imprimir currículo</DialogTitle>
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="size-4" />
              Imprimir
            </Button>
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