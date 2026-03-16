// Template Modern Sidebar — Layout 2 colunas com sidebar esquerda
// Suporta foto circular opcional, DM Sans, ícones Lucide para contato

import { ResumeTemplateProps } from "@/lib/resume-templates/registry";
import { formatDate } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { Mail, MapPin, Phone, User } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { getTranslation } from "@/lib/resume-templates/translations";

export default function ModernPhotoTemplate({ resumeData }: ResumeTemplateProps) {
  const accentColor = resumeData.colorHex || "#1e3a5f";

  return (
    <div className="flex min-h-[1123px] text-[12px] leading-[1.5]">
      {/* Sidebar esquerda — 30% */}
      <Sidebar resumeData={resumeData} accentColor={accentColor} />
      {/* Conteúdo principal — 70% */}
      <MainContent resumeData={resumeData} accentColor={accentColor} />
    </div>
  );
}

// Sidebar com foto, contato e skills
function Sidebar({ resumeData, accentColor }: ResumeTemplateProps & { accentColor: string }) {
  const { photo, firstName, lastName, phone, email, city, country, skills, socialLinks, language } = resumeData;
  const t = getTranslation(language);

  const [photoSrc, setPhotoSrc] = useState(photo instanceof File ? "" : photo);

  useEffect(() => {
    const objectUrl = photo instanceof File ? URL.createObjectURL(photo) : "";
    if (objectUrl) setPhotoSrc(objectUrl);
    if (photo === null) setPhotoSrc("");
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  const location = [city, country].filter(Boolean).join(", ");

  return (
    <div
      className="flex w-[30%] shrink-0 flex-col items-center px-3 py-5 text-white"
      style={{ backgroundColor: accentColor }}
    >
      {/* Foto ou fallback */}
      <div className="mb-4 flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full border-[3px] border-white">
        {photoSrc ? (
          <Image
            src={photoSrc}
            width={100}
            height={100}
            alt="Foto"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/20">
            <User className="h-10 w-10 text-white/70" />
          </div>
        )}
      </div>

      {/* Nome na sidebar */}
      <h2 className="mb-4 text-center text-sm font-bold">
        {firstName} {lastName}
      </h2>

      {/* Contato */}
      <div className="mb-5 w-full space-y-2">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/70">
          {t.contact}
        </h3>
        {email && (
          <div className="flex items-center gap-2 text-[10px]">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="break-all">{email}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2 text-[10px]">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{phone}</span>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-2 text-[10px]">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>{location}</span>
          </div>
        )}
        {socialLinks?.filter(l => l.label && l.url).map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] text-white/90 hover:text-white underline"
          >
            <span className="h-3.5 w-3.5 shrink-0 text-center">🔗</span>
            <span className="break-all">{link.label}</span>
          </a>
        ))}
      </div>

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="w-full">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/70">
            {t.skills}
          </h3>
          <div className="flex flex-wrap gap-1">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="rounded px-1.5 py-0.5 text-[9px] font-medium"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Conteúdo principal à direita
function MainContent({ resumeData, accentColor }: ResumeTemplateProps & { accentColor: string }) {
  const { firstName, lastName, jobTitle, summary, workExperiences, educations, customSections, language } = resumeData;
  const t = getTranslation(language);

  return (
    <div className="flex-1 px-5 py-5">
      {/* Header com nome e cargo */}
      <div className="mb-4">
        <h1 className="text-[30px] font-bold leading-tight text-gray-900">
          {firstName} {lastName}
        </h1>
        {jobTitle && (
          <p className="text-[13px] font-medium mt-1" style={{ color: accentColor }}>
            {jobTitle}
          </p>
        )}
      </div>

      {/* Resumo profissional */}
      {summary && (
        <SidebarSection title={t.summary} accentColor={accentColor}>
          <p className="whitespace-pre-line text-gray-700">{summary}</p>
        </SidebarSection>
      )}

      {/* Experiência */}
      {workExperiences && workExperiences.filter(e => Object.values(e).filter(Boolean).length > 0).length > 0 && (
        <SidebarSection title={t.workExperience} accentColor={accentColor}>
          <div className="space-y-3">
            {workExperiences.filter(e => Object.values(e).filter(Boolean).length > 0).map((exp, i) => (
              <div key={i} className="break-inside-avoid">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-gray-900 text-[12px]">{exp.position}</span>
                  {exp.startDate && (
                    <span className="shrink-0 text-[10px] text-gray-500">
                      {formatDate(exp.startDate, "MM/yyyy", { locale: language === 'en' ? enUS : ptBR })} –{" "}
                      {exp.endDate ? formatDate(exp.endDate, "MM/yyyy", { locale: language === 'en' ? enUS : ptBR }) : t.present}
                    </span>
                  )}
                </div>
                <p className="text-[11.5px] font-medium" style={{ color: accentColor }}>
                  {exp.company}
                </p>
                {exp.description && (
                  <div className="mt-0.5 whitespace-pre-line text-[11px] text-gray-600">
                    {exp.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SidebarSection>
      )}

      {/* Educação */}
      {educations && educations.filter(e => Object.values(e).filter(Boolean).length > 0).length > 0 && (
        <SidebarSection title={t.education} accentColor={accentColor}>
          <div className="space-y-2">
            {educations.filter(e => Object.values(e).filter(Boolean).length > 0).map((edu, i) => (
              <div key={i} className="break-inside-avoid">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-gray-900 text-[12px]">{edu.degree}</span>
                  {edu.startDate && (
                    <span className="shrink-0 text-[10px] text-gray-500">
                      {formatDate(edu.startDate, "MM/yyyy", { locale: language === 'en' ? enUS : ptBR })}
                      {edu.endDate ? ` – ${formatDate(edu.endDate, "MM/yyyy", { locale: language === 'en' ? enUS : ptBR })}` : ""}
                    </span>
                  )}
                </div>
                <p className="text-[11.5px] text-gray-600">{edu.school}</p>
              </div>
            ))}
          </div>
        </SidebarSection>
      )}

      {/* Seções customizadas */}
      {customSections && customSections.filter(s => Object.values(s).filter(Boolean).length > 0).length > 0 && (
        <>
          {customSections.filter(s => Object.values(s).filter(Boolean).length > 0).map((section, i) => (
            <SidebarSection key={i} title={section.title || "Outro"} accentColor={accentColor}>
              {section.content && (
                <div className="whitespace-pre-line text-[11px] text-gray-600">
                  {section.content}
                </div>
              )}
            </SidebarSection>
          ))}
        </>
      )}
    </div>
  );
}

// Seção com border-left colorida no título
function SidebarSection({
  title,
  accentColor,
  children,
}: {
  title: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <h3
        className="mb-2 text-[13px] font-bold uppercase tracking-[0.05em] text-gray-800"
        style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: "8px" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
