import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/env";

// Configuração da API do Gemini
const genAI = new GoogleGenerativeAI("AIzaSyBVsMZT-kadqknw2iAXCInth3EqJ6y3_JU");

// Modelo Gemini Pro para geração de texto
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });

// Função para gerar conteúdo de currículo usando Gemini
export async function generateResumeContent(prompt: string): Promise<string> {
  try {
    // Chave API já configurada diretamente no código

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

Por favor, retorne as informações no seguinte formato:
Cargo: [cargo/posição]
Empresa: [nome da empresa]
Descrição: [descrição melhorada e profissional]
Data de início: [YYYY-MM-DD se mencionado]
Data de fim: [YYYY-MM-DD se mencionado]

Se alguma informação não estiver disponível, use valores apropriados ou deixe em branco.

Resposta em português brasileiro:`;

  const response = await generateResumeContent(prompt);
  
  // Parse da resposta para extrair as informações
  const position = response.match(/Cargo: (.*)/)?.[1]?.trim() || "";
  const company = response.match(/Empresa: (.*)/)?.[1]?.trim() || "";
  const improvedDescription = response.match(/Descrição: ([\s\S]*?)(?=Data de início:|$)/)?.[1]?.trim() || description;
  const startDate = response.match(/Data de início: (\d{4}-\d{2}-\d{2})/)?.[1];
  const endDate = response.match(/Data de fim: (\d{4}-\d{2}-\d{2})/)?.[1];
  
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
  workExperiences?: any[];
  educations?: any[];
  skills?: string;
}): Promise<string> {
  const experienceText = workExperiences?.map(exp => `${exp.position || 'Cargo'} na ${exp.company || 'Empresa'}`).join(", ") || "Sem experiências informadas";
  const educationText = educations?.map(edu => `${edu.degree || 'Formação'} em ${edu.school || 'Instituição'}`).join(", ") || "Sem formação informada";
  const skillsText = skills || "Sem habilidades informadas";
  
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