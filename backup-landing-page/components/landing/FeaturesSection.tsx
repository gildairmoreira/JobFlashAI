'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, FileText, Brain, Wand2, Shield, Target, Award, Briefcase } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: "IA Avançada",
      description: "Algoritmos de última geração que analisam seu perfil e criam conteúdo personalizado."
    },
    {
      icon: Wand2,
      title: "Template Premium",
      description: "Modelos profissionais desenvolvidos por especialistas em recrutamento."
    },
    {
      icon: Target,
      title: "Otimização ATS",
      description: "Currículos otimizados para passar pelos sistemas de rastreamento de candidatos."
    },
    {
      icon: Shield,
      title: "Análise de Competências",
      description: "Identificação e destaque das habilidades mais relevantes para sua área de atuação."
    },
    {
      icon: Zap,
      title: "Rápido e Fácil",
      description: "Crie seu currículo profissional em menos de 5 minutos com nossa interface intuitiva."
    },
    {
      icon: Award,
      title: "Feedback Inteligente",
      description: "Sugestões personalizadas para melhorar seu currículo e aumentar suas chances."
    },
    {
      icon: Briefcase,
      title: "Adaptado ao Mercado",
      description: "Conteúdo alinhado às tendências e exigências atuais do mercado de trabalho."
    },
    {
      icon: FileText,
      title: "Múltiplos Formatos",
      description: "Exporte seu currículo em PDF, Word, TXT ou HTML para qualquer situação."
    },
    {
      icon: Sparkles,
      title: "Atualizações Constantes",
      description: "Novos templates e recursos adicionados regularmente sem custo adicional."
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
            <Sparkles className="w-6 h-6" />
            <span className="text-sm uppercase tracking-wider font-semibold">
              Recursos Exclusivos
            </span>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent mb-4">
            Tudo o que Você Precisa
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nossa plataforma combina inteligência artificial avançada com design profissional para criar currículos que se destacam.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground">
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