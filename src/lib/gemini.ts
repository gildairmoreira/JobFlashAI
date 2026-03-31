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
  modelName: string | string[] = ["gemini-3.1-flash-lite", "gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-3-flash"],
  maxRetries: number = 3
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
        responseMimeType: "application/json",
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

        // Erros de Rate Limit (429) ou Quota Exceeded (403)
        const isQuotaError = status === 429 || status === 403 || 
                           errorMessage.includes("429") || 
                           errorMessage.includes("quota") ||
                           errorMessage.includes("too many requests");

        if (isQuotaError) {
          if (attempt < maxRetries - 1) {
            attempt++;
            console.warn(`[Gemini API - ${currentModel}] Limite de cota atingido. Tentando novamente em ${waitTime}ms...`);
            await delay(waitTime);
            waitTime *= 2;
          } else {
            console.warn(`[Gemini Cascade] Limite final do modelo ${currentModel} atingido. Mudando para o próximo modelo da fila...`);
            break; // Sai do while para tentar o próximo modelo no loop for
          }
        } else {
          // Se for um erro diferente de cota (ex: erro de sintaxe, formato), pula para o próximo modelo para ser seguro
          console.error(`[Gemini Error - ${currentModel}] Erro não-cota: ${error.message}`);
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
