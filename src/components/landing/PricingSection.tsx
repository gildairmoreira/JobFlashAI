'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PricingPlan {
  name: string;
  description: string;
  price: string;
  period: string;
  features: { name: string; included: boolean }[];
  cta: string;
  popular?: boolean;
  originalPrice?: string;
  badge?: string;
  href?: string;
}

import { getGlobalSettings } from '@/app/(main)/billing/actions';
import { useTransition, useEffect, useState } from 'react';

const PricingSection: React.FC = () => {
  const [globalSettings, setGlobalSettings] = useState<any>(null);

  useEffect(() => {
    getGlobalSettings().then(setGlobalSettings);
  }, []);

  const displayProPrice = globalSettings?.proPrice ? `R$${globalSettings.proPrice.toFixed(2).replace('.', ',')}` : 'R$19,90';
  const displayMonPrice = globalSettings?.monthlyPrice ? `R$${globalSettings.monthlyPrice.toFixed(2).replace('.', ',')}` : 'R$49,90';

  const plans: PricingPlan[] = [
    {
      name: 'Free',
      description: 'Ideal para experimentar nossa plataforma básica sem custos.',
      price: 'R$0',
      period: 'por mês',
      features: [
        { name: '1 Currículo ativo (sem duplicar)', included: true },
        { name: 'Importação Mágica via PDF c/ IA', included: true },
        { name: 'Template Clássico Padrão', included: true },
        { name: 'Download PDF (Com marca d\'água)', included: true },
        { name: 'Gerador Vaga-Fit IA (1 Teste Grátis)', included: true },
        { name: 'Acesso ao Avaliador ATS Completo', included: false },
        { name: 'Tradução 1-clique (PT <-> EN)', included: false },
      ],
      cta: 'Começar Grátis',
    },
    {
      name: 'Acesso Pro - 7 Dias',
      description: 'Para quem precisa dessa vaga urgente. Destrave a IA e crie versões irresistíveis.',
      price: displayProPrice,
      period: 'por 7 dias',
      features: [
        { name: 'Módulo Vaga-Fit IA (5 Créditos)', included: true },
        { name: 'Avaliador ATS: Dicas Acionáveis Secretas', included: true },
        { name: 'Currículos Ilimitados (Duplique à vontade)', included: true },
        { name: 'Templates VIP (Harvard, Moderno, etc)', included: true },
        { name: 'Exportação em PDF Limpo + Fontes Libertas', included: true },
        { name: 'Tradução 1-clique (PT <-> EN)', included: false },
      ],
      cta: 'Assinar Pro - 7 Dias',
      popular: true,
      href: '/resumes?plan=pro'
    },
    {
      name: 'Acesso Mensal',
      description: 'Para quem quer ter o arsenal de IA pronto para todas as oportunidades do ano.',
      price: displayMonPrice,
      period: 'por mês',
      originalPrice: 'De R$ 79,60',
      badge: 'Economize 37%',
      features: [
        { name: 'Acesso ilimitado a todos os recursos Pro', included: true },
        { name: 'Módulo Vaga-Fit IA (25 Créditos Mensais)', included: true },
        { name: 'Avaliador ATS sempre atualizado', included: true },
        { name: 'Currículos ilimitados para sempre', included: true },
        { name: 'Tradução 1-clique (PT <-> EN)', included: true },
        { name: 'Nenhuma fidelidade, cancele quando quiser', included: true },
      ],
      cta: 'Assinar Plano Mensal',
      href: '/resumes?plan=monthly'
    }
  ];

  return (
    <section className="py-24 bg-white border-y border-stone-100" id="precos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
            <Shield className="w-4 h-4" />
            Oferta Especial
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-stone-900 mb-6 tracking-tight">
            Invista no seu futuro. Pare de ser rejeitado.
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto font-light leading-relaxed">
            Poupe meses de estresse tentando adivinhar como agradar as empresas. Libere o Avaliador ATS e o nosso Job-Fit AI para reescrever seu currículo para cada vaga.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`bg-[#FAF9F7] rounded-[2rem] p-10 shadow-2xl relative flex flex-col ${plan.popular ? 'border-2 border-blue-500' : 'border border-stone-200'
                }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-0 right-0 flex justify-center">
                  <span className="bg-blue-500 text-white text-sm font-bold px-6 py-2 rounded-full shadow-md uppercase tracking-wide">
                    Mais Escolhido
                  </span>
                </div>
              )}
              {plan.badge && !plan.popular && (
                <div className="absolute -top-5 left-0 right-0 flex justify-center">
                  <span className="bg-emerald-500 text-white text-sm font-bold px-6 py-2 rounded-full shadow-md uppercase tracking-wide">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-6 mt-2">
                <h3 className="text-2xl font-bold text-stone-900 mb-3">{plan.name}</h3>
                <p className="text-stone-600 font-light text-sm">{plan.description}</p>
              </div>

              <div className="text-center mb-10 flex flex-col items-center">
                {plan.originalPrice && (
                  <span className="text-stone-400 font-medium line-through mb-1 text-sm">
                    {plan.originalPrice}
                  </span>
                )}
                <div>
                  <span className="text-5xl font-black text-stone-900">{plan.price}</span>
                  <span className="text-stone-500 font-medium ml-2">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-4">
                    {feature.included ? (
                      <Check className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-6 h-6 text-stone-300 shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? 'text-stone-800 font-medium' : 'text-stone-400 line-through'}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full text-white shadow-xl py-7 rounded-2xl text-lg group transition-all mt-auto ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-stone-900 hover:bg-stone-800'
                  }`}
                asChild
              >
                <Link href={(plan as any).href || "/resumes"}>
                  {plan.cta}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-stone-400 mt-12 max-w-2xl mx-auto">
          Pagamentos processados de forma 100% segura. Cancele as assinaturas recorrentes a qualquer momento.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
