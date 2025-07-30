"use server";

import { canUseAITools } from "@/lib/permissions";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import gemini from "@/lib/gemini";
import {
  GenerateSummaryInput,
  generateSummarySchema,
  GenerateWorkExperienceInput,
  generateWorkExperienceSchema,
  WorkExperience,
} from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";

export async function generateSummary(input: GenerateSummaryInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Não autorizado");
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Atualize sua assinatura para usar este recurso");
  }

  const { jobTitle, workExperiences, educations, skills } =
    generateSummarySchema.parse(input);

  const systemMessage = `
    Você é um gerador de currículos de emprego com IA. Sua tarefa é escrever um resumo de introdução profissional para um currículo com base nos dados fornecidos pelo usuário.
    Retorne apenas o resumo e não inclua nenhuma outra informação na resposta. Mantenha-o conciso e profissional.
    `;

  const userMessage = `
    Please generate a professional resume summary from this data:

    Job title: ${jobTitle || "N/A"}

    Work experience:
    ${workExperiences
      ?.map(
        (exp) => `
        Cargo: ${exp.position || "N/A"} na ${exp.company || "N/A"} de ${exp.startDate || "N/A"} até ${exp.endDate || "Presente"}

        Descrição:
        ${exp.description || "N/A"}
        `,
      )
      .join("\n\n")}

      Educação:
    ${educations
      ?.map(
        (edu) => `
        Grau: ${edu.degree || "N/A"} na ${edu.school || "N/A"} de ${edu.startDate || "N/A"} até ${edu.endDate || "N/A"}
        `,
      )
      .join("\n\n")}

      Habilidades:
      ${skills}
    `;

  const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });
  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: systemMessage }] },
      { role: "model", parts: [{ text: "Entendido." }] },
    ],
  });
  const result = await chat.sendMessage(userMessage);
  const aiResponse = result.response.text();
  if (!aiResponse) {
    throw new Error("Falha ao gerar resposta da IA");
  }
  return aiResponse;
}

export async function generateWorkExperience(
  input: GenerateWorkExperienceInput,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Upgrade your subscription to use this feature");
  }

  const { description } = generateWorkExperienceSchema.parse(input);

  const systemMessage = `
  Você é um gerador de currículos de emprego com IA. Sua tarefa é gerar uma única entrada de experiência profissional com base na entrada do usuário.
  Sua resposta deve aderir à seguinte estrutura. Você pode omitir campos se eles não puderem ser inferidos dos dados fornecidos, mas não adicione novos.

  Cargo: <cargo>
  Empresa: <nome da empresa>
  Data de início: <formato: AAAA-MM-DD> (somente se fornecido)
  Data de término: <formato: AAAA-MM-DD> (somente se fornecido)
  Descrição: <uma descrição otimizada em formato de bullet, pode ser inferida do cargo>
  `;

  const userMessage = `
  Forneça uma entrada de experiência profissional a partir desta descrição:
  ${description}
  `;

  const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });
  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: systemMessage }] },
      { role: "model", parts: [{ text: "Entendido." }] },
    ],
  });
  const result = await chat.sendMessage(userMessage);
  const aiResponse = result.response.text();
  if (!aiResponse) {
    throw new Error("Falha ao gerar resposta da IA");
  }
  return {
    position: aiResponse.match(/Cargo: (.*)/)?.[1] || "",
    company: aiResponse.match(/Empresa: (.*)/)?.[1] || "",
    description: (aiResponse.match(/Descrição:([\s\S]*)/)?.[1] || "").trim(),
    startDate: aiResponse.match(/Data de início: (\d{4}-\d{2}-\d{2})/)?.[1],
    endDate: aiResponse.match(/Data de término: (\d{4}-\d{2}-\d{2})/)?.[1],
  } satisfies WorkExperience;
}
