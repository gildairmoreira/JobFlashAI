'use client';

import React, { use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, Mail, MessageCircle, BookOpen, Activity, Phone, CheckCircle } from 'lucide-react';
import Footer from '@/components/landing/Footer';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';

const suporteContents = {
  ajuda: {
    title: 'Central de Ajuda',
    icon: <HelpCircle className="w-8 h-8" />,
    content: {
      intro: 'Encontre respostas rápidas para as principais dúvidas sobre o JobFlashAI e aprenda a aproveitar ao máximo nossa plataforma.',
      sections: [
        {
          title: 'Como Começar',
          content: 'Para começar a usar o JobFlashAI, crie sua conta gratuita e siga nosso tutorial interativo. Nossa IA irá guiá-lo através do processo de criação do seu primeiro currículo profissional em poucos minutos.'
        },
        {
          title: 'Criando seu Primeiro Currículo',
          content: 'Acesse a seção "Meus Currículos" e clique em "Novo Currículo". Nossa IA irá fazer perguntas sobre sua experiência profissional e gerar automaticamente um currículo personalizado baseado nas suas respostas.'
        },
        {
          title: 'Personalizando Templates',
          content: 'Escolha entre diversos templates profissionais e personalize cores, fontes e layout. Todos os templates são otimizados para sistemas ATS (Applicant Tracking Systems) usados por recrutadores.'
        },
        {
          title: 'Exportando e Compartilhando',
          content: 'Exporte seu currículo em PDF de alta qualidade ou compartilhe um link público. Você também pode gerar diferentes versões do mesmo currículo para diferentes vagas.'
        },
        {
          title: 'Dicas de Otimização',
          content: 'Use palavras-chave relevantes para sua área, mantenha informações atualizadas e aproveite as sugestões da nossa IA para melhorar continuamente seu currículo.'
        }
      ]
    }
  },
  contato: {
    title: 'Entre em Contato',
    icon: <Mail className="w-8 h-8" />,
    content: {
      intro: 'Nossa equipe está sempre pronta para ajudar. Entre em contato conosco através dos canais abaixo e teremos prazer em resolver suas dúvidas.',
      sections: [
        {
          title: 'Suporte por Email',
          content: 'Para questões técnicas, dúvidas sobre funcionalidades ou problemas com sua conta, envie um email para suporte@jobflashai.com. Respondemos em até 24 horas durante dias úteis.'
        },
        {
          title: 'Chat ao Vivo',
          content: 'Nosso chat ao vivo está disponível de segunda a sexta, das 9h às 18h (horário de Brasília). Clique no ícone de chat no canto inferior direito da tela para falar conosco em tempo real.'
        },
        {
          title: 'Suporte Comercial',
          content: 'Para questões sobre planos premium, parcerias ou vendas corporativas, entre em contato através do email vendas@jobflashai.com ou telefone (11) 9999-9999.'
        },
        {
          title: 'Feedback e Sugestões',
          content: 'Valorizamos muito seu feedback! Envie sugestões de melhorias, reportes de bugs ou ideias para novas funcionalidades através do email feedback@jobflashai.com.'
        },
        {
          title: 'Redes Sociais',
          content: 'Siga-nos nas redes sociais para dicas de carreira, atualizações do produto e conteúdo exclusivo. Estamos no LinkedIn, Instagram e Twitter como @JobFlashAI.'
        }
      ]
    }
  },
  faq: {
    title: 'Perguntas Frequentes',
    icon: <MessageCircle className="w-8 h-8" />,
    content: {
      intro: 'Respostas para as perguntas mais comuns sobre o JobFlashAI. Se não encontrar sua dúvida aqui, entre em contato conosco.',
      sections: [
        {
          title: 'O JobFlashAI é gratuito?',
          content: 'Sim! Oferecemos um plano gratuito que permite criar até 3 currículos com templates básicos. Para recursos avançados, templates premium e criação ilimitada, temos planos pagos a partir de R$ 19,90/mês.'
        },
        {
          title: 'Como a IA funciona?',
          content: 'Nossa IA analisa suas informações profissionais e gera conteúdo otimizado baseado em milhares de currículos bem-sucedidos. Ela sugere descrições de experiências, habilidades relevantes e formatação adequada para sua área.'
        },
        {
          title: 'Meus dados estão seguros?',
          content: 'Absolutamente. Utilizamos criptografia de ponta e seguimos rigorosos padrões de segurança. Seus dados nunca são compartilhados com terceiros e você pode excluir sua conta a qualquer momento.'
        },
        {
          title: 'Posso cancelar minha assinatura?',
          content: 'Sim, você pode cancelar sua assinatura a qualquer momento através das configurações da conta. Não há taxas de cancelamento e você continuará tendo acesso aos recursos premium até o final do período pago.'
        },
        {
          title: 'Os currículos passam pelos sistemas ATS?',
          content: 'Sim! Todos os nossos templates são otimizados para sistemas ATS (Applicant Tracking Systems), garantindo que seu currículo seja lido corretamente pelos sistemas de recrutamento.'
        },
        {
          title: 'Posso usar em dispositivos móveis?',
          content: 'Sim, o JobFlashAI é totalmente responsivo e funciona perfeitamente em smartphones e tablets. Você pode criar e editar currículos em qualquer dispositivo.'
        }
      ]
    }
  },
  tutoriais: {
    title: 'Tutoriais e Guias',
    icon: <BookOpen className="w-8 h-8" />,
    content: {
      intro: 'Aprenda a usar todas as funcionalidades do JobFlashAI com nossos tutoriais passo a passo e guias detalhados.',
      sections: [
        {
          title: 'Tutorial: Criando seu Primeiro Currículo',
          content: '1. Faça login na sua conta; 2. Clique em "Novo Currículo"; 3. Escolha um template; 4. Preencha suas informações pessoais; 5. Adicione experiências profissionais; 6. Inclua formação acadêmica; 7. Liste suas habilidades; 8. Revise e exporte em PDF.'
        },
        {
          title: 'Guia: Otimizando para ATS',
          content: 'Use palavras-chave da descrição da vaga, mantenha formatação simples, evite imagens e gráficos complexos, use fontes padrão, organize informações em seções claras e inclua informações de contato no topo.'
        },
        {
          title: 'Tutorial: Personalizando Templates',
          content: 'Acesse o editor de templates, escolha cores que combinem com sua área profissional, ajuste espaçamentos e margens, selecione fontes legíveis, organize seções conforme relevância e visualize em diferentes dispositivos.'
        },
        {
          title: 'Guia: Escrevendo Descrições Impactantes',
          content: 'Use verbos de ação no início das frases, quantifique resultados sempre que possível, foque em conquistas ao invés de responsabilidades, adapte linguagem para sua área e use a IA para sugestões de melhoria.'
        },
        {
          title: 'Tutorial: Gerenciando Múltiplos Currículos',
          content: 'Crie versões específicas para diferentes tipos de vaga, organize por pastas ou tags, mantenha um currículo "master" com todas as informações e adapte cada versão para palavras-chave específicas.'
        }
      ]
    }
  },
  status: {
    title: 'Status do Sistema',
    icon: <Activity className="w-8 h-8" />,
    content: {
      intro: 'Acompanhe o status em tempo real dos nossos serviços e fique informado sobre manutenções programadas ou incidentes.',
      sections: [
        {
          title: 'Status Atual dos Serviços',
          content: '🟢 Plataforma Principal: Operacional | 🟢 IA de Geração: Operacional | 🟢 Exportação PDF: Operacional | 🟢 Sistema de Login: Operacional | 🟢 API: Operacional | Última atualização: Hoje às 14:30'
        },
        {
          title: 'Histórico de Incidentes',
          content: 'Nenhum incidente reportado nos últimos 30 dias. Nosso uptime médio é de 99.9%. Todos os incidentes são comunicados através do email e redes sociais em tempo real.'
        },
        {
          title: 'Manutenções Programadas',
          content: 'Próxima manutenção programada: Domingo, 15/12 das 02:00 às 04:00 (horário de Brasília). Durante este período, alguns recursos podem ficar temporariamente indisponíveis.'
        },
        {
          title: 'Métricas de Performance',
          content: 'Tempo médio de resposta: 0.8s | Tempo de geração de currículo: 3.2s | Disponibilidade mensal: 99.95% | Satisfação do usuário: 4.8/5 estrelas | Currículos gerados hoje: 1,247'
        },
        {
          title: 'Atualizações Recentes',
          content: 'v2.1.3 (10/12): Melhorias na IA de geração | v2.1.2 (05/12): Novos templates adicionados | v2.1.1 (01/12): Correções de bugs e otimizações | v2.1.0 (25/11): Nova funcionalidade de colaboração'
        },
        {
          title: 'Reportar Problemas',
          content: 'Se você está enfrentando problemas não listados aqui, por favor reporte através do email suporte@jobflashai.com ou chat ao vivo. Incluya detalhes sobre o erro e seu navegador.'
        }
      ]
    }
  }
};

export default function SuportePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const pageData = suporteContents[slug as keyof typeof suporteContents] || {
    title: 'Página Não Encontrada',
    icon: <HelpCircle className="w-8 h-8" />,
    content: {
      intro: 'Desculpe, a página solicitada não foi encontrada.',
      sections: []
    }
  };

  return (
    <div className="min-h-screen bg-black">
      
      {/* Hero Section */}
      <section className="pt-16 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 opacity-70" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-600/20 rounded-full text-blue-400">
                {pageData.icon}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              {pageData.title}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {pageData.content.intro}
            </p>
            
            {slug === 'contato' && (
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Email
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Phone className="w-4 h-4 mr-2" />
                  Chat ao Vivo
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-12">
            {pageData.content.sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-start gap-4">
                  {slug === 'status' && (
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full mt-1">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-300" />
                    </div>
                  )}
                  {slug === 'contato' && (
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full mt-1">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                    </div>
                  )}
                  {slug === 'faq' && (
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full mt-1">
                      <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                    </div>
                  )}
                  {slug === 'tutoriais' && (
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full mt-1">
                      <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-300" />
                    </div>
                  )}
                  {slug === 'ajuda' && (
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full mt-1">
                      <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                      {section.title}
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <Toaster />
    </div>
  );
}