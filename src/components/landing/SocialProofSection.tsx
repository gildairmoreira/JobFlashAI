'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import Image from 'next/image';
import googleLogo from '@/assets/companies/google.png';
import microsoftLogo from '@/assets/companies/microsoft.png';
import amazonLogo from '@/assets/companies/amazon.png';
import metaLogo from '@/assets/companies/meta.png';
import appleLogo from '@/assets/companies/apple.png';
import netflixLogo from '@/assets/companies/Netflix.png';

const SocialProofSection: React.FC = () => {
  const companies = [
    { name: 'Google', logo: googleLogo },
    { name: 'Microsoft', logo: microsoftLogo },
    { name: 'Amazon', logo: amazonLogo },
    { name: 'Meta', logo: metaLogo },
    { name: 'Apple', logo: appleLogo },
    { name: 'Netflix', logo: netflixLogo },
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
            <Users className="w-5 h-5" />
            <span className="text-sm uppercase tracking-wider font-semibold">
              Confiança Comprovada
            </span>
          </motion.div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Profissionais de Grandes Empresas Confiam em Nós
          </h2>
          
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Nossos currículos ajudaram candidatos a conquistar vagas nas maiores empresas do mundo.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {companies.map((company, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700 p-2">
                <Image 
                  src={company.logo} 
                  alt={`${company.name} logo`} 
                  width={55} 
                  height={55}
                  className="object-contain"
                />
              </div>
              <span className="sr-only">{company.name}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            <span className="font-semibold">+50.000</span> currículos criados • <span className="font-semibold">+10.000</span> profissionais contratados • <span className="font-semibold">+95%</span> taxa de aprovação
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProofSection;