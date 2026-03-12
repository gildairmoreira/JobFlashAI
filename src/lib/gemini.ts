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
  modelName: string = "gemini-2.5-flash",
  maxRetries: number = 3
): Promise<string> {
  let attempt = 0;
  let waitTime = 2000; // Start with 2 seconds

  const model = genAI.getGenerativeModel({
    model: modelName,
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
        throw new Error("Falha ao gerar resposta da IA");
      }
      return aiResponse;
    } catch (error: any) {
      const status = error?.status || error?.response?.status;
      const isRateLimit = status === 429 || error?.message?.includes("429") || error?.message?.includes("Too Many Requests");

      if (isRateLimit && attempt < maxRetries - 1) {
        attempt++;
        console.warn(`[Gemini API] 429 Too Many Requests. Retrying in ${waitTime}ms... (Attempt ${attempt}/${maxRetries})`);
        await delay(waitTime);
        waitTime *= 2; // Exponential backoff
      } else {
        // If it's not a rate limit, or we exceeded retries
        if (isRateLimit) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }
        throw error;
      }
    }
  }

  throw new Error("RATE_LIMIT_EXCEEDED");
}

export default genAI;
