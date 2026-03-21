import prisma from "@/lib/prisma";
import { generateWithRetry } from "@/lib/gemini";
import { ResumeValues } from "@/lib/validation";

export async function runJobFitGeneration(generationId: string, userId: string) {
  try {
    // 1. Setup - Fetch records
    const generation = await (prisma as any).jobFitGeneration.findUnique({
      where: { id: generationId },
    });

    if (!generation || generation.status !== "pending") return;

    // Start processing
    await (prisma as any).jobFitGeneration.update({
      where: { id: generationId },
      data: { status: "processing" },
    });

    const originalResume = await prisma.resume.findUnique({
      where: { id: generation.sourceResumeId, userId },
      include: {
        workExperiences: true,
        educations: true,
        customSections: true,
      },
    });

    if (!originalResume) {
      throw new Error("Source resume not found.");
    }

    const jobTitleShortcut = generation.jobDescription.substring(0, 40).replace(/\n/g, " ");
    let finalSummary = originalResume.summary;
    let finalSkills = [...(originalResume.skills || [])];

    // Pre-calculate the total steps
    // 1 (Summary) + experiences.length + 1 (Skills)
    const totalSteps = 1 + originalResume.workExperiences.length + 1;
    let completedSteps = 0;

    const updateProgress = async () => {
      completedSteps++;
      await (prisma as any).jobFitGeneration.update({
        where: { id: generationId },
        data: { sectionsCompleted: Math.min(completedSteps, totalSteps) },
      });
    };

    // 2. Summary Generation - ALWAYS GENERATE OR ADAPT
    try {
      const hasSummary = originalResume.summary && originalResume.summary.trim().length > 10;
      
      const sysPrompt = `Você é um expert em recrutamento e redação corporativa.
Sua tarefa é ${hasSummary ? 'reescrever o Resumo Profissional do candidato' : 'criar um Resumo Profissional novo para o candidato'} focado estritamente nas necessidades da vaga fornecida.
Retorne APENAS o texto do resumo ${hasSummary ? 'reescrito' : 'criado'} (3 a 5 linhas compactas). Nunca inclua saudações, aspas ou textos extras informais.

REGRAS CRÍTICAS:
1. TONE PROFISSIONAL: Escreva SEMPRE em primeira pessoa de forma BASTANTE natural e humana ("Desenvolvi", "Atuei", "Sou experiente"). NUNCA use frases impessoais ou 3ª pessoa, como "possui conhecimento em" ou "é um profissional".
2. ESTRUTURA IDEAL: Inicie confirmando diretamente seu FIT. Exemplo de bom resumo: "Sou um Desenvolvedor Full Stack com sólida vivência em X e Y. Minha atuação é focada na otimização de interfaces..."
3. PALAVRAS-CHAVE ATS: Você DEVE afirmar explicitamente que o candidato possui as habilidades técnicas e comportamentais cruciais que a vaga exige, inserindo as exatas palavras-chave da vaga de forma natural.`;
      
      const userPrompt = `VAGA:
${generation.jobDescription}

${hasSummary ? 'RESUMO ATUAL:\n' + originalResume.summary : 'O candidato não inseriu um resumo ainda. Crie um resumo impactante do zero focado na vaga.'}

${hasSummary ? 'REESCREVA' : 'CRIE'} O RESUMO APLICANDO AS REGRAS (SEM PRIMEIRA PESSOA):`;
      
      finalSummary = await generateWithRetry(sysPrompt, userPrompt);
    } catch (error) {
      console.error("Summary generation failed:", error);
    }
    await updateProgress();

    // 3. Work Experiences Generation
    const finalExperiences = [];
    for (const exp of originalResume.workExperiences) {
      let finalDescription = exp.description;
      if (exp.description && exp.description.trim().length > 10) {
        try {
          const sysPrompt = `Você é um especialista em recrutamento e redação de currículos de alto impacto focado em testes ATS.
Sua tarefa é reescrever a descrição da experiência profissional do candidato destacando APENAS as conquistas, métricas e responsabilidades que mais se alinham à vaga alvo.

REGRAS CRÍTICAS:
1. Retorne APENAS bullet points (um tópico por linha, usando o modelo: - Texto).
2. USE PRIMEIRA PESSOA de forma natural e corporativa. O candidato está contando o que fez. (ex: "Atuei na equipe", "Implementei"). Nunca seja robótico.
3. COMECE COM VERBOS DE AÇÃO NO PASSADO OU PRESENTE ("Desenvolvi aplicações...", "Liderei projetos técnicos...", "Fui responsável pela arquitetura...").
4. NÃO INVENTE tecnologias ou fatos que o candidato não citou. Apenas destaque e melhore as palavras do texto atual que fazem sentido para a vaga.`;
          
          const userPrompt = `VAGA ALVO:
${generation.jobDescription}

CARGO DO CANDIDATO: ${exp.position} em ${exp.company}
DESCRIÇÃO ATUAL:
${exp.description}

REESCREVA EM BULLET POINTS COM MAIOR FIT PARA A VAGA (SIGA A REGRA DE TONALIDADE IMPESSOAL):`;
          
          finalDescription = await generateWithRetry(sysPrompt, userPrompt);
        } catch (error) {
          console.error(`Experience generation failed for ${exp.company}:`, error);
        }
      }
      finalExperiences.push({ ...exp, description: finalDescription });
      await updateProgress();
    }

    // 4. Skills Suggestion
    try {
      const hasSkills = finalSkills.length > 0;
      
      const sysPrompt = `Com base na VAGA fornecida${hasSkills ? ' e nas SKILLS ATUAIS do candidato' : ''}, sugira ${hasSkills ? 'até 5 novas HARD SKILLS que o candidato DEVE adicionar ao currículo' : 'até 8 HARD SKILLS e COMPETÊNCIAS essenciais'} para melhorar seu ATS.
Responda APENAS com um JSON simples, um array de strings. Exemplo: ["Python", "Docker"]. Nenhum texto adicional.`;

      const userPrompt = `VAGA:
${generation.jobDescription}

${hasSkills ? 'SKILLS ATUAIS DO CANDIDATO:\n' + finalSkills.join(", ") : 'O candidato ainda não tem skills na sessão. Iremos sugerir do zero baseadas puramente na vaga e área de atuação!'}

RETORNE JSON:`;

      const responseText = await generateWithRetry(sysPrompt, userPrompt);
      const cleanJson = responseText.replace(/```json\n?/g, "").replace(/```/g, "").trim();
      const suggestedSkills = JSON.parse(cleanJson);
      if (Array.isArray(suggestedSkills)) {
        // Append distinct new skills
        const lowerSkills = finalSkills.map((s) => s.toLowerCase());
        for (const s of suggestedSkills) {
          if (typeof s === "string" && !lowerSkills.includes(s.toLowerCase())) {
            finalSkills.push(s);
          }
        }
      }
    } catch (error) {
      console.error("Skills generation failed:", error);
    }
    await updateProgress();

    // 5. Create new Resume Copy
    const newResume = await prisma.resume.create({
      data: {
        userId,
        title: `Vaga: ${jobTitleShortcut}...`,
        description: `Adaptado em ${new Date().toLocaleDateString("pt-BR")}`,
        photoUrl: originalResume.photoUrl,
        colorHex: originalResume.colorHex,
        borderStyle: originalResume.borderStyle,
        templateId: (originalResume as any).templateId || "classic",
        fontFamily: (originalResume as any).fontFamily || "lato",
        firstName: originalResume.firstName,
        lastName: originalResume.lastName,
        jobTitle: originalResume.jobTitle,
        city: originalResume.city,
        country: originalResume.country,
        phone: originalResume.phone,
        email: originalResume.email,
        socialLinks: originalResume.socialLinks || [],
        summary: finalSummary,
        skills: finalSkills,
        workExperiences: {
          create: finalExperiences.map((exp) => ({
            position: exp.position,
            company: exp.company,
            startDate: exp.startDate,
            endDate: exp.endDate,
            description: exp.description,
          })),
        },
        educations: {
          create: originalResume.educations.map((edu: any) => ({
            degree: edu.degree,
            school: edu.school,
            startDate: edu.startDate,
            endDate: edu.endDate,
          })),
        },
        customSections: {
          create: originalResume.customSections.map((sec: any) => ({
            title: sec.title,
            content: sec.content,
          })),
        },
      } as any, // Cast to any to bypass Prisma not detecting templateId and fontFamily fields
    });

    // 6. Finish
    await (prisma as any).jobFitGeneration.update({
      where: { id: generationId },
      data: {
        status: "done",
        outputResumeId: newResume.id,
      },
    });

  } catch (error: any) {
    console.error("JobFit Generator full process failed:", error);
    await (prisma as any).jobFitGeneration.update({
      where: { id: generationId },
      data: {
        status: "error",
        errorMessage: error?.message || "Erro desconhecido durante geração.",
      },
    });
  }
}
