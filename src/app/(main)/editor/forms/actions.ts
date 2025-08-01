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
    IMPORTANTE: Escreva sempre em primeira pessoa ("Sou", "Tenho", "Desenvolvi", etc.) e não em terceira pessoa.
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
  IMPORTANTE: Na descrição, escreva sempre em primeira pessoa ("Desenvolvi", "Implementei", "Colaborei", etc.) e não em terceira pessoa.
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

export async function generateCustomSection(input: { description: string }) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Não autorizado");
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Atualize sua assinatura para usar este recurso");
  }

  const { description } = input;

  const systemMessage = `
    Você é um assistente de IA especializado em criar seções personalizadas para currículos.
    
    INSTRUÇÕES IMPORTANTES:
    1. SEMPRE crie conteúdo baseado EXATAMENTE na descrição fornecida pelo usuário
    2. NUNCA peça mais informações, diga que está incompleta ou gere conteúdo genérico não relacionado
    3. Use criatividade apenas para expandir os detalhes fornecidos de forma profissional, mantendo fidelidade ao input
    4. Escreva sempre em primeira pessoa ("Desenvolvi", "Criei", "Implementei")
    5. Use formatação Markdown (listas, negrito, itálico, links)
    6. Para seções de projetos: Gere uma lista com os projetos mencionados, incluindo descrições breves, tecnologias e placeholders para links de repositório ([Link do Repositório](url)) e deploy ([Link do Deploy](url))
    7. O objetivo é gerar um template editável para o usuário preencher detalhes adicionais
    8. Sempre comece com um título apropriado como a primeira linha em texto simples, sem cabeçalhos Markdown como # ou ### (ex: Projetos), seguido do conteúdo em Markdown.
    
    Exemplo de formato para projetos se for da area de tecnologia:
    Projetos
    - **Projeto Cripto Currency**: Desenvolvi um aplicativo de criptomoedas usando API CoinGecko. Tecnologias: React, JavaScript. [Link do Repositório](https://github.com/seu-repo) | [Link do Deploy](https://deploy-url.com)
    - **Gerador de Currículo com IA**: Criei um gerador de currículos usando Gemini AI. Tecnologias: Next.js, TypeScript. [Link do Repositório](https://github.com/seu-repo) | [Link do Deploy](https://deploy-url.com)
    - **Jogo em Python**: Implementei um jogo usando Pygame para disciplina de OOP. Tecnologias: Python, Pygame. [Link do Repositório](https://github.com/seu-repo) | [Link do Deploy](https://deploy-url.com)
    
    IMPORTANTE: O título deve ser texto simples sem formatação Markdown. Foque em gerar um template com título e conteúdo, nada mais. Expanda apenas o necessário para torná-lo profissional e editável.
  `;

  const userMessage = `Crie uma seção personalizada para currículo baseada na seguinte descrição: ${description}`;

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
