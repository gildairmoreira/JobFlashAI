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
import { Copy, MoreVertical, Printer, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef, useState, useTransition } from "react";
import { useReactToPrint } from "react-to-print";
import { deleteResume, duplicateResume } from "./actions";
import usePremiumModal from "@/hooks/usePremiumModal";

interface ResumeItemProps {
  resume: ResumeServerData;
  subscriptionLevel: SubscriptionLevel;
}

export default function ResumeItem({ resume, subscriptionLevel }: Readonly<ResumeItemProps>) {
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: resume.title ?? "Currículo",
  });

  const wasUpdated = resume.updatedAt !== resume.createdAt;

  return (
    <div className="group relative rounded-lg border border-transparent bg-secondary p-3 transition-colors hover:border-border">
      <div className="space-y-3">
        <div
          onClick={() => router.push(`/editor?resumeId=${resume.id}`)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              router.push(`/editor?resumeId=${resume.id}`);
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
              className="overflow-hidden shadow-sm transition-shadow group-hover:shadow-lg"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
          </div>
        </div>
      </div>
      <MoreMenu
        resumeId={resume.id}
        onPrintClick={reactToPrintFn}
        subscriptionLevel={subscriptionLevel}
      />
    </div>
  );
}

interface MoreMenuProps {
  resumeId: string;
  onPrintClick: () => void;
  subscriptionLevel: SubscriptionLevel;
}

function MoreMenu({ resumeId, onPrintClick, subscriptionLevel }: Readonly<MoreMenuProps>) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDuplicating, startDuplicate] = useTransition();
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0.5 top-0.5 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
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
