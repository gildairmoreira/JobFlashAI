// Registro central de fontes disponíveis para os templates de currículo
// Todas as fontes são do Google Fonts e carregadas via <link> no layout raiz

export interface FontOption {
  id: string;
  name: string;
  category: "serif" | "sans-serif";
  googleImport: string;
  cssFamily: string; // valor exato para font-family CSS
  bestFor: string;
  defaultForTemplate?: string;
}

export const FONTS: FontOption[] = [
  {
    id: "lato",
    name: "Lato",
    category: "sans-serif",
    googleImport: "Lato:wght@300;400;700",
    cssFamily: "'Lato', sans-serif",
    bestFor: "Uso geral, template clássico",
    defaultForTemplate: "classic",
  },
  {
    id: "eb-garamond",
    name: "EB Garamond",
    category: "serif",
    googleImport: "EB+Garamond:wght@400;500;600;700",
    cssFamily: "'EB Garamond', serif",
    bestFor: "Template Harvard, perfis acadêmicos",
    defaultForTemplate: "harvard",
  },
  {
    id: "dm-sans",
    name: "DM Sans",
    category: "sans-serif",
    googleImport: "DM+Sans:wght@300;400;500;600;700",
    cssFamily: "'DM Sans', sans-serif",
    bestFor: "Template moderno, tech e startups",
    defaultForTemplate: "modern-photo",
  },
  {
    id: "merriweather",
    name: "Merriweather",
    category: "serif",
    googleImport: "Merriweather:wght@300;400;700",
    cssFamily: "'Merriweather', serif",
    bestFor: "Jurídico, financeiro, consultoria",
  },
  {
    id: "nunito-sans",
    name: "Nunito Sans",
    category: "sans-serif",
    googleImport: "Nunito+Sans:wght@300;400;600;700",
    cssFamily: "'Nunito Sans', sans-serif",
    bestFor: "Perfis criativos e de design",
  },
  {
    id: "source-serif-4",
    name: "Source Serif 4",
    category: "serif",
    googleImport: "Source+Serif+4:wght@300;400;600;700",
    cssFamily: "'Source Serif 4', serif",
    bestFor: "Jornalismo, comunicação, editorial",
  },
  {
    id: "ibm-plex-sans",
    name: "IBM Plex Sans",
    category: "sans-serif",
    googleImport: "IBM+Plex+Sans:wght@300;400;500;600",
    cssFamily: "'IBM Plex Sans', sans-serif",
    bestFor: "Engenharia, ciência de dados",
  },
  {
    id: "playfair-display",
    name: "Playfair Display",
    category: "serif",
    googleImport: "Playfair+Display:wght@400;500;600;700",
    cssFamily: "'Playfair Display', serif",
    bestFor: "Perfis executivos e criativos elegantes",
  },
  {
    id: "raleway",
    name: "Raleway",
    category: "sans-serif",
    googleImport: "Raleway:wght@300;400;500;600;700",
    cssFamily: "'Raleway', sans-serif",
    bestFor: "Designers, arquitetos e marketing",
  },
  {
    id: "rubik",
    name: "Rubik",
    category: "sans-serif",
    googleImport: "Rubik:wght@300;400;500;600;700",
    cssFamily: "'Rubik', sans-serif",
    bestFor: "Tecnologia e startups modernas",
  },
];

/** Retorna a fonte pelo ID ou a Lato como fallback */
export function getFontById(fontId: string): FontOption {
  return FONTS.find((f) => f.id === fontId) ?? FONTS[0];
}

/** Retorna a fonte padrão para um template específico */
export function getDefaultFontForTemplate(templateId: string): FontOption {
  return FONTS.find((f) => f.defaultForTemplate === templateId) ?? FONTS[0];
}

/** Gera a URL do Google Fonts para carregar todas as fontes */
export function getGoogleFontsUrl(): string {
  const families = FONTS.map((f) => `family=${f.googleImport}`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
