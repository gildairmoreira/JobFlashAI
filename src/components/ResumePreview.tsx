import useDimensions from "@/hooks/useDimensions";
import { cn } from "@/lib/utils";
import { ResumeValues } from "@/lib/validation";
import { getFontById } from "@/lib/resume-templates/fonts";
import Image from "next/image";
import React, { useRef } from "react";
import { useSubscriptionLevel } from "@/app/(main)/SubscriptionLevelProvider";
import DefaultTemplate from "./templates/DefaultTemplate";
import HarvardTemplate from "./templates/HarvardTemplate";
import ModernPhotoTemplate from "./templates/ModernPhotoTemplate";

import logo from "@/assets/logo.png";

interface ResumePreviewProps {
  resumeData: ResumeValues;
  contentRef?: React.Ref<HTMLDivElement>;
  className?: string;
}

export default function ResumePreview({
  resumeData,
  contentRef,
  className,
}: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useDimensions(containerRef);
  const subscriptionLevel = useSubscriptionLevel();

  // Resolve a fonte selecionada para o CSS family
  const fontConfig = getFontById(resumeData.fontFamily || "lato");
  const templateId = resumeData.templateId || "classic";

  return (
    <div
      className={cn(
        "aspect-[210/297] h-fit w-full bg-white text-black relative",
        className,
      )}
      ref={containerRef}
    >
      <div
        className={cn(
          templateId === "modern-photo" ? "p-0" : "space-y-6 p-6",
          !width && "invisible",
        )}
        style={{
          zoom: (1 / 794) * width,
          fontFamily: fontConfig.cssFamily,
        }}
        ref={contentRef}
        id="resumePreviewContent"
      >
        {/* Renderiza o template selecionado */}
        {templateId === "harvard" ? (
          <HarvardTemplate resumeData={resumeData} />
        ) : templateId === "modern-photo" ? (
          <ModernPhotoTemplate resumeData={resumeData} />
        ) : (
          <DefaultTemplate resumeData={resumeData} />
        )}

        {/* Marca d'água para plano free — tela inteira com padrão em grade */}
        {subscriptionLevel === "free" && (
          <div
            className="absolute inset-0 pointer-events-none z-50"
            style={{ overflow: "hidden" }}
          >
            {/* Grade 3x4 de marcas d'água cobrindo todo o PDF */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center opacity-[0.07]"
                >
                  <div className="flex flex-col items-center gap-1 rotate-[-35deg]">
                    <Image
                      src={logo}
                      alt=""
                      width={80}
                      height={80}
                      className="grayscale"
                    />
                    <div className="text-[28px] font-black tracking-tight uppercase text-gray-800">
                      JobFlash
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
