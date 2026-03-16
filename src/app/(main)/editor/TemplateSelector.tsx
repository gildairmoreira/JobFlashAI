// Seletor de template para o editor — grid de cards com preview
"use client";

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TEMPLATES, TemplateConfig } from "@/lib/resume-templates/registry";
import { getDefaultFontForTemplate } from "@/lib/resume-templates/fonts";
import { SubscriptionLevel } from "@/lib/subscription";
import usePremiumModal from "@/hooks/usePremiumModal";
import { Camera, LayoutTemplate, Lock } from "lucide-react";
import React, { useState } from "react";

interface TemplateSelectorProps {
  readonly currentTemplate: string | undefined;
  readonly currentFont: string | undefined;
  readonly onChange: (templateId: string, fontId?: string) => void;
  readonly subscriptionLevel?: SubscriptionLevel;
}

export default function TemplateSelector({
  currentTemplate,
  currentFont,
  onChange,
  subscriptionLevel = "free",
}: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    template: TemplateConfig;
    defaultFont: string;
  } | null>(null);
  const premiumModal = usePremiumModal();

  const isFree = subscriptionLevel === "free" || subscriptionLevel === "frozen" || subscriptionLevel === "banned";
  const isPremiumTemplate = (id: string) => id !== "classic";

  const handleSelect = (template: TemplateConfig) => {
    if (isFree && isPremiumTemplate(template.id)) {
      premiumModal.setOpen(true);
      setOpen(false);
      return;
    }
    const defaultFont = getDefaultFontForTemplate(template.id);

    // Se a fonte atual é diferente da padrão do novo template, confirmar
    if (currentFont && currentFont !== defaultFont.id) {
      setConfirmDialog({ template, defaultFont: defaultFont.id });
    } else {
      onChange(template.id, defaultFont.id);
    }
    setOpen(false);
  };

  const handleConfirmWithDefault = () => {
    if (confirmDialog) {
      onChange(confirmDialog.template.id, confirmDialog.defaultFont);
    }
    setConfirmDialog(null);
  };

  const handleKeepFont = () => {
    if (confirmDialog) {
      onChange(confirmDialog.template.id);
    }
    setConfirmDialog(null);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" title="Alterar template">
            <LayoutTemplate className="size-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3" align="end">
          <p className="mb-3 text-xs font-semibold text-muted-foreground">
            Escolha o template
          </p>
          <div className="space-y-2">
            {TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isActive={currentTemplate === template.id}
                isLocked={isFree && isPremiumTemplate(template.id)}
                onClick={() => handleSelect(template)}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Dialog de confirmação de fonte */}
      <Dialog
        open={!!confirmDialog}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trocar template</DialogTitle>
            <DialogDescription>
              O template{" "}
              <strong>{confirmDialog?.template.name}</strong> usa a fonte{" "}
              <strong>
                {getDefaultFontForTemplate(confirmDialog?.template.id || "").name}
              </strong>{" "}
              por padrão. Deseja aplicar a fonte padrão ou manter a atual?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="secondary" onClick={handleKeepFont}>
              Manter fonte atual
            </Button>
            <Button onClick={handleConfirmWithDefault}>
              Usar fonte padrão (Recomendado)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TemplateCard({
  template,
  isActive,
  isLocked = false,
  onClick,
}: {
  template: TemplateConfig;
  isActive: boolean;
  isLocked?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
        isActive ? "border-primary bg-accent" : "border-border"
      } ${isLocked ? "opacity-70" : ""}`}
    >
      {isLocked && (
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
          <Lock className="h-2.5 w-2.5" /> PRO
        </div>
      )}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
        <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{template.name}</p>
          {template.supportsPhoto && (
            <span className="flex items-center gap-0.5 rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground">
              <Camera className="h-2.5 w-2.5" />
              Foto
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{template.description}</p>
      </div>
    </button>
  );
}
