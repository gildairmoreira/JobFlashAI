'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Github, Twitter, Linkedin, Instagram, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'Produto',
      links: [
        { name: 'Recursos', href: '#' },
        { name: 'Templates', href: '#' },
        { name: 'Preços', href: '#' },
        { name: 'Exemplos', href: '#' },
        { name: 'Avaliações', href: '#' },
      ],
    },
    {
      title: 'Suporte',
      links: [
        { name: 'Ajuda', href: '/suporte/ajuda' },
        { name: 'Contato', href: '/suporte/contato' },
        { name: 'FAQ', href: '/suporte/faq' },
        { name: 'Tutoriais', href: '/suporte/tutoriais' },
        { name: 'Status', href: '/suporte/status' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Termos', href: '/legal/termos' },
        { name: 'Privacidade', href: '/legal/privacidade' },
        { name: 'Cookies', href: '/legal/cookies' },
        { name: 'Licenças', href: '/legal/licencas' },
        { name: 'Configurações', href: '/legal/configuracoes' },
      ],
    },
  ];

  const socialLinks = [
    { name: 'GitHub', icon: <Github className="w-5 h-5" />, href: '#' },
    { name: 'Twitter', icon: <Twitter className="w-5 h-5" />, href: '#' },
    { name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, href: '#' },
    { name: 'Instagram', icon: <Instagram className="w-5 h-5" />, href: '#' },
    { name: 'Email', icon: <Mail className="w-5 h-5" />, href: 'mailto:contato@curriculo-ai.com' },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                JobFlashAI
              </span>
            </Link>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-md">
              O JobFlashAI utiliza inteligência artificial para criar currículos profissionais personalizados que destacam suas habilidades e experiências de forma eficaz.
            </p>
            
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.href}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  aria-label={link.name}
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>
          </div>
          
          {footerLinks.map((group, groupIndex) => (
            <div key={groupIndex} className="col-span-1">
              <h3 className="font-semibold text-foreground mb-4">{group.title}</h3>
              <ul className="space-y-3">
                {group.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={link.href}
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col items-center md:items-start">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              © {currentYear} JobFlashAI. Todos os direitos reservados.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Powered by <Link href="https://www.instagram.com/gildair" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 transition-colors">gildair</Link>
            </p>
          </div>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link 
              href="/legal/termos"
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Termos de Serviço
            </Link>
            <Link 
              href="/legal/privacidade"
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;