import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/env";

// Configuração da API do Gemini
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// Modelo Gemini 2.5 Flash para geração de texto
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Função para gerar conteúdo de currículo usando Gemini
export async function generateResumeContent(prompt: string): Promise<string> {
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text || text.trim().length === 0) {
      throw new Error("Resposta vazia da API do Gemini");
    }
    
    return text;
  } catch (error) {
    console.error("Erro ao gerar conteúdo com Gemini:", error);
    
    if (error instanceof Error) {
      // Se é um erro conhecido, propagar a mensagem específica
      if (error.message.includes("GEMINI_API_KEY") || 
          error.message.includes("API key") ||
          error.message.includes("authentication")) {
        throw new Error("Erro de autenticação: Verifique se sua chave da API do Gemini está configurada corretamente");
      }
      
      if (error.message.includes("quota") || error.message.includes("limit")) {
        throw new Error("Limite de uso da API atingido. Tente novamente mais tarde");
      }
      
      if (error.message.includes("network") || error.message.includes("fetch")) {
        throw new Error("Erro de conexão. Verifique sua internet e tente novamente");
      }
    }
    
    throw new Error("Falha ao gerar conteúdo com IA. Tente novamente");
  }
}

// Função para melhorar descrições de trabalho
export async function improveWorkExperience(description: string): Promise<{
  position: string;
  company: string;
  description: string;
  startDate?: string;
  endDate?: string;
}> {
  const prompt = `
Como especialista em currículos, analise a seguinte descrição e extraia/melhore as informações de experiência profissional:

Descrição: ${description}

Por favor, retorne as informações EXATAMENTE no seguinte formato:
Cargo: [cargo/posição extraído ou inferido]
Empresa: [nome da empresa extraído ou inferido]
Descrição: [descrição melhorada, profissional e otimizada para currículo]
Data de início: [YYYY-MM-DD se mencionado na descrição]
Data de fim: [YYYY-MM-DD se mencionado na descrição]

IMPORTANTE: 
- SEMPRE melhore e profissionalize a descrição, mesmo que seja apenas reformular o texto
- Use verbos de ação e quantifique resultados quando possível
- Se não houver informações específicas, infira baseado no contexto
- NUNCA retorne a descrição original sem melhorias

Resposta em português brasileiro:`;

  const response = await generateResumeContent(prompt);
  
  console.log('Resposta da IA:', response); // Debug log
  
  // Parse da resposta para extrair as informações
  const position = response.match(/Cargo:\s*(.+?)(?=\n|$)/)?.[1]?.trim() || "";
  const company = response.match(/Empresa:\s*(.+?)(?=\n|$)/)?.[1]?.trim() || "";
  
  // Melhor parsing para a descrição
  let improvedDescription = response.match(/Descrição:\s*([\s\S]*?)(?=Data de início:|Data de fim:|$)/)?.[1]?.trim();
  
  // Se não conseguiu extrair ou a descrição é muito similar à original, usar a resposta completa como fallback
  if (!improvedDescription || improvedDescription.length < 10) {
    // Tentar extrair qualquer texto após "Descrição:"
    const descMatch = response.match(/Descrição:\s*([\s\S]+)/)?.[1]?.trim();
    if (descMatch && descMatch.length > 10) {
      improvedDescription = descMatch.split(/\n(?=Data de|Cargo:|Empresa:)/)[0].trim();
    }
  }
  
  // Se ainda não temos uma boa descrição, usar a resposta inteira como descrição melhorada
  if (!improvedDescription || improvedDescription.length < 10) {
    improvedDescription = response.trim();
  }
  
  // Garantir que não retornamos a descrição original
  if (improvedDescription === description) {
    improvedDescription = `Experiência profissional com foco em ${description.toLowerCase()}. Responsável por atividades relacionadas ao desenvolvimento e implementação de soluções.`;
  }
  
  const startDate = response.match(/Data de início:\s*(\d{4}-\d{2}-\d{2})/)?.[1];
  const endDate = response.match(/Data de fim:\s*(\d{4}-\d{2}-\d{2})/)?.[1];
  
  console.log('Resultado parseado:', { position, company, description: improvedDescription, startDate, endDate }); // Debug log
  
  return {
    position,
    company,
    description: improvedDescription,
    startDate,
    endDate
  };
}

// Função para gerar resumo profissional
export async function generateProfessionalSummary({
  jobTitle,
  workExperiences,
  educations,
  skills
}: {
  jobTitle?: string;
  workExperiences?: Array<{ position?: string; company?: string }>;
  educations?: Array<{ degree?: string; school?: string }>;
  skills?: string[];
}): Promise<string> {
  const experienceText = workExperiences?.map(exp => `${exp.position || 'Cargo'} na ${exp.company || 'Empresa'}`).join(", ") || "Sem experiências informadas";
  const educationText = educations?.map(edu => `${edu.degree || 'Formação'} em ${edu.school || 'Instituição'}`).join(", ") || "Sem formação informada";
  const skillsText = skills?.join(", ") || "Sem habilidades informadas";
  
  const prompt = `
Crie um resumo profissional conciso e impactante baseado nas seguintes informações:

Cargo desejado: ${jobTitle || 'Não informado'}
Experiências: ${experienceText}
Formação: ${educationText}
Habilidades: ${skillsText}

O resumo deve ter entre 2-3 frases, destacar os pontos fortes do candidato e ser adequado para um currículo profissional.

Resposta em português brasileiro:`;

  return generateResumeContent(prompt);
}

// Função para sugerir habilidades baseadas no cargo
export async function suggestSkills(jobTitle: string, industry?: string): Promise<string[]> {
  const prompt = `
Baseado no cargo "${jobTitle}"${industry ? ` na área de ${industry}` : ""}, liste 8-10 habilidades técnicas e comportamentais mais relevantes para este profissional.

Retorne apenas uma lista separada por vírgulas, sem numeração ou explicações.

Resposta em português brasileiro:`;

  const response = await generateResumeContent(prompt);
  return response.split(",").map(skill => skill.trim()).filter(skill => skill.length > 0);
}