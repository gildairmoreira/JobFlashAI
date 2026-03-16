// Template Harvard — Layout acadêmico fiel à imagem de referência
// Sem foto, EB Garamond, seções em MAIÚSCULAS com border-bottom, datas alinhadas à direita

import { ResumeTemplateProps } from "@/lib/resume-templates/registry";
import { formatDate } from "date-fns";
import React from "react";

export default function HarvardTemplate({ resumeData }: ResumeTemplateProps) {
  return (
    <div className="space-y-0 text-[12px] leading-[1.4] text-black">
      <HarvardHeader resumeData={resumeData} />
      <HarvardSummary resumeData={resumeData} />
      <HarvardEducation resumeData={resumeData} />
      <HarvardExperience resumeData={resumeData} />
      <HarvardCustomSections resumeData={resumeData} />
      <HarvardSkills resumeData={resumeData} />
    </div>
  );
}

// Cabeçalho: Nome centralizado + contato em linha com pipes
function HarvardHeader({ resumeData }: ResumeTemplateProps) {
  const { firstName, lastName, city, country, email, phone, socialLinks } = resumeData;

  const contactParts = [
    [city, country].filter(Boolean).join(", "),
    email,
    phone,
  ].filter(Boolean);

  const links = socialLinks?.filter((l) => l.label && l.url) ?? [];

  return (
    <div className="mb-1 text-center">
      <h1 className="text-[26px] font-bold tracking-[0.05em]">
        {firstName} {lastName}
      </h1>
      {contactParts.length > 0 && (
        <p className="mt-0.5 text-[11.5px] text-gray-700">
          {contactParts.join(" | ")}
        </p>
      )}
      {links.length > 0 && (
        <p className="mt-0.5 flex flex-wrap justify-center gap-x-2 text-[10.5px] text-gray-500">
          {links.map((link, i) => (
            <span key={i}>
              {i > 0 && <span className="mr-1 text-gray-300">|</span>}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-800"
              >
                {link.label}
              </a>
            </span>
          ))}
        </p>
      )}
      <hr className="mt-2 border-t border-black" />
    </div>
  );
}

// Resumo Profissional
function HarvardSummary({ resumeData }: ResumeTemplateProps) {
  const { summary } = resumeData;
  if (!summary) return null;

  return (
    <>
      <SectionTitle>PROFESSIONAL SUMMARY</SectionTitle>
      <div className="mb-2 whitespace-pre-line text-[11.5px]">
        {summary}
      </div>
    </>
  );
}

// Título de seção reutilizável — MAIÚSCULAS, bold, border-bottom
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1 mt-4 border-b border-black pb-0.5">
      <h2 className="text-[13px] font-bold uppercase tracking-[0.1em]">
        {children}
      </h2>
    </div>
  );
}

// Educação: Instituição/Cidade | Grau/Data
function HarvardEducation({ resumeData }: ResumeTemplateProps) {
  const { educations } = resumeData;
  const filtered = educations?.filter(
    (edu) => Object.values(edu).filter(Boolean).length > 0,
  );
  if (!filtered?.length) return null;

  return (
    <>
      <SectionTitle>EDUCATION</SectionTitle>
      <div className="space-y-2">
        {filtered.map((edu, i) => (
          <div key={i} className="break-inside-avoid">
            <div className="flex items-start justify-between">
              <span className="font-bold">{edu.school}</span>
              {edu.startDate && (
                <span className="shrink-0 text-right text-[11.5px]">
                  {formatDate(edu.startDate, "MMM yyyy")}
                  {edu.endDate ? ` – ${formatDate(edu.endDate, "MMM yyyy")}` : ""}
                </span>
              )}
            </div>
            {edu.degree && (
              <p className="italic text-[11.5px]">{edu.degree}</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// Experiência: Empresa/Cidade | Cargo/Data | Bullets
function HarvardExperience({ resumeData }: ResumeTemplateProps) {
  const { workExperiences } = resumeData;
  const filtered = workExperiences?.filter(
    (exp) => Object.values(exp).filter(Boolean).length > 0,
  );
  if (!filtered?.length) return null;

  return (
    <>
      <SectionTitle>EXPERIENCE</SectionTitle>
      <div className="space-y-3">
        {filtered.map((exp, i) => (
          <div key={i} className="break-inside-avoid">
            <div className="flex items-start justify-between">
              <span className="font-bold">{exp.company}</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="italic text-[11.5px]">{exp.position}</span>
              {exp.startDate && (
                <span className="shrink-0 text-right text-[11.5px]">
                  {formatDate(exp.startDate, "MMM yyyy")} –{" "}
                  {exp.endDate ? formatDate(exp.endDate, "MMM yyyy") : "Present"}
                </span>
              )}
            </div>
            {exp.description && (
              <ul className="ml-3 mt-1 list-disc space-y-0.5 text-[11.5px]">
                {exp.description.split("\n").filter(Boolean).map((line, j) => (
                  <li key={j}>{line.replace(/^[-•]\s*/, "")}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// Seções customizadas como Leadership & Activities
function HarvardCustomSections({ resumeData }: ResumeTemplateProps) {
  const { customSections } = resumeData;
  const filtered = customSections?.filter(
    (s) => Object.values(s).filter(Boolean).length > 0,
  );
  if (!filtered?.length) return null;

  return (
    <>
      {filtered.map((section, i) => (
        <div key={i} className="break-inside-avoid">
          {section.title && <SectionTitle>{section.title}</SectionTitle>}
          {section.content && (
            <ul className="ml-3 list-disc space-y-0.5 text-[11.5px]">
              {section.content.split("\n").filter(Boolean).map((line, j) => (
                <li key={j}>{line.replace(/^[-•*]\s*/, "")}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </>
  );
}

// Skills & Interests
function HarvardSkills({ resumeData }: ResumeTemplateProps) {
  const { skills } = resumeData;
  if (!skills?.length) return null;

  return (
    <>
      <SectionTitle>SKILLS & INTERESTS</SectionTitle>
      <p className="text-[11.5px]">
        <span className="font-bold">Technical: </span>
        {skills.join(", ")}
      </p>
    </>
  );
}
