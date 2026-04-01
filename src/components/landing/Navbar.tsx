'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { Home, Layers, FileText, User, Menu, X } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useSession } from '@/lib/auth-client';
import { UserDropdown } from '@/components/auth/UserDropdown';

interface NavBarProps {
  className?: string;
}

const NavBar: React.FC<NavBarProps> = ({ className }) => {
  const { scrollY } = useScroll();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, isPending } = useSession();
  const isSignedIn = !!session;

  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      setScrolled(latest > 20);
    });

    return () => unsubscribe();
  }, [scrollY]);

  // Se estivermos na Hero, queremos forçar a transparência total.
  const isForcedTransparent = className?.includes('transparent-hero');
  
  const navbarClass = `fixed top-4 left-0 right-0 mx-auto w-[95%] max-w-6xl z-[100] transition-all duration-300 ${className}`;

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
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: 1,
          y: 0,
          boxShadow: (scrolled && !isForcedTransparent) ? "0 10px 30px rgba(0, 0, 0, 0.05)" : "0 0px 0px rgba(0, 0, 0, 0)"
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className={`rounded-3xl px-6 py-3 transition-colors duration-300 ${ (scrolled && (!isForcedTransparent || scrollY.get() > 100)) ? 'bg-white/90 backdrop-blur-xl border border-stone-200 shadow-sm' : 'bg-transparent'}`}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Image src={logo} alt="JobFlashAI Logo" width={40} height={40} className="rounded-lg shadow-sm" />
              </motion.div>
              <span className="font-extrabold text-xl text-stone-900 hidden sm:inline tracking-tight">JobFlash</span>
            </Link>

            {/* Navigation Links - Desktop */}
            <div className={`hidden md:flex items-center gap-8 transition-all duration-500 ${(isForcedTransparent && !scrolled) ? 'opacity-0 scale-95 pointer-events-none absolute left-1/2 -translate-x-1/2' : 'opacity-100 scale-100 relative'}`}>
              {navItems.map((item) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className="text-stone-600 dark:text-stone-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{item.label}</span>
                </motion.a>
              ))}
            </div>

            {/* Login/App Button */}
            <div className="hidden md:flex items-center gap-3">
              {isPending ? (
                 <div className="h-9 w-24 bg-stone-200 animate-pulse rounded-xl" />
              ) : isSignedIn ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/resumes"
                    className="bg-stone-900 hover:bg-stone-800 text-white rounded-xl px-5 py-2 text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
                  >
                    Meu Painel
                  </Link>
                  <UserDropdown />
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  className="bg-stone-900 hover:bg-stone-800 text-white rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Entrar
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button className="md:hidden text-stone-900" onClick={() => setIsOpen(!isOpen)} whileTap={{ scale: 0.95 }}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="md:hidden mt-4 py-4 border-t border-stone-200"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col space-y-4 px-2">
                  {navItems.map((item) => (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 text-base font-medium text-stone-700 hover:text-blue-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="w-5 h-5 opacity-70" />
                      <span>{item.label}</span>
                    </motion.a>
                  ))}
                  {isSignedIn ? (
                    <Link href="/resumes" className="bg-stone-900 text-white rounded-xl px-5 py-3 text-sm font-medium shadow-sm flex justify-center items-center gap-2 mt-4" onClick={() => setIsOpen(false)}>
                      <FileText className="w-4 h-4" /> Meus Currículos
                    </Link>
                  ) : (
                    <Link href="/sign-in" className="bg-stone-900 text-white rounded-xl px-5 py-3 text-sm font-medium shadow-sm flex justify-center items-center gap-2 mt-4" onClick={() => setIsOpen(false)}>
                      <User className="w-4 h-4" /> Entrar
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
