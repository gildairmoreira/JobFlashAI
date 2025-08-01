'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import menPhoto from '@/assets/testimonials/men1.png';
import men2Photo from '@/assets/testimonials/men2.png';
import womanPhoto from '@/assets/testimonials/woman1.jpg';

const TestimonialsSection = () => {
  const testimonials = [
    {
      content: "O JobFlash transformou completamente minha busca de emprego. Criei um currículo profissional em minutos e consegui três entrevistas na primeira semana de envio!",
      name: "Carlos Silva",
      position: "Desenvolvedor Full Stack",
      company: "TechBrasil",
      rating: 5,
      image: menPhoto
    },
    {
      content: "Estava há meses tentando conseguir entrevistas sem sucesso. Com o currículo gerado pelo JobFlash, finalmente passei pelos filtros ATS e consegui meu emprego dos sonhos!",
      name: "Ana Oliveira",
      position: "Gerente de Marketing",
      company: "Global Marketing",
      rating: 5,
      image: womanPhoto
    },
    {
      content: "Como profissional em transição de carreira, estava preocupado em como apresentar minhas habilidades. O JobFlash destacou perfeitamente minhas competências transferíveis!",
      name: "Pedro Santos",
      position: "Analista de Dados",
      company: "DataFuture",
      rating: 4,
      image: men2Photo
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            O que nossos usuários dizem
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Milhares de profissionais já transformaram suas carreiras com nossos currículos otimizados por IA.
          </p>
        </motion.div>

        <div className="relative">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                <Image 
                  src={testimonials[currentIndex].image} 
                  alt={`Foto de ${testimonials[currentIndex].name}`} 
                  width={128} 
                  height={128} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={`star-${i}`} 
                      className={i < testimonials[currentIndex].rating 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-gray-300 dark:text-gray-600"} 
                      size={24} 
                    />
                  ))}
                </div>
                
                <blockquote className="text-xl italic text-gray-700 dark:text-gray-300 mb-6">
                  &quot;{testimonials[currentIndex].content}&quot;
                </blockquote>
                
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {testimonials[currentIndex].name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {testimonials[currentIndex].position}, {testimonials[currentIndex].company}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <div className="flex justify-center mt-8 gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrev}
              className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </motion.button>
          </div>
          
          <div className="flex justify-center mt-6 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={`dot-${index}`}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                aria-label={`Ver depoimento ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;