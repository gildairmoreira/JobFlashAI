'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { Home, Layers, FileText, User, Menu, X } from 'lucide-react';
import logo from '@/assets/logos/logo.png';
import { useUser } from '@clerk/nextjs';

interface NavBarProps {
  className?: string;
}

const NavBar: React.FC<NavBarProps> = ({ className }) => {
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn } = useUser();

  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      // Só mostra a navbar quando rolar para fora da seção hero (altura da tela)
      setIsVisible(latest > window.innerHeight - 100);
      setScrolled(latest > window.innerHeight);
    });

    return () => unsubscribe();
  }, [scrollY]);

  // Apply the visibility class based on scroll position
  const navbarClass = `fixed top-4 left-0 right-0 mx-auto w-[95%] max-w-6xl z-50 ${className} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`;


  const navItems = [
    { icon: Home, label: "Início", href: "#home" },
    { icon: Layers, label: "Recursos", href: "#recursos" },
    { icon: FileText, label: "Preços", href: "#precos" },
    { icon: User, label: "Avaliações", href: "#avaliacoes" }
  ];

  return (
    <AnimatePresence>
      <motion.nav
        className={navbarClass}
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ 
          opacity: isVisible ? 1 : 0, 
          y: isVisible ? 0 : -20, 
          scale: 1,
          boxShadow: scrolled ? "0 10px 30px rgba(0, 0, 0, 0.2)" : "0 0px 0px rgba(0, 0, 0, 0)"
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 shadow-lg">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image src={logo} alt="JobFlashAI Logo" width={60} height={60} className="rounded-lg" />
              </motion.div>
              <span className="font-bold text-lg text-white hidden sm:inline" style={{textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000'}}>JobFlashAI</span>
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2 text-sm text-white hover:text-blue-300 transition-colors"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </motion.a>
              ))}
            </div>

            {/* Login/App Button */}
            <div className="hidden md:block">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSignedIn ? (
                  <Link 
                    href="/resumes" 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full px-5 py-2 text-sm font-medium shadow-md"
                  >
                    <FileText className="w-4 h-4 mr-2 inline-block" />
                    Meus Currículos
                  </Link>
                ) : (
                  <Link 
                    href="/sign-in" 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full px-5 py-2 text-sm font-medium shadow-md"
                  >
                    <User className="w-4 h-4 mr-2 inline-block" />
                    Entrar
                  </Link>
                )}
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden text-white"
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="md:hidden mt-4 py-4 border-t border-white/10"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col items-center space-y-4">
                  {navItems.map((item) => (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      className="flex items-center justify-center gap-2 text-sm text-white hover:text-blue-300 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </motion.a>
                  ))}
                  {isSignedIn ? (
                    <Link 
                      href="/resumes" 
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full px-5 py-2 text-sm font-medium shadow-md w-1/2 text-center mt-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <FileText className="w-4 h-4 mr-2 inline-block" />
                      Meus Currículos
                    </Link>
                  ) : (
                    <Link 
                      href="/sign-in" 
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full px-5 py-2 text-sm font-medium shadow-md w-1/2 text-center mt-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2 inline-block" />
                      Entrar
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </AnimatePresence>
  );
};

export default NavBar;