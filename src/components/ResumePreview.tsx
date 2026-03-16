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

        {/* Marca d'água para plano free */}
        {subscriptionLevel === "free" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 opacity-[0.1]">
            <div className="flex flex-col items-center gap-2 rotate-[-45deg] border-[12px] border-gray-400 p-8 rounded-full">
              <Image
                src={logo}
                alt="Watermark Logo"
                width={150}
                height={150}
                className="grayscale opacity-50"
              />
              <div className="text-7xl font-black tracking-tighter uppercase mt-2 text-gray-500">
                JobFlash
              </div>
              <div className="text-xl font-bold tracking-[0.3em] uppercase text-gray-400">
                FREE TIER
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
