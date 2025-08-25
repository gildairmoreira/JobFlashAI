'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Brain } from 'lucide-react';
import resumePreview from '@/assets/hero/resume-preview.png';



const AIScrollSection: React.FC = () => {
  return (
    <div className="py-20 bg-gray-50 dark:bg-gray-900" id="veja-nossa-ia-em-acao">
      <div className="max-w-7xl mx-auto px-4">
        {/* Título da seção */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 text-blue-600 mb-4"
          >
            <Brain className="w-6 h-6" />
            <span className="text-sm uppercase tracking-wider font-semibold">
              Inteligência Artificial Avançada
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent mb-6"
          >
            Veja Nossa IA em Ação
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Nossa tecnologia analisa seu perfil profissional e cria um currículo personalizado que destaca suas competências e experiências de forma impactante.
          </motion.p>
        </div>

        {/* Card com preview do currículo */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02, y: -10 }}
          className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          <div className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Currículo Gerado por IA
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Veja como nossa IA cria currículos profissionais e otimizados
              </p>
            </div>
            
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <Image 
                src={resumePreview} 
                alt="Preview de currículo gerado pela IA" 
                width={800} 
                height={1000} 
                className="w-full h-auto object-contain"
                priority
              />
              
              {/* Overlay com efeito de brilho */}
              <motion.div
                initial={{ x: '-100%' }}
                whileInView={{ x: '100%' }}
                transition={{ duration: 1.5, delay: 0.5 }}
                viewport={{ once: true }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AIScrollSection;