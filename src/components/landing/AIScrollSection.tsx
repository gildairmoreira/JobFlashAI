'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Target, Brain, FileCheck } from 'lucide-react';
import resumePreview from '@/assets/hero/new-resume-preview.jpg';

const AIScrollSection: React.FC = () => {
  return (
    <section className="py-24 bg-white border-y border-stone-100" id="veja-nossa-ia-em-acao">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">
                O Mecanismo Único
              </h2>
              <h3 className="text-3xl md:text-5xl font-extrabold text-stone-900 leading-tight">
                Como nossa IA vence os robôs de recrutamento
              </h3>
            </div>

            <p className="text-lg md:text-xl text-stone-600 font-light leading-relaxed">
              A maioria dos currículos nunca é lida por um humano, sendo reprovada no primeiro filtro.
              Invertemos essa lógica aplicando a mesma inteligência que os recrutadores utilizam.
            </p>

            <ul className="space-y-8 mt-10">
              <li className="flex gap-5">
                <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl bg-[#FAF9F7] text-stone-800 border border-stone-200">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-stone-900">Análise Cognitiva</h4>
                  <p className="text-stone-600 mt-2 leading-relaxed">Extraímos da sua experiência as palavras-chave que os sistemas (ATS) procuram.</p>
                </div>
              </li>
              <li className="flex gap-5">
                <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl bg-[#FAF9F7] text-stone-800 border border-stone-200">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-stone-900">Otimização Cirúrgica</h4>
                  <p className="text-stone-600 mt-2 leading-relaxed">Reestruturamos suas frases focando inteiramente em métricas, resultados e impacto real.</p>
                </div>
              </li>
              <li className="flex gap-5">
                <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl bg-[#FAF9F7] text-stone-800 border border-stone-200">
                  <FileCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-stone-900">Design Validado</h4>
                  <p className="text-stone-600 mt-2 leading-relaxed">Layout simples e eficiente. O modelo exato que Headhunters exigem, sem distrações visuais.</p>
                </div>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-3xl border border-stone-200 bg-[#FAF9F7] p-2 sm:p-8 shadow-2xl relative overflow-hidden">
              <Image
                src={resumePreview}
                alt="Preview de currículo gerado pela IA"
                width={800}
                height={1000}
                className="w-full h-auto object-contain rounded-2xl sm:rounded-xl border border-stone-200 shadow-md"
                priority
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl pointer-events-none"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AIScrollSection;
