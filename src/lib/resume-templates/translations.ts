export type Language = "pt" | "en";

export const translations = {
  pt: {
    personalInfo: "Informações Pessoais",
    summary: "Resumo Profissional",
    workExperience: "Experiência Profissional",
    education: "Formação Acadêmica",
    skills: "Habilidades & Competências",
    skillsLabel: "Principais",
    present: "Atual",
    location: "Localização",
    contact: "Contato",
  },
  en: {
    personalInfo: "Personal Information",
    summary: "Professional Summary",
    workExperience: "Work Experience",
    education: "Education",
    skills: "Skills & Interests",
    skillsLabel: "Technical",
    present: "Present",
    location: "Location",
    contact: "Contact",
  },
};

export function getTranslation(lang: string | undefined | null) {
  const l = lang === "en" ? "en" : "pt";
  return translations[l];
}
