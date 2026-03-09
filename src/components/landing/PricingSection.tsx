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
}

const PricingSection: React.FC = () => {
  const plans: PricingPlan[] = [
    {
      name: 'Free',
      description: 'Para quem quer testar e criar seu primeiro rascunho.',
      price: 'R$0',
      period: 'grátis',
      features: [
        { name: 'Limite de 1 currículo ativo', included: true },
        { name: 'Apenas 1 uso gratuito da IA (Experiência)', included: true },
        { name: 'Download PDF (Com marca d\'água)', included: true },
        { name: 'Cores, Foto e Links Sociais', included: false },
        { name: 'Análise detalhada de competências', included: false },
      ],
      cta: 'Começar Grátis',
    },
    {
      name: 'Acesso Pro - 7 Dias',
      description: 'Para quem precisa dessa vaga urgente. Destrave a IA e construa até 3 versões do seu currículo.',
      price: 'R$19,90',
      period: 'por 7 dias',
      features: [
        { name: 'Criação ilimitada com IA (por 7 dias)', included: true },
        { name: 'Até 3 currículos simultâneos', included: true },
        { name: 'Modelo validado por Recrutadores Tech', included: true },
        { name: 'Exportação em PDF sem marca d\'água Otimizado ATS', included: true },
        { name: 'Análise detalhada de competências', included: true },
      ],
      cta: 'Criar Meu Currículo',
      popular: true,
    },
    {
      name: 'Acesso Mensal',
      description: 'Tenha seu arsenal de IA ativo mês a mês. Cancele quando quiser.',
      price: 'R$49,90',
      period: 'por mês',
      features: [
        { name: 'Acesso ilimitado a todos os recursos atuais', included: true },
        { name: 'Currículos ilimitados para sempre', included: true },
        { name: 'Uso de IA Ilimitada', included: true },
        { name: 'Design e personalização totais', included: true },
        { name: 'Suporte VIP e Atualizações', included: true },
      ],
      cta: 'Assinar Plano Mensal',
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
            Oferta de Lançamento
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-stone-900 mb-6 tracking-tight">
            Seu próximo salário começa aqui
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto font-light leading-relaxed">
            Economize meses tentando descobrir como convencer recrutadores. Nós automatizamos a parte difícil.
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

              <div className="text-center mb-8 mt-2">
                <h3 className="text-2xl font-bold text-stone-900 mb-3">{plan.name}</h3>
                <p className="text-stone-600 font-light text-sm">{plan.description}</p>
              </div>

              <div className="text-center mb-10">
                <span className="text-5xl font-black text-stone-900">{plan.price}</span>
                <span className="text-stone-500 font-medium ml-2">{plan.period}</span>
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
                <Link href="/resumes">
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
