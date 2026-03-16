// Seletor de fonte para o editor — dropdown com preview de cada fonte
"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FONTS, FontOption, getDefaultFontForTemplate } from "@/lib/resume-templates/fonts";
import { Type } from "lucide-react";
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FontSelectorProps {
  readonly currentFont: string | undefined;
  readonly currentTemplate: string | undefined;
  readonly onChange: (fontId: string) => void;
}

export default function FontSelector({
  currentFont,
  currentTemplate,
  onChange,
}: FontSelectorProps) {
  const [open, setOpen] = useState(false);

  // Fonte padrão do template ativo para exibir badge
  const defaultFont = getDefaultFontForTemplate(currentTemplate || "classic");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" title="Alterar fonte do currículo">
          <Type className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
          Fonte do currículo
        </p>
        <ScrollArea className="h-[300px] w-full pr-3">
          <div className="space-y-0.5">
            {FONTS.map((font) => (
              <FontItem
                key={font.id}
                font={font}
                isActive={currentFont === font.id}
                isDefault={defaultFont.id === font.id}
                onClick={() => {
                  onChange(font.id);
                  setOpen(false);
                }}
              />
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function FontItem({
  font,
  isActive,
  isDefault,
  onClick,
}: {
  font: FontOption;
  isActive: boolean;
  isDefault: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent ${
        isActive ? "bg-accent font-semibold" : ""
      }`}
    >
      <span style={{ fontFamily: font.cssFamily }}>{font.name}</span>
      {isDefault && (
        <span className="ml-1 rounded bg-muted px-1 py-0.5 text-[10px] text-muted-foreground">
          Padrão
        </span>
      )}
    </button>
  );
}
