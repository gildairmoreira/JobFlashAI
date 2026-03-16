"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import usePremiumModal from "@/hooks/usePremiumModal";
import { getDefaultFontForTemplate } from "@/lib/resume-templates/fonts";
import { TEMPLATES } from "@/lib/resume-templates/registry";
import { SubscriptionLevel } from "@/lib/subscription";
import { Camera, LayoutTemplate, Lock, PlusSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface CreateResumeButtonProps {
  canCreate: boolean;
  subscriptionLevel?: SubscriptionLevel;
}

export default function CreateResumeButton({
  canCreate,
  subscriptionLevel = "free",
}: CreateResumeButtonProps) {
  const premiumModal = usePremiumModal();
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);

  // Templates que exigem plano pago
  const isPremiumTemplate = (id: string) => id !== "classic";
  const isFree = subscriptionLevel === "free" || subscriptionLevel === "frozen" || subscriptionLevel === "banned";

  if (!canCreate) {
    return (
      <Button
        onClick={() => premiumModal.setOpen(true)}
        className="mx-auto flex w-fit gap-2"
      >
        <PlusSquare className="size-5" />
        Novo currículo
      </Button>
    );
  }

  const defaultFont = getDefaultFontForTemplate(selectedTemplate).id;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mx-auto flex w-fit gap-2">
          <PlusSquare className="size-5" />
          Novo currículo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Escolha um Template</DialogTitle>
          <DialogDescription>
            Selecione o design inicial para o seu novo currículo. Você poderá alterar isso depois no editor.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          {TEMPLATES.map((template) => {
            const isActive = selectedTemplate === template.id;
            const locked = isFree && isPremiumTemplate(template.id);
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => {
                  if (locked) {
                    premiumModal.setOpen(true);
                    return;
                  }
                  setSelectedTemplate(template.id);
                }}
                className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 text-center transition-all ${
                  locked
                    ? "border-dashed border-muted-foreground/30 opacity-70"
                    : isActive
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                      : "border-muted hover:border-primary/50 hover:bg-accent"
                }`}
              >
                {locked && (
                  <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    <Lock className="h-2.5 w-2.5" /> PRO
                  </div>
                )}
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    locked ? "bg-muted text-muted-foreground" : isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <LayoutTemplate className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{template.name}</h3>
                  {template.supportsPhoto && (
                    <span className="mt-1 flex items-center justify-center gap-1 text-[10px] text-muted-foreground bg-muted w-fit mx-auto px-1.5 py-0.5 rounded">
                      <Camera className="h-3 w-3" /> Foto
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button asChild>
            <Link
              href={`/editor?templateId=${selectedTemplate}&fontFamily=${defaultFont}`}
              onClick={() => setOpen(false)}
            >
              Criar Currículo
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
