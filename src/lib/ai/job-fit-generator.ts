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

    // 2. Summary Generation
    if (originalResume.summary && originalResume.summary.trim().length > 10) {
      try {
        const sysPrompt = `Você é um especialista em recrutamento. Sua tarefa é reescrever o Resumo Profissional do candidato focado estritamente na descrição da vaga fornecida.
Retorne APENAS o resumo reescrito (3 a 5 linhas).
INSTRUÇÃO ESPECIAL: Você DEVE "mentir" um pouco no resumo, afirmando explicitamente e de forma natural que o candidato possui sólido conhecimento e experiência prática exata nas tecnologias, ferramentas ou habilidades que a vaga exige. Garanta o fit perfeito incorporando as palavras-chave da vaga no texto em primeira pessoa.`;
        
        const userPrompt = `VAGA:
${generation.jobDescription}

RESUMO ATUAL:
${originalResume.summary}

REESCREVA EM PRIMEIRA PESSOA:`;
        
        finalSummary = await generateWithRetry(sysPrompt, userPrompt);
      } catch (error) {
        console.error("Summary generation failed:", error);
      }
    }
    await updateProgress();

    // 3. Work Experiences Generation
    const finalExperiences = [];
    for (const exp of originalResume.workExperiences) {
      let finalDescription = exp.description;
      if (exp.description && exp.description.trim().length > 10) {
        try {
          const sysPrompt = `Você é um especialista em recrutamento. Reescreva os tópicos da descrição de experiência profissional do candidato focando APENAS em destacar as métricas e responsabilidades que mais se alinham à vaga alvo.
NÃO INVENTE FATOS. Use verbos de ação. Mantenha formato de bullet points. Retorne APENAS a descrição reescrita.`;
          
          const userPrompt = `VAGA ALVO:
${generation.jobDescription}

CARGO DO CANDIDATO: ${exp.position} em ${exp.company}
DESCRIÇÃO ATUAL:
${exp.description}

REESCREVA NO FORMATO DE BULLET POINTS COM MAIOR FIT PARA A VAGA:`;
          
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
      const sysPrompt = `Com base na VAGA e nas SKILLS ATUAIS do candidato, sugira até 5 novas HARD SKILLS que o candidato DEVE adicionar ao currículo para melhorar seu ATS, desde que sejam inferíveis de seu histórico.
Responda APENAS com um JSON simples, um array de strings. Exemplo: ["Python", "Docker"]. Nenhum texto adicional.`;

      const userPrompt = `VAGA:
${generation.jobDescription}

SKILLS ATUAIS DO CANDIDATO:
${finalSkills.join(", ")}

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
          create: originalResume.educations.map((edu) => ({
            degree: edu.degree,
            school: edu.school,
            startDate: edu.startDate,
            endDate: edu.endDate,
          })),
        },
        customSections: {
          create: originalResume.customSections.map((sec) => ({
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
