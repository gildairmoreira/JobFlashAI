import { env } from "@/env";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || "");
// @ts-ignore
genAI.apiVersion = "v1beta";

// Helper function for exponential backoff
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateWithRetry(
  systemInstruction: string,
  userMessage: string,
  modelName: string | string[] = ["gemini-2.5-flash", "gemini-3.1-flash-lite"],
  maxRetries: number = 3
): Promise<string> {
  const models = Array.isArray(modelName) ? modelName : [modelName];
  let lastError: any = null;

  for (const currentModel of models) {
    let attempt = 0;
    let waitTime = 2000; // Start with 2 seconds

    const model = genAI.getGenerativeModel({
      model: currentModel,
      systemInstruction,
      generationConfig: {
        temperature: 0.2, // Temperature tuning for better professional results
      },
    });

    while (attempt < maxRetries) {
      try {
        const response = await model.generateContent(userMessage);
        const aiResponse = response.response.text();
        
        if (!aiResponse) {
          throw new Error(`Falha ao gerar resposta da IA com o modelo ${currentModel}`);
        }
        return aiResponse;
      } catch (error: any) {
        lastError = error;
        const status = error?.status || error?.response?.status;
        const isRateLimit = status === 429 || error?.message?.includes("429") || error?.message?.includes("Too Many Requests");

        if (isRateLimit && attempt < maxRetries - 1) {
          attempt++;
          console.warn(`[Gemini API - ${currentModel}] 429 Too Many Requests. Tentando novamente em ${waitTime}ms... (Tentativa ${attempt}/${maxRetries})`);
          await delay(waitTime);
          waitTime *= 2; // Aumenta o tempo de espera exponencialmente
        } else {
          // Se não for erro de rate limit, ou se excedermos o limite de tentativas para este modelo específico
          console.warn(`[Gemini API - ${currentModel}] Geração falhou após ${attempt + 1} tentativas (ou erro não-rate-limit). Tentando próximo modelo se houver...`);
          break; // Interrompe o loop atual para tentar o próximo modelo da lista
        }
      }
    }
  }

  if (lastError) {
    const status = lastError?.status || lastError?.response?.status;
    const isRateLimit = status === 429 || lastError?.message?.includes("429") || lastError?.message?.includes("Too Many Requests");
    if (isRateLimit) {
        throw new Error("RATE_LIMIT_EXCEEDED");
    }
    throw lastError;
  }

  throw new Error("Falha ao gerar resposta em todos os modelos");
}

export default genAI;
