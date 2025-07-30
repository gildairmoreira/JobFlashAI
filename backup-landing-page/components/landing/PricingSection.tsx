'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, CreditCard, Zap, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  description: string;
  price: string;
  period: string;
  features: PlanFeature[];
  cta: string;
  popular?: boolean;
  icon: React.ReactNode;
}

const PricingSection: React.FC = () => {
  const plans: PricingPlan[] = [
    {
      name: 'Grátis',
      description: 'Comece sem pagar nada. Ideal para testes ou currículos simples.',
      price: 'R$0',
      period: 'para sempre',
      icon: <CreditCard className="w-6 h-6" />,
      features: [
        { name: 'Criação de currículo com IA (limite de 1)', included: true },
        { name: '1 modelo básico disponível', included: true },
        { name: 'Exportar em PDF com marca d\'água', included: true },
        { name: 'Modelos premium', included: false },
        { name: 'Customização avançada', included: false },
        { name: 'IA para geração', included: false },
        { name: 'Remoção da marca d\'água', included: false },
      ],
      cta: 'Começar grátis',
    },
    {
      name: 'Pro',
      description: 'Perfeito para quem quer se destacar com um currículo matador.',
      price: 'R$19',
      period: 'por mês',
      icon: <Zap className="w-6 h-6" />,
      features: [
        { name: 'Currículos com IA', included: true },
        { name: 'Customização completa (cores, seções)', included: true },
        { name: 'Exportar em PDF', included: true },
        { name: 'Remoção da marca d\'água', included: true },
        { name: 'Suporte prioritário via WhatsApp', included: false },
      ],
      cta: 'Assinar Pro',
      popular: true,
    },
    {
      name: 'Premium',
      description: 'Para quem leva a carreira a sério e quer suporte total.',
      price: 'R$39',
      period: 'por mês',
      icon: <Building className="w-6 h-6" />,
      features: [
        { name: 'Todos os recursos do Pro', included: true },
        { name: 'Templates exclusivos', included: true },
        { name: 'Copilot de carreira com IA generativa 24h', included: true },
        { name: 'Suporte premium via WhatsApp + Email', included: true },
        { name: 'Análise de currículo por especialista de IA', included: true },
        { name: 'Nenhuma limitação', included: true },
      ],
      cta: 'Assinar Premium',
    },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent mb-4">
            Planos Para Todos os Perfis
          </h2>
          
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Escolha o plano ideal para impulsionar sua carreira com currículos profissionais.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border ${plan.popular ? 'border-blue-500 dark:border-blue-400' : 'border-gray-100 dark:border-gray-700'} relative flex flex-col h-full`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="mb-6 flex items-center gap-3">
                <div className={`p-3 rounded-lg ${plan.popular ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              </div>
              
              <p className="text-white/80 mb-6">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-white/70"> {plan.period}</span>
              </div>
              
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 dark:text-gray-600 mt-0.5" />
                    )}
                    <span className={feature.included ? 'text-white' : 'text-white/50'}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white/10 hover:bg-white/20 text-white border-white/20'}`}
                variant={plan.popular ? 'default' : 'outline'}
                size="lg"
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground">
            Todos os planos incluem 14 dias de garantia de devolução do dinheiro.
            <br />
            Dúvidas? <a href="#" className="text-blue-600 hover:underline">Entre em contato com nossa equipe</a>.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;