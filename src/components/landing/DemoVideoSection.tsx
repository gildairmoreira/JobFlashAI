'use client';

import React from 'react';
import { motion } from 'framer-motion';

const DemoVideoSection: React.FC = () => {
  return (
    <section id="veja-nossa-ia-em-acao" className="py-20 bg-[#FAF9F7] relative border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold text-stone-900 mb-6 tracking-tight">
              Seu Currículo Relâmpago com IA
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto font-light leading-relaxed">
              Utilizamos inteligência artificial avançada para otimizar seu perfil profissional e garantir que você seja notado pelos melhores recrutadores em segundos.
            </p>
          </motion.div>
        </div>

        <div className="relative flex justify-center items-center mt-12 z-10">
          {/* Phone Mockup Container */}
          <motion.div 
            className="relative w-[280px] h-[580px] sm:w-[350px] sm:h-[700px] bg-stone-900 rounded-[3rem] p-3 shadow-2xl border-4 border-stone-800"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Camera/Notch area */}
            <div className="absolute top-0 inset-x-0 h-7 flex justify-center items-end pb-1 z-30">
              <div className="w-24 h-5 bg-stone-900 rounded-b-xl flex justify-center items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-700"></div>
                <div className="w-8 h-1.5 rounded-full bg-stone-800"></div>
              </div>
            </div>

            {/* Application Screen - Placeholder for Video/Gif */}
            <div className="relative w-full h-full bg-white rounded-[2.25rem] overflow-hidden flex flex-col items-center justify-center">
               
              <p className="text-stone-400 font-medium z-10 text-center px-4">
                Coloque o vídeo/gif da aplicação aqui<br/>
                <code className="text-xs bg-stone-100 rounded px-1 mt-2 block">{'<video src="/assets/demo.mp4" />'}</code>
              </p>
              
              <video 
                src="/assets/demo.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>

            {/* Floating Badges simulating the design */}
            <motion.div 
              className="absolute top-1/4 -right-8 sm:-right-20 lg:-right-32 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-stone-200 flex items-center gap-3 z-30 pointer-events-none"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              animate={{ 
                y: [0, -12, 0],
                transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } 
              }}
              viewport={{ once: true }}
            >
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">ATS Score</p>
                <p className="text-sm font-extrabold text-stone-900">98% Aprovado</p>
              </div>
            </motion.div>

            <motion.div 
              className="absolute bottom-1/3 -left-8 sm:-left-20 lg:-left-32 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-stone-200 flex items-center gap-3 z-30 pointer-events-none"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              animate={{ 
                y: [0, -15, 0],
                transition: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 } 
              }}
              viewport={{ once: true }}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Geração IA</p>
                <p className="text-sm font-extrabold text-stone-900">Em 12 Segundos</p>
              </div>
            </motion.div>

          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default DemoVideoSection;
