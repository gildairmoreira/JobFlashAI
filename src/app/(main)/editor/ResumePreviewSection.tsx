import ResumePreview from "@/components/ResumePreview";
import { cn } from "@/lib/utils";
import { ResumeValues } from "@/lib/validation";
import BorderStyleButton from "./BorderStyleButton";
import ColorPicker from "./ColorPicker";
import FontSelector from "./FontSelector";
import TemplateSelector from "./TemplateSelector";

interface ResumePreviewSectionProps {
  resumeData: ResumeValues;
  setResumeData: (data: ResumeValues) => void;
  className?: string;
}

export default function ResumePreviewSection({
  resumeData,
  setResumeData,
  className,
}: ResumePreviewSectionProps) {
  return (
    <div
      className={cn("hidden w-full flex-col md:flex md:w-1/2", className)}
    >
      <div className="flex w-full flex-wrap items-center justify-center gap-3 border-b bg-secondary/50 p-3 shadow-sm z-10">
        <ColorPicker
          color={resumeData.colorHex}
          onChange={(color) =>
            setResumeData({ ...resumeData, colorHex: color.hex })
          }
        />
        <BorderStyleButton
          borderStyle={resumeData.borderStyle}
          onChange={(borderStyle) =>
            setResumeData({ ...resumeData, borderStyle })
          }
        />
        <FontSelector
          currentFont={resumeData.fontFamily}
          currentTemplate={resumeData.templateId}
          onChange={(fontId) =>
            setResumeData({ ...resumeData, fontFamily: fontId })
          }
        />
        <TemplateSelector
          currentTemplate={resumeData.templateId}
          currentFont={resumeData.fontFamily}
          onChange={(templateId, fontId) => {
            const newData = { ...resumeData, templateId };
            if (fontId) newData.fontFamily = fontId;
            setResumeData(newData);
          }}
        />
      </div>
      <div className="flex w-full flex-1 justify-center overflow-y-auto bg-secondary p-4">
        <ResumePreview
          resumeData={resumeData}
          className="max-w-2xl shadow-md"
        />
      </div>
    </div>
  );
}
