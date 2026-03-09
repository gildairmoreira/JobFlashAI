'use client';

import React from 'react';
import { motion } from 'framer-motion';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'João Silva',
      role: 'Desenvolvedor Senior',
      content: 'Passei 3 meses enviando o modelo que fiz no Word. Nenhuma resposta. Usei a IA, o layout mudou para o padrão do mercado e tive 4 entrevistas na mesma semana.',
    },
    {
      name: 'Maria Souza',
      role: 'Gerente de Produto',
      content: 'A forma como a IA reescreveu minhas experiências focando em resultados foi absurda. Eu nunca saberia usar as palavras-chave da forma como ela usou.',
    },
    {
      name: 'Pedro Alves',
      role: 'Analista de Dados',
      content: 'Eu não sou designer. Ter um currículo lindo, limpo e direto ao ponto gerado em 5 minutos salvou minha busca por vaga.',
    }
  ];

  return (
    <section className="py-24 bg-[#FAF9F7] border-y border-stone-100" id="avaliacoes">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-stone-900 mb-4 tracking-tight">Histórias Reais de Sucesso</h2>
          <p className="text-lg text-stone-600 font-light max-w-2xl mx-auto">
            Não acredite apenas em nós. Veja o que desenvolvedores e analistas têm a dizer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="mb-6">
                {/* 5 stars */}
                <div className="flex text-blue-400 gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
                  ))}
                </div>
                <p className="text-stone-700 font-light italic text-lg">"{t.content}"</p>
              </div>
              <div className="mt-auto">
                <p className="font-bold text-stone-900">{t.name}</p>
                <p className="text-sm font-light text-stone-500">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
