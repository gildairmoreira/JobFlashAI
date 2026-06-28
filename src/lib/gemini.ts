import { env } from "@/env";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || "");
// @ts-ignore
genAI.apiVersion = "v1beta";

// Helper para exponential backoff
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Cascata de modelos validados na API gratuita do Gemini (junho/2026)
// Ordem: modelos mais leves e baratos primeiro, escalando para modelos mais capazes
const DEFAULT_MODEL_CASCADE = [
  "gemini-2.0-flash-lite",    // Mais leve, maior cota free
  "gemini-2.5-flash-lite",    // Leve com boa qualidade
  "gemini-3.1-flash-lite",    // Novo, leve com thinking
  "gemini-2.5-flash",         // Mais capaz, menor cota free
];

export async function generateWithRetry(
  systemInstruction: string,
  userMessage: string,
  modelName: string | string[] = DEFAULT_MODEL_CASCADE,
  maxRetries: number = 3,
  responseMimeType?: string
): Promise<string> {
  const models = Array.isArray(modelName) ? modelName : [modelName];
  let lastError: any = null;

  for (const currentModel of models) {
    let attempt = 0;
    let waitTime = 1500; // Inicia com 1.5s

    const model = genAI.getGenerativeModel({
      model: currentModel,
      systemInstruction,
      generationConfig: {
        temperature: 0.15,
        // Apenas inclui responseMimeType se explicitamente passado pelo caller
        // Prompts de texto livre (summary, experiência, tradução) NÃO devem forçar JSON
        ...(responseMimeType ? { responseMimeType } : {}),
      },
      safetySettings: [
        {
          // @ts-ignore
          category: "HARM_CATEGORY_HARASSMENT",
          // @ts-ignore
          threshold: "BLOCK_NONE",
        },
        {
          // @ts-ignore
          category: "HARM_CATEGORY_HATE_SPEECH",
          // @ts-ignore
          threshold: "BLOCK_NONE",
        },
      ],
    });

    while (attempt < maxRetries) {
      try {
        console.log(`[Gemini Cascade] Tentando modelo: ${currentModel} (Tentativa ${attempt + 1})`);
        const response = await model.generateContent(userMessage);
        const aiResponse = response.response.text();
        
        if (!aiResponse) {
          throw new Error(`Falha ao gerar resposta da IA com o modelo ${currentModel}`);
        }
        
        console.log(`[Gemini Success] Sucesso com o modelo: ${currentModel}`);
        return aiResponse;
      } catch (error: any) {
        lastError = error;
        const status = error?.status || error?.response?.status;
        const errorMessage = error?.message?.toLowerCase() || '';

        // Erros de Rate Limit (429), Quota Exceeded (403), ou Serviço Indisponível (503)
        const isRetryableError = status === 429 || status === 403 || status === 503 ||
                           errorMessage.includes("429") || 
                           errorMessage.includes("quota") ||
                           errorMessage.includes("too many requests") ||
                           errorMessage.includes("service unavailable") ||
                           errorMessage.includes("overloaded");

        // Modelo não encontrado (404) - pula direto para o próximo modelo sem retry
        const isModelNotFound = status === 404 || errorMessage.includes("not found");

        if (isModelNotFound) {
          console.warn(`[Gemini Cascade] Modelo ${currentModel} não encontrado (404). Pulando para o próximo...`);
          break;
        }

        if (isRetryableError) {
          if (attempt < maxRetries - 1) {
            attempt++;
            console.warn(`[Gemini API - ${currentModel}] Limite/indisponibilidade. Tentando novamente em ${waitTime}ms...`);
            await delay(waitTime);
            waitTime *= 2;
          } else {
            console.warn(`[Gemini Cascade] Limite final do modelo ${currentModel} atingido. Mudando para o próximo modelo da fila...`);
            break;
          }
        } else {
          // Erro diferente de cota/disponibilidade (ex: erro de sintaxe, formato, safety block)
          console.error(`[Gemini Error - ${currentModel}] Erro não-retryable: ${error.message}`);
          break; 
        }
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("Falha total: Todos os modelos da cascata atingiram o limite.");
}

export default genAI;

