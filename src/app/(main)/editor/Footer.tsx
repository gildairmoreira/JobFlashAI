import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileUserIcon, PenLineIcon, Printer } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import PrintModal from "@/components/PrintModal";
import { ResumeValues } from "@/lib/validation";
import { steps } from "./steps";

interface FooterProps {
  currentStep: string;
  setCurrentStep: (step: string) => void;
  showSmResumePreview: boolean;
  setShowSmResumePreview: (show: boolean) => void;
  isSaving: boolean;
  resumeData?: ResumeValues;
  resumeTitle?: string;
}

export default function Footer({
  currentStep,
  setCurrentStep,
  showSmResumePreview,
  setShowSmResumePreview,
  isSaving,
  resumeData,
  resumeTitle = "Currículo",
}: FooterProps) {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const previousStep = steps.find(
    (_, index) => steps[index + 1]?.key === currentStep,
  )?.key;

  const nextStep = steps.find(
    (_, index) => steps[index - 1]?.key === currentStep,
  )?.key;

  const isLastStep = currentStep === "custom-sections";

  return (
    <>
      <footer className="w-full border-t px-3 py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={previousStep ? () => setCurrentStep(previousStep) : undefined}
              disabled={!previousStep}
            >
              Passo anterior
            </Button>
            {isLastStep ? (
              <Button
                onClick={() => setShowPrintModal(true)}
                className="flex items-center gap-2"
                disabled={!resumeData}
              >
                <Printer className="size-4" />
                Imprimir
              </Button>
            ) : (
              <Button
                onClick={nextStep ? () => setCurrentStep(nextStep) : undefined}
                disabled={!nextStep}
              >
                Próximo passo
              </Button>
            )}
          </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowSmResumePreview(!showSmResumePreview)}
          className="md:hidden"
          title={
            showSmResumePreview ? "Mostrar formulário de entrada" : "Mostrar prévia do currículo"
          }
        >
          {showSmResumePreview ? <PenLineIcon /> : <FileUserIcon />}
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="secondary" asChild>
            <Link href="/resumes">Fechar</Link>
          </Button>
          <p
            className={cn(
              "text-muted-foreground opacity-0",
              isSaving && "opacity-100",
            )}
          >
            Salvando...
          </p>
        </div>
      </div>
    </footer>
    {resumeData && (
      <PrintModal
        open={showPrintModal}
        onOpenChange={setShowPrintModal}
        resumeData={resumeData}
        resumeTitle={resumeTitle}
      />
    )}
  </>
  );
}
