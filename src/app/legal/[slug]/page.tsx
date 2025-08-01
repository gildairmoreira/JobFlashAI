'use client';

import React, { use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Cookie, FileText, Settings } from 'lucide-react';
import Footer from '@/components/landing/Footer';
import { Toaster } from '@/components/ui/toaster';

const legalContents = {
  termos: {
    title: 'Termos de Serviço',
    icon: <FileText className="w-8 h-8" />,
    content: {
      intro: 'Bem-vindo ao JobFlashAI. Estes termos de serviço regem o uso da nossa plataforma de geração de currículos com inteligência artificial.',
      sections: [
        {
          title: '1. Aceitação dos Termos',
          content: 'Ao acessar e usar o JobFlashAI, você concorda em cumprir estes termos de serviço. Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.'
        },
        {
          title: '2. Descrição do Serviço',
          content: 'O JobFlashAI é uma plataforma que utiliza inteligência artificial para ajudar usuários a criar currículos profissionais personalizados. Oferecemos templates, sugestões de conteúdo e ferramentas de formatação.'
        },
        {
          title: '3. Conta do Usuário',
          content: 'Para usar nossos serviços, você deve criar uma conta fornecendo informações precisas e atualizadas. Você é responsável por manter a confidencialidade de suas credenciais de login.'
        },
        {
          title: '4. Uso Aceitável',
          content: 'Você concorda em usar o JobFlashAI apenas para fins legais e de acordo com estes termos. É proibido usar a plataforma para atividades fraudulentas ou que violem direitos de terceiros.'
        },
        {
          title: '5. Propriedade Intelectual',
          content: 'O conteúdo gerado através da nossa IA permanece de sua propriedade. No entanto, você nos concede uma licença para processar e melhorar nossos serviços com base no uso da plataforma.'
        },
        {
          title: '6. Limitação de Responsabilidade',
          content: 'O JobFlashAI não se responsabiliza por resultados de processos seletivos ou decisões de contratação baseadas em currículos criados em nossa plataforma.'
        }
      ]
    }
  },
  privacidade: {
    title: 'Política de Privacidade',
    icon: <Shield className="w-8 h-8" />,
    content: {
      intro: 'Sua privacidade é fundamental para nós. Esta política explica como coletamos, usamos e protegemos suas informações pessoais no JobFlashAI.',
      sections: [
        {
          title: '1. Informações que Coletamos',
          content: 'Coletamos informações que você fornece diretamente, como dados de perfil, experiências profissionais e informações de contato necessárias para a criação de currículos.'
        },
        {
          title: '2. Como Usamos suas Informações',
          content: 'Utilizamos suas informações para gerar currículos personalizados, melhorar nossos algoritmos de IA e fornecer suporte ao cliente. Nunca vendemos seus dados pessoais.'
        },
        {
          title: '3. Compartilhamento de Dados',
          content: 'Não compartilhamos suas informações pessoais com terceiros, exceto quando necessário para operação do serviço ou quando exigido por lei.'
        },
        {
          title: '4. Segurança dos Dados',
          content: 'Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração ou destruição.'
        },
        {
          title: '5. Seus Direitos',
          content: 'Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Também pode solicitar a portabilidade de seus dados a qualquer momento.'
        },
        {
          title: '6. Retenção de Dados',
          content: 'Mantemos suas informações pelo tempo necessário para fornecer nossos serviços ou conforme exigido por lei. Você pode solicitar a exclusão de sua conta a qualquer momento.'
        }
      ]
    }
  },
  cookies: {
    title: 'Política de Cookies',
    icon: <Cookie className="w-8 h-8" />,
    content: {
      intro: 'Utilizamos cookies e tecnologias similares para melhorar sua experiência no JobFlashAI e fornecer funcionalidades personalizadas.',
      sections: [
        {
          title: '1. O que são Cookies',
          content: 'Cookies são pequenos arquivos de texto armazenados em seu dispositivo quando você visita nosso site. Eles nos ajudam a lembrar suas preferências e melhorar sua experiência.'
        },
        {
          title: '2. Tipos de Cookies que Usamos',
          content: 'Utilizamos cookies essenciais para funcionamento do site, cookies de desempenho para análise de uso, e cookies de funcionalidade para personalizar sua experiência.'
        },
        {
          title: '3. Cookies de Terceiros',
          content: 'Alguns cookies são definidos por serviços de terceiros que aparecem em nossas páginas, como ferramentas de análise e sistemas de autenticação.'
        },
        {
          title: '4. Gerenciamento de Cookies',
          content: 'Você pode controlar e gerenciar cookies através das configurações do seu navegador. Note que desabilitar cookies pode afetar a funcionalidade do site.'
        },
        {
          title: '5. Cookies Essenciais',
          content: 'Alguns cookies são estritamente necessários para o funcionamento do site e não podem ser desabilitados, como aqueles relacionados à segurança e autenticação.'
        }
      ]
    }
  },
  licencas: {
    title: 'Licenças e Atribuições',
    icon: <Eye className="w-8 h-8" />,
    content: {
      intro: 'O JobFlashAI utiliza diversas tecnologias e recursos de código aberto. Esta página lista as principais licenças e atribuições.',
      sections: [
        {
          title: '1. Tecnologias de Código Aberto',
          content: 'Nossa plataforma é construída com React, Next.js, Tailwind CSS e outras tecnologias de código aberto. Respeitamos e cumprimos todas as licenças aplicáveis.'
        },
        {
          title: '2. Ícones e Recursos Visuais',
          content: 'Utilizamos ícones do Lucide React e outros recursos visuais sob suas respectivas licenças. Todos os créditos são devidamente atribuídos aos criadores originais.'
        },
        {
          title: '3. Fontes e Tipografia',
          content: 'As fontes utilizadas em nossa plataforma são licenciadas adequadamente, incluindo Google Fonts e outras fontes web com licenças abertas.'
        },
        {
          title: '4. Bibliotecas de IA',
          content: 'Utilizamos APIs e bibliotecas de inteligência artificial de terceiros em conformidade com seus termos de uso e licenças específicas.'
        },
        {
          title: '5. Contribuições da Comunidade',
          content: 'Agradecemos à comunidade de desenvolvedores que contribui para as tecnologias que utilizamos. Mantemos uma lista atualizada de todas as dependências e suas licenças.'
        }
      ]
    }
  },
  configuracoes: {
    title: 'Configurações e Preferências',
    icon: <Settings className="w-8 h-8" />,
    content: {
      intro: 'Gerencie suas configurações de conta, preferências de privacidade e opções de personalização no JobFlashAI.',
      sections: [
        {
          title: '1. Configurações de Conta',
          content: 'Acesse e modifique suas informações pessoais, dados de contato e preferências de comunicação através do painel de configurações da sua conta.'
        },
        {
          title: '2. Preferências de Privacidade',
          content: 'Controle como suas informações são utilizadas, gerencie permissões de cookies e configure opções de compartilhamento de dados.'
        },
        {
          title: '3. Notificações',
          content: 'Personalize quais notificações você deseja receber, incluindo atualizações de produto, dicas de carreira e comunicações promocionais.'
        },
        {
          title: '4. Preferências de IA',
          content: 'Configure como nossa inteligência artificial deve personalizar sugestões para seus currículos, incluindo tom, estilo e nível de formalidade.'
        },
        {
          title: '5. Exportação de Dados',
          content: 'Solicite uma cópia de todos os seus dados armazenados em nossa plataforma ou exporte seus currículos em diferentes formatos.'
        },
        {
          title: '6. Exclusão de Conta',
          content: 'Se desejar excluir permanentemente sua conta e todos os dados associados, você pode fazê-lo através das configurações de conta ou entrando em contato conosco.'
        }
      ]
    }
  }
};

export default function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const pageData = legalContents[slug as keyof typeof legalContents] || {
    title: 'Página Não Encontrada',
    icon: <FileText className="w-8 h-8" />,
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
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  {section.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {section.content}
                </p>
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