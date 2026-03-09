'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Briefcase } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: CheckCircle2,
      title: "IA Focada em Resultados",
      description: "Nosso algoritmo não apenas escreve, mas estrutura seu currículo evidenciando conquistas reais."
    },
    {
      icon: TrendingUp,
      title: "Otimização Aprovada por ATS",
      description: "Cada seção é validada para passar pelos sistemas automáticos (Gupy, Workday, Compleo)."
    },
    {
      icon: Briefcase,
      title: "Rumo a Entrevistas",
      description: "Modelos simples e validados. Os Headhunters preferem foco técnico em vez de distrações visuais."
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
            Foco total em conseguir entrevistas.
          </h2>

          <p className="text-xl text-stone-600 max-w-2xl mx-auto font-light leading-relaxed">
            Seu currículo não precisa ser uma obra de arte, precisa ser eficiente. O objetivo é fazer o recrutador entender seu valor no menor tempo possível.
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
