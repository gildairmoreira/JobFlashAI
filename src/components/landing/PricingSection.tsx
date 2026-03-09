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
      name: 'Entrevista Garantida',
      description: 'Tenha o currículo perfeito em minutos. Modelo único pago uma vez, uso ilimitado por 1 semana.',
      price: 'R$19',
      period: 'acesso vitalício ao currículo gerado',
      features: [
        { name: 'Criação ilimitada com IA (por 7 dias)', included: true },
        { name: 'Modelo validado por Recrutadores Tech', included: true },
        { name: 'Exportação em PDF Otimizado por ATS', included: true },
        { name: 'Análise detalhada de competências', included: true },
        { name: 'Suporte VIP', included: true },
      ],
      cta: 'Criar Meu Currículo',
      popular: true,
    }
  ];

  return (
    <section className="py-24 bg-white border-y border-stone-100" id="precos">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="max-w-md mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className="bg-[#FAF9F7] rounded-[2rem] p-10 shadow-2xl border-2 border-blue-500/20 relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="absolute -top-5 left-0 right-0 flex justify-center">
                <span className="bg-blue-500 text-white text-sm font-bold px-6 py-2 rounded-full shadow-md uppercase tracking-wide">
                  Mais Escolhido
                </span>
              </div>

              <div className="text-center mb-8 mt-2">
                <h3 className="text-2xl font-bold text-stone-900 mb-3">{plan.name}</h3>
                <p className="text-stone-600 font-light text-sm">{plan.description}</p>
              </div>

              <div className="text-center mb-10">
                <span className="text-5xl font-black text-stone-900">{plan.price}</span>
                <span className="text-stone-500 font-medium ml-2">{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-10">
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
                className="w-full bg-stone-900 hover:bg-stone-800 text-white shadow-xl py-7 rounded-2xl text-lg group transition-all"
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
      </div>
    </section>
  );
};

export default PricingSection;
