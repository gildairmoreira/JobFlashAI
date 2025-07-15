import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileUserIcon, PenLineIcon, DownloadIcon } from "lucide-react";
import Link from "next/link";
import { steps } from "./steps";
import { useState } from "react";
import ResumePreviewModal from "@/components/ResumePreviewModal";
import { ResumeValues } from "@/lib/validation";

interface FooterProps {
  readonly currentStep: string;
  readonly setCurrentStep: (step: string) => void;
  readonly showSmResumePreview: boolean;
  readonly setShowSmResumePreview: (show: boolean) => void;
  readonly isSaving: boolean;
  readonly resumeData: ResumeValues;
}

export default function Footer({
  currentStep,
  setCurrentStep,
  showSmResumePreview,
  setShowSmResumePreview,
  isSaving,
  resumeData,
}: FooterProps) {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const previousStep = steps.find(
    (_, index) => steps[index + 1]?.key === currentStep,
  )?.key;

  const nextStep = steps.find(
    (_, index) => steps[index - 1]?.key === currentStep,
  )?.key;

  const isLastStep = currentStep === steps[steps.length - 1].key;

  const handleFinalize = () => {
    setShowPreviewModal(true);
  };

  return (
    <footer className="w-full border-t px-3 py-5">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={
              previousStep ? () => setCurrentStep(previousStep) : undefined
            }
            disabled={!previousStep}
          >
            Passo anterior
          </Button>
          {isLastStep ? (
            <Button onClick={handleFinalize} className="gap-2">
              <DownloadIcon className="h-4 w-4" />
              Finalizar
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
            showSmResumePreview ? "Mostrar formulário" : "Mostrar visualização do currículo"
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
      
      <ResumePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        resumeData={resumeData}
      />
    </footer>
  );
}
