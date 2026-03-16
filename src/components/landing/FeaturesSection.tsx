'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Briefcase } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: CheckCircle2,
      title: "Job-Fit AI: 1 Clique",
      description: "Cole o link da vaga e nossa IA reescreve suas experiências destacando exatamente as palavras-chave que a empresa exigiu."
    },
    {
      icon: TrendingUp,
      title: "Avaliador ATS Antifiltros",
      description: "Descubra sua nota antes de enviar. Receba dicas priorizadas do que alterar para bater 90+ pontos sem esforço."
    },
    {
      icon: Briefcase,
      title: "Padrão Harvard & Moderno",
      description: "Fuja dos currículos de Canva reprovados. Use uma estrutura 100% validada por Headhunters, com fontes tipografadas perfeitas."
    }
  ];

  return (
    <section className="py-24 bg-[#FAF9F7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-stone-900 mb-6 tracking-tight">
            Seu tempo vale ouro. Pare de editar PDFs.
          </h2>

          <p className="text-xl text-stone-600 max-w-2xl mx-auto font-light leading-relaxed">
            Ter um currículo único para todas as vagas é o motivo de você não ser chamado. Com nosso gerador adaptativo, você envia dezenas de aplicações hiper-personalizadas por hora.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-3xl p-8 hover:shadow-xl transition-all duration-300 border border-stone-200 h-full"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-stone-100/50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-stone-200">
                <feature.icon className="w-6 h-6 text-stone-900" />
              </div>

              <h3 className="text-xl font-bold text-stone-900 mb-4">
                {feature.title}
              </h3>

              <p className="text-stone-600 leading-relaxed font-light">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
