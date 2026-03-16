// Registro central de templates de currículo
// Cada template é um componente React que recebe ResumeValues como props

import { ResumeValues } from "@/lib/validation";

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  supportsPhoto: boolean;
  defaultFont: string; // ID da fonte padrão (referência ao fonts.ts)
}

// Configurações dos templates disponíveis (sem importar os componentes diretamente)
export const TEMPLATES: TemplateConfig[] = [
  {
    id: "classic",
    name: "Clássico",
    description: "Layout limpo e profissional, ideal para qualquer área.",
    supportsPhoto: true,
    defaultFont: "lato",
  },
  {
    id: "harvard",
    name: "Harvard Classic",
    description: "Template acadêmico, ideal para pesquisa e corporativo tradicional.",
    supportsPhoto: false,
    defaultFont: "eb-garamond",
  },
  {
    id: "modern-photo",
    name: "Modern Sidebar",
    description: "Template moderno com sidebar. Ideal para tech e startups.",
    supportsPhoto: true,
    defaultFont: "dm-sans",
  },
];

/** Retorna a configuração do template pelo ID ou o clássico como fallback */
export function getTemplateById(templateId: string): TemplateConfig {
  return TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
}

/** Props padrão que todos os templates recebem */
export interface ResumeTemplateProps {
  resumeData: ResumeValues;
}
