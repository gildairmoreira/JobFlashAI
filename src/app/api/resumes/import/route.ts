import { NextResponse } from 'next/server';
import { generateWithRetry } from '@/lib/gemini';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { canCreateResume, canImportResume } from '@/lib/permissions';
import { getUserSubscriptionLevel } from '@/lib/subscription';
import { auth } from '@clerk/nextjs/server';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "5 m"), // 5 imports a cada 5 min (generoso mas impede bot/abuse)
  analytics: true,
});

export async function POST(req: Request) {
  try {
    console.log('--- Iniciando processamento de PDF v5 (Native PDF.js) ---');
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { success } = await ratelimit.limit(userId);
    if (!success) {
      return NextResponse.json({ error: 'Muitas requisições. Tente novamente em alguns minutos.' }, { status: 429 });
    }

    // Check permissions
    const totalCount = await prisma.resume.count({ where: { userId } });
    const subscriptionLevel = await getUserSubscriptionLevel(userId);
    
    if (!canCreateResume(subscriptionLevel, totalCount)) {
      return NextResponse.json({ error: 'Você atingiu o limite de currículos do seu plano.' }, { status: 403 });
    }

    if (!canImportResume(subscriptionLevel)) {
      return NextResponse.json({ error: 'A importação de currículo via IA está disponível apenas para os planos Pro e Mensal.' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande. O tamanho máximo permitido é 2MB.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Apenas arquivos PDF são permitidos.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let pdfText = '';
    try {
      console.log('--- Iniciando extração nativa de texto ---');
      
      // Polyfill crucial para PDF.js v4+ em ambientes Node (Vercel/Next.js)
      // Evita o erro 'DOMMatrix is not defined' durante a extração de texto
      if (typeof global.DOMMatrix === 'undefined') {
        // @ts-ignore
        global.DOMMatrix = class DOMMatrix {
          a: number; b: number; c: number; d: number; e: number; f: number;
          constructor() {
            this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
          }
        };
      }

      // Importação dinâmica do PDF.js para ambiente Node
      // Usamos o build legacy para maior compatibilidade com ambientes sem canvas nativo
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      
      // Configuração crucial para Next.js/Turbopack: Apontar o worker para o arquivo físico local
      // Isso evita que o Turbopack tente resolver o import relativo interno do PDF.js
      const path = await import('path');
      let workerPath = path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
      
      // No Windows, precisamos converter o caminho para URL file:// para evitar erros de importação
      if (process.platform === 'win32') {
        workerPath = `file://${workerPath.replace(/\\/g, '/')}`;
      }
      
      // @ts-ignore
      pdfjs.GlobalWorkerOptions.workerSrc = workerPath;

      // Configuração adicional para ambiente Node: desabilitar worker se necessário ou forçar carregamento
      // Em alguns ambientes de produção, o worker externo pode falhar, então permitimos fallback
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
        disableFontFace: true,
        isEvalSupported: false,
        useWorkerFetch: false, // Importante para Vercel
        stopAtErrors: false,
      });

      const pdf = await loadingTask.promise;
      let textChunks: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        textChunks.push(pageText);
      }
      
      pdfText = textChunks.join('\n');
      console.log('Texto extraído nativamente. Tamanho:', pdfText.length);
      
    } catch (parseError: any) {
      console.error('Erro crítico na extração nativa do PDF:', parseError);
      return NextResponse.json({ 
        error: `Não foi possível ler o texto deste PDF (${parseError.message || 'Erro Interno'}).` 
      }, { status: 400 });
    }

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json({ error: 'Nenhum texto legível foi encontrado neste PDF. Ele pode ser uma imagem escaneada.' }, { status: 400 });
    }

    // EXTRAÇÃO INTELIGENTE COM CASCATA DE MODELOS
    const systemInstruction = `Você é um assistente especialista em extração de dados de currículos para um sistema ATS.  
Extraia o máximo de informações estruturadas do texto bruto do currículo do usuário abaixo em formato JSON puro.

REGRAS DE EXTRAÇÃO:
- Títulos de datas: Meses e anos devem ser convertidos para o formato YYYY-MM-DD (ex: Jan/20, Janeiro 2020 -> 2020-01-01).
- Se a data de fim for "Atualmente", "Presente" ou em aberto, deixe o campo de data de fim nulo (null).
- Siga rigorosamente este schema JSON:
{
  "title": "string", "firstName": "string", "lastName": "string", "jobTitle": "string",
  "city": "string", "country": "string", "phone": "string", "email": "string",
  "summary": "string", "skills": ["string"],
  "workExperiences": [{"position": "string", "company": "string", "startDate": "string", "endDate": "string", "description": "string"}],
  "educations": [{"degree": "string", "school": "string", "startDate": "string", "endDate": "string"}]
}`;

    const userMessage = `Extraia os dados deste currículo:\n\n${pdfText}`;

    const rawResponse = await generateWithRetry(systemInstruction, userMessage);
    
    // Limpar Markdown fences se a IA as incluir
    const cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    // Salvar no Banco de Dados
    const newResume = await prisma.resume.create({
      data: {
        userId,
        title: parsedData.title || 'Meu Currículo Importado',
        templateId: 'classic',
        fontFamily: 'lato',
        firstName: parsedData.firstName || '',
        lastName: parsedData.lastName || '',
        jobTitle: parsedData.jobTitle || '',
        city: parsedData.city || '',
        country: parsedData.country || '',
        phone: parsedData.phone || '',
        email: parsedData.email || '',
        summary: parsedData.summary || '',
        skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
        // Create nested entries
        ...(parsedData.workExperiences && Array.isArray(parsedData.workExperiences) && parsedData.workExperiences.length > 0 ? {
          workExperiences: {
            create: parsedData.workExperiences.map((we: any) => {
              const startDate = we.startDate && !isNaN(Date.parse(we.startDate)) ? new Date(we.startDate) : null;
              const endDate = we.endDate && !isNaN(Date.parse(we.endDate)) ? new Date(we.endDate) : null;
              
              return {
                position: we.position || '',
                company: we.company || '',
                startDate,
                endDate,
                description: we.description || '',
              };
            })
          }
        } : {}),
        ...(parsedData.educations && Array.isArray(parsedData.educations) && parsedData.educations.length > 0 ? {
          educations: {
            create: parsedData.educations.map((ed: any) => {
              const startDate = ed.startDate && !isNaN(Date.parse(ed.startDate)) ? new Date(ed.startDate) : null;
              const endDate = ed.endDate && !isNaN(Date.parse(ed.endDate)) ? new Date(ed.endDate) : null;
              
              return {
                degree: ed.degree || '',
                school: ed.school || '',
                startDate,
                endDate,
              };
            })
          }
        } : {})
      }
    });

    revalidatePath('/resumes');
    revalidatePath('/editor');

    return NextResponse.json({ success: true, resumeId: newResume.id });

  } catch (error: any) {
    console.error('Import API Error Detailed:', error);
    return NextResponse.json({ 
      error: `Erro Gemini: ${error.message || 'Erro desconhecido na extração'}` 
    }, { status: 500 });
  }
}
