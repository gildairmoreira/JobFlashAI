'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavBar from './Navbar';
import AnimatedGridPattern from '@/components/ui/animated-grid-pattern';
const AIResumeHero: React.FC = () => {
  return (
    <>
      <NavBar />
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center bg-[#FAF9F7] text-stone-900 px-4 sm:px-6 lg:px-8 py-24 overflow-hidden">

        {/* Magic UI Inspired Animated Background */}
        <AnimatedGridPattern />

        {/* Soft Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] left-[10%] w-[30rem] h-[30rem] bg-blue-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-50"
          />
          <motion.div
            animate={{
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[10%] right-[10%] w-[30rem] h-[30rem] bg-indigo-100/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50"
          />
        </div>

        {/* Noise overlay */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none bg-repeat"></div>

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center mt-12 md:mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white text-stone-700 text-sm font-medium mb-10 border border-stone-200 shadow-sm transition-all cursor-pointer"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            <span className="tracking-wide text-stone-800">JobFlashAI 2.0 Disponível</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-stone-900 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            Seu próximo emprego começa com o <span className="text-blue-600">currículo perfeito.</span>
          </h1>

          <p className="text-xl md:text-2xl text-stone-600 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Pare de ser ignorado por filtros automáticos.
            Nossa IA analisa seu perfil e constrói o modelo exato que os recrutadores estão buscando.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-7 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto font-medium group"
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
                variant="outline"
                size="lg"
                className="px-8 py-7 text-lg rounded-xl border-stone-300 text-stone-700 hover:bg-stone-100 transition-all w-full sm:w-auto bg-white/50 backdrop-blur-sm border-2 font-medium"
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
      </section>
    </>
  );
};

export default AIResumeHero;
