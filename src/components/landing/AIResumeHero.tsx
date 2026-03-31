'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavBar from './Navbar';

const AIResumeHero: React.FC = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <section className="relative min-h-screen flex flex-col bg-white text-stone-900 overflow-hidden">
      {/* Video Background (CDN Externo - Imgur para máxima performance) */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <video
          src="https://i.imgur.com/hrsdVJ1.mp4"
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={() => setVideoLoaded(true)}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* Camada sutil para realçar o texto */}
        <div className="absolute inset-0 bg-white/5 z-[1]"></div>
        {/* Gradiente de transição na base para suavizar com a próxima seção */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-[2]"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col flex-1">
        <NavBar className="top-4 z-[50] transparent-hero" />
        
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pb-12 pt-24 md:pt-8">
          <motion.div
            className="w-full max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Brilho Neon Pulsante atrás do título */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-slate-100/30 rounded-full blur-[120px] -z-10"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <h1 className="relative text-5xl md:text-7xl font-extrabold tracking-tight text-stone-900 mb-6 z-20 drop-shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              Seu próximo emprego começa com o{' '}
              <span className="relative inline-block text-blue-600">
                currículo perfeito.
                {/* Custom SVG Blue Strike */}
                <svg
                  className="absolute -bottom-2 lg:-bottom-3 left-0 w-full h-3 md:h-5 text-blue-500/80 -z-10"
                  viewBox="0 0 200 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2.00035 6.64964C45.3197 3.4901 133.585 -1.2587 197.808 6.64964"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="drop-shadow-sm"
                  />
                  <path
                    d="M10.0003 7.64964C50.3197 4.4901 125.585 -0.2587 190.808 7.64964"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </svg>
              </span>
            </h1>

            <p className="relative text-xl md:text-2xl text-stone-700 max-w-2xl mx-auto mb-10 leading-relaxed font-medium z-20 drop-shadow-sm">
              Pare de ser ignorado por filtros automáticos.
              Nossa IA analisa seu perfil e constrói o modelo exato que os recrutadores estão buscando.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Button
                  className="bg-stone-900 hover:bg-stone-800 text-white px-8 h-14 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto font-medium group"
                  asChild
                >
                  <Link href="/resumes">
                    Criar Currículo Agora
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Button
                  className="px-8 h-14 text-lg rounded-xl border border-stone-300 text-stone-800 hover:bg-white/80 transition-all w-full sm:w-auto bg-white/60 backdrop-blur-sm shadow-sm font-medium"
                  asChild
                >
                  <Link href="#veja-nossa-ia-em-acao">
                    <FileText className="w-5 h-5 mr-2" />
                    Como Funciona
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AIResumeHero;
