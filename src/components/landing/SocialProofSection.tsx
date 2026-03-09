'use client';

import React from 'react';
import { motion } from 'framer-motion';

const SocialProofSection: React.FC = () => {
  return (
    <section className="py-12 bg-white border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <p className="text-sm uppercase tracking-widest text-stone-500 font-bold mb-8">
            Nossos usuários já foram contratados nestas empresas
          </p>

          <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Using text blocks as placeholders to ensure fast rendering without missing assets. */}
            <span className="text-2xl font-black font-sans text-stone-800 tracking-tighter">Google</span>
            <span className="text-2xl font-black font-serif text-stone-800 tracking-tight">amazon</span>
            <span className="text-2xl font-black font-sans text-stone-800 lowercase">Meta</span>
            <span className="text-2xl font-bold font-sans text-stone-800">Netflix</span>
            <span className="text-2xl font-bold font-sans text-stone-800 italic tracking-wider">Spotify</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProofSection;
