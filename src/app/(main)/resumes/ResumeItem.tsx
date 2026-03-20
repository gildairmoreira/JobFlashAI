"use client";

import LoadingButton from "@/components/LoadingButton";
import ResumePreview from "@/components/ResumePreview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { canDuplicateResume } from "@/lib/permissions";
import { SubscriptionLevel } from "@/lib/subscription";
import { ResumeServerData } from "@/lib/types";
import { mapToResumeValues } from "@/lib/utils";
import { formatDate } from "date-fns";
import { Copy, MoreVertical, Printer, Trash2, Lock, Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef, useState, useTransition } from "react";
import { useReactToPrint } from "react-to-print";
import { deleteResume, duplicateResume } from "./actions";
import usePremiumModal from "@/hooks/usePremiumModal";

interface ResumeItemProps {
  resume: ResumeServerData;
  subscriptionLevel: SubscriptionLevel;
  isLocked?: boolean;
}

export default function ResumeItem({ resume, subscriptionLevel, isLocked = false }: Readonly<ResumeItemProps>) {
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const premiumModal = usePremiumModal();

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: resume.title ?? "Currículo",
  });

  const wasUpdated = resume.updatedAt !== resume.createdAt;

  return (
    <div className="group relative rounded-lg border border-transparent bg-secondary p-3 transition-colors hover:border-border overflow-hidden">
      <div className="space-y-3">
        <div
          onClick={(e) => {
            if (isLocked) {
              premiumModal.setOpen(true);
            } else {
              router.push(`/editor?resumeId=${resume.id}`);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (isLocked) {
                premiumModal.setOpen(true);
              } else {
                router.push(`/editor?resumeId=${resume.id}`);
              }
              e.preventDefault();
            }
          }}
          role="button"
          tabIndex={0}
          className="inline-block w-full cursor-pointer"
        >
          <div className="text-center">
            <p className="line-clamp-1 font-semibold">
              {resume.title ?? "Sem título"}
            </p>
            {resume.description && (
              <p className="line-clamp-2 text-sm">{resume.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {wasUpdated ? "Atualizado" : "Criado"} em
              {formatDate(resume.updatedAt, "MMM d, yyyy h:mm a")}
            </p>
          </div>
          <div className="relative mt-3">
            <ResumePreview
              resumeData={mapToResumeValues(resume)}
              contentRef={contentRef}
              className={`overflow-hidden shadow-sm transition-shadow group-hover:shadow-lg ${isLocked ? "blur-[3px] opacity-70" : ""}`}
            />
            {isLocked && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/30 backdrop-blur-[2px] rounded-lg border border-dashed border-primary/40">
                {/* Cross Chains SVG */}
                <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-30 text-stone-700 dark:text-stone-300" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
                  <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
                </svg>
                <div className="bg-card shadow-xl rounded-full p-3 text-center mb-2 z-20 border-2 border-primary/20">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold text-center px-4 z-20 bg-background/80 py-1 rounded-md shadow-sm">
                  Renove para Desbloquear
                </span>
              </div>
            )}
            {!isLocked && (
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
            )}
          </div>
        </div>
      </div>
      <MoreMenu
        resumeId={resume.id}
        resumeTitle={resume.title ?? "Currículo"}
        onPrintClick={reactToPrintFn}
        subscriptionLevel={subscriptionLevel}
        isLocked={isLocked}
      />
    </div>
  );
}

interface MoreMenuProps {
  resumeId: string;
  resumeTitle: string;
  onPrintClick: () => void;
  subscriptionLevel: SubscriptionLevel;
  isLocked?: boolean;
}

function MoreMenu({ resumeId, resumeTitle, onPrintClick, subscriptionLevel, isLocked = false }: Readonly<MoreMenuProps>) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDuplicating, startDuplicate] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  const premiumModal = usePremiumModal();

  const canDuplicate = canDuplicateResume(subscriptionLevel);

  function handleDuplicate() {
    if (!canDuplicate) {
      premiumModal.setOpen(true);
      return;
    }

    startDuplicate(async () => {
      try {
        await duplicateResume(resumeId);
        toast({ description: "Currículo duplicado com sucesso!" });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "";
        if (message === "PLAN_REQUIRED") {
          premiumModal.setOpen(true);
        } else {
          toast({
            variant: "destructive",
            description: "Erro ao duplicar currículo. Tente novamente.",
          });
        }
      }
    });
  }

  const handleDownloadPDF = async () => {
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
      toast({
        variant: "destructive",
        description: "Houve um erro ao gerar o PDF. Tente novamente.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-0.5 top-0.5 transition-opacity ${isLocked ? "hidden pointer-events-none" : "opacity-0 group-hover:opacity-100"}`}
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={(e) => {
              e.preventDefault();
              handleDownloadPDF();
            }}
            disabled={isDownloading}
          >
            {isDownloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {isDownloading ? "Baixando..." : "Baixar PDF"}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={onPrintClick}
          >
            <Printer className="size-4" />
            Imprimir
          </DropdownMenuItem>
          <DropdownMenuItem
            className={`flex items-center gap-2 ${!canDuplicate ? "opacity-50" : ""}`}
            onClick={handleDuplicate}
            disabled={isDuplicating}
          >
            <Copy className="size-4" />
            {isDuplicating ? "Duplicando..." : "Duplicar"}
            {!canDuplicate && (
              <span className="ml-auto text-[10px] text-muted-foreground">PRO</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => setShowDeleteConfirmation(true)}
          >
            <Trash2 className="size-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteConfirmationDialog
        resumeId={resumeId}
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
      />
    </>
  );
}

interface DeleteConfirmationDialogProps {
  resumeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DeleteConfirmationDialog({
  resumeId,
  open,
  onOpenChange,
}: Readonly<DeleteConfirmationDialogProps>) {
  const { toast } = useToast();

  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    startTransition(async () => {
      try {
        await deleteResume(resumeId);
        onOpenChange(false);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          description: "Algo deu errado. Por favor, tente novamente.",
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir currículo?</DialogTitle>
          <DialogDescription>
            Isso excluirá permanentemente este currículo. Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <LoadingButton
            variant="destructive"
            onClick={handleDelete}
            loading={isPending}
          >
            Excluir
          </LoadingButton>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
