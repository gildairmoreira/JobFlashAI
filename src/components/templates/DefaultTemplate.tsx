// Template Clássico — Layout padrão existente, extraído do ResumePreview original
// Suporta foto, fonte via CSS variable

import { BorderStyles } from "@/app/(main)/editor/BorderStyleButton";
import { ResumeTemplateProps } from "@/lib/resume-templates/registry";
import { renderMarkdownToHTML } from "@/lib/resume-templates/renderMarkdown";
import { formatDate } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getTranslation } from "@/lib/resume-templates/translations";

export default function DefaultTemplate({ resumeData }: ResumeTemplateProps) {
  return (
    // Reduz espaçamento entre seções — o header mantém margem própria via space-y-2.5
    <div className="space-y-3">
      <PersonalInfoHeader resumeData={resumeData} />
      <SummarySection resumeData={resumeData} />
      <WorkExperienceSection resumeData={resumeData} />
      <EducationSection resumeData={resumeData} />
      <CustomSectionsSection resumeData={resumeData} />
      <SkillsSection resumeData={resumeData} />
    </div>
  );
}

function PersonalInfoHeader({ resumeData }: ResumeTemplateProps) {
  const {
    photo,
    firstName,
    lastName,
    jobTitle,
    city,
    country,
    phone,
    email,
    socialLinks,
    colorHex,
    borderStyle,
  } = resumeData;

  const [photoSrc, setPhotoSrc] = useState(photo instanceof File ? "" : photo);

  useEffect(() => {
    const objectUrl = photo instanceof File ? URL.createObjectURL(photo) : "";
    if (objectUrl) setPhotoSrc(objectUrl);
    if (photo === null) setPhotoSrc("");
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  return (
    <div className="flex items-center gap-6">
      {photoSrc && (
        <Image
          src={photoSrc}
          width={100}
          height={100}
          alt="Author photo"
          className="aspect-square object-cover"
          style={{
            borderRadius:
              borderStyle === BorderStyles.SQUARE
                ? "0px"
                : borderStyle === BorderStyles.CIRCLE
                  ? "9999px"
                  : "10%",
          }}
        />
      )}
      <div className="space-y-2.5">
        <div className="space-y-1">
          <p
            className="text-3xl font-bold"
            style={{ color: colorHex }}
          >
            {firstName} {lastName}
          </p>
          <p
            className="font-medium"
            style={{ color: colorHex }}
          >
            {jobTitle}
          </p>
        </div>
        <p className="text-xs text-gray-500">
          {city}
          {city && country ? ", " : ""}
          {country}
          {(city || country) && (phone || email) ? " • " : ""}
          {[phone, email].filter(Boolean).join(" • ")}
          {socialLinks?.filter(link => link.label && link.url).map((link, index) => (
            <span key={index}>
              {" • "}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline cursor-pointer"
                style={{ color: colorHex }}
              >
                {link.label}
              </a>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

function SummarySection({ resumeData }: ResumeTemplateProps) {
  const { summary, colorHex, language } = resumeData;
  const t = getTranslation(language);
  if (!summary) return null;

  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <div className="break-inside-avoid space-y-2">
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          {t.summary}
        </p>
        {/* Usa dangerouslySetInnerHTML para manter estilo idêntico às demais seções */}
        <div
          className="text-sm"
          dangerouslySetInnerHTML={{ __html: renderMarkdownToHTML(summary) }}
        />
      </div>
    </>
  );
}

function WorkExperienceSection({ resumeData }: ResumeTemplateProps) {
  const { workExperiences, colorHex, language } = resumeData;
  const t = getTranslation(language);
  const workExperiencesNotEmpty = workExperiences?.filter(
    (exp) => Object.values(exp).filter(Boolean).length > 0,
  );
  if (!workExperiencesNotEmpty?.length) return null;

  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <div className="space-y-3">
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          {t.workExperience}
        </p>
        {workExperiencesNotEmpty.map((exp, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{ color: colorHex }}
            >
              <span>{exp.position}</span>
              {exp.startDate && (
                <span>
                  {formatDate(exp.startDate, "MM/yyyy", { locale: language === 'en' ? enUS : ptBR })} -{" "}
                  {exp.endDate ? formatDate(exp.endDate, "MM/yyyy", { locale: language === 'en' ? enUS : ptBR }) : t.present}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold">{exp.company}</p>
            {/* Usa dangerouslySetInnerHTML para bullets idênticos às seções customizadas */}
            {exp.description && (
              <div
                className="text-xs"
                dangerouslySetInnerHTML={{ __html: renderMarkdownToHTML(exp.description) }}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function EducationSection({ resumeData }: ResumeTemplateProps) {
  const { educations, colorHex, language } = resumeData;
  const t = getTranslation(language);
  const educationsNotEmpty = educations?.filter(
    (edu) => Object.values(edu).filter(Boolean).length > 0,
  );
  if (!educationsNotEmpty?.length) return null;

  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <div className="space-y-3">
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          {t.education}
        </p>
        {educationsNotEmpty.map((edu, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{ color: colorHex }}
            >
              <span>{edu.degree}</span>
              {edu.startDate && (
                <span>
                  {edu.startDate &&
                    `${formatDate(edu.startDate, "MM/yyyy", { locale: language === 'en' ? enUS : ptBR })} ${edu.endDate ? `- ${formatDate(edu.endDate, "MM/yyyy", { locale: language === 'en' ? enUS : ptBR })}` : ""}`}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold">{edu.school}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function CustomSectionsSection({ resumeData }: ResumeTemplateProps) {
  const { customSections, colorHex } = resumeData;
  const customSectionsNotEmpty = customSections?.filter(
    (section) => Object.values(section).filter(Boolean).length > 0,
  );
  if (!customSectionsNotEmpty?.length) return null;

  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <div className="space-y-3">
        {customSectionsNotEmpty.map((section, index) => (
          <div key={index} className="break-inside-avoid space-y-1.5">
            {section.title && (
              <p className="text-lg font-semibold" style={{ color: colorHex }}>
                {section.title}
              </p>
            )}
            {section.content && (
              // Usa helper unificado: bullets só para linhas com - ou *, markdown inline
              <div
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: renderMarkdownToHTML(section.content) }}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function SkillsSection({ resumeData }: ResumeTemplateProps) {
  const { skills, colorHex, borderStyle, language } = resumeData;
  const t = getTranslation(language);
  if (!skills?.length) return null;

  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <div className="break-inside-avoid space-y-3">
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          {t.skills}
        </p>
        <div className="flex break-inside-avoid flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge
              key={index}
              className="rounded-md bg-black text-white hover:bg-black"
              style={{
                backgroundColor: colorHex,
                borderRadius:
                  borderStyle === BorderStyles.SQUARE
                    ? "0px"
                    : borderStyle === BorderStyles.CIRCLE
                      ? "9999px"
                      : "8px",
              }}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    </>
  );
}
