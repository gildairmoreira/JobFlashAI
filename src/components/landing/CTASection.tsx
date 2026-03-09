'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const CTASection: React.FC = () => {
  return (
    <section className="py-24 bg-[#FAF9F7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="bg-stone-900 rounded-[2.5rem] p-8 sm:p-12 md:p-16 text-center shadow-2xl overflow-hidden relative"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="bg-[url('/noise.png')] absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Pare de perder oportunidades para currículos inferiores.
            </h2>
            <p className="text-xl text-stone-300 font-light mb-10 leading-relaxed">
              Transforme suas experiências fragmentadas em um documento de alto impacto. Construa seu diferencial agora mesmo e consiga a entrevista dos seus sonhos.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white shadow-xl py-6 px-6 sm:py-7 sm:px-10 rounded-2xl text-base sm:text-lg w-full sm:w-auto font-semibold transition-all group whitespace-normal h-auto min-h-[3.5rem]" asChild>
                <Link href="/resumes" className="flex items-center justify-center">
                  <span>Gerar Currículo Automaticamente</span>
                  <ArrowRight className="w-5 h-5 ml-2 shrink-0 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-stone-400 font-medium text-sm sm:text-base">
              <ShieldCheck className="w-6 h-6 shrink-0 text-green-400" />
              <span className="text-center sm:text-left">Garantia de 7 dias ou seu dinheiro de volta. Processo seguro.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
