'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Zap, FileText, ArrowRight, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TypewriterEffect from '@/components/TypewriterEffect';
import BackgroundGradientAnimation from '@/components/BackgroundGradientAnimation';
import NavBar from './Navbar';

// Utility function for class names
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface AIResumeHeroProps {
  className?: string;
}

interface ClickEffect {
  id: number;
  x: number;
  y: number;
}

const AIResumeHero: React.FC<AIResumeHeroProps> = ({ className }) => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0.6]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.95]);
  const [isHovered, setIsHovered] = useState(false);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);

  const rotatingWords = ["Profissional", "Moderno", "Inteligente", "Personalizado"];

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!backgroundRef.current) return;
    
    const rect = backgroundRef.current.getBoundingClientRect();
    const id = Date.now();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setClickEffects(prev => [...prev, { id, x, y }]);
    
    setTimeout(() => {
      setClickEffects(prev => prev.filter(effect => effect.id !== id));
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Simulate click at center of element
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const id = Date.now();
      setClickEffects(prev => [...prev, { id, x: centerX, y: centerY }]);
      
      setTimeout(() => {
        setClickEffects(prev => prev.filter(effect => effect.id !== id));
      }, 1500);
    }
  };

  return (
    <>
      <NavBar />
      <section className={cn("relative h-screen flex items-center justify-center overflow-hidden bg-black", className ?? "")}>
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-grid-pattern"></button>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
        </div>
        {/* Background Gradient Animation */}
        <BackgroundGradientAnimation
          firstColor="59, 130, 246"
          secondColor="37, 99, 235"
          thirdColor="29, 78, 216"
          fourthColor="147, 197, 253"
          fifthColor="59, 130, 246"
          pointerColor="37, 99, 235"
          size="80%"
          blendingValue="hard-light"
          interactive={true}
          containerClassName="absolute inset-0"
        />

        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Interactive Background */}
        <button 
  ref={backgroundRef} 
  className="absolute inset-0 overflow-hidden cursor-pointer" 
  onClick={handleBackgroundClick}
  onKeyDown={handleKeyDown}
  aria-label="Interactive background - click to create visual effects"
>
          {clickEffects.map((effect) => (
            <motion.div
              key={`effect-${effect.id}`}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-blue-500/40 to-blue-600/40 blur-xl"
              style={{
                left: `${effect.x - 64}px`,
                top: `${effect.y - 64}px`,
              }}
            />
          ))}
        </div>

        {/* Floating icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { Icon: Zap, delay: 0 },
            { Icon: FileText, delay: 0.5 },
            { Icon: Briefcase, delay: 1 },
            { Icon: Zap, delay: 1.5 },
            { Icon: FileText, delay: 2 },
            { Icon: Briefcase, delay: 2.5 },
            { Icon: Zap, delay: 3 },
            { Icon: FileText, delay: 3.5 },
            { Icon: Briefcase, delay: 4 },
            { Icon: Zap, delay: 4.5 },
          ].map(({ Icon, delay }, i) => (
            <motion.div
              key={`floating-icon-${delay}-${i}`}
              className="absolute text-blue-500/20"
              initial={{ 
                opacity: 0, 
                scale: 0,
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0],
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                rotate: [0, 360],
              }}
              transition={{
                duration: Math.random() * 8 + 6,
                repeat: Infinity,
                delay: delay,
                ease: "linear",
              }}
            >
              <Icon className="w-6 h-6" />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="relative z-20 text-center px-4 max-w-6xl mx-auto flex flex-col justify-center items-center h-full"
          style={{ opacity, scale }}
        >
          {/* Main heading */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-4 leading-tight"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Crie seu Currículo{" "}
              <span className="relative">
                <TypewriterEffect
                  words={rotatingWords}
                  className="bg-gradient-to-r from-blue-300 to-blue-800 bg-clip-text text-transparent"
                  typeSpeed={120}
                  deleteSpeed={80}
                  delayBetweenWords={2000}
                />
              </span>
              <br />
              com Inteligência Artificial
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Transforme sua experiência profissional em um currículo impactante. 
              Nossa IA analisa seu perfil e cria documentos personalizados que destacam suas competências.
            </motion.p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Button
                size="lg"
                className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  boxShadow: "0 10px 25px rgba(37, 99, 235, 0.3)",
                }}
                asChild
              >
                <Link href="/resumes">
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="w-5 h-5" />
                    Criar Currículo Grátis
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                </Link>
              </Button>
            </motion.div>

            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg font-semibold rounded-full border-2 border-white/20 hover:bg-white/10 text-white transition-all duration-300"
              asChild
            >
              <Link href="#veja-nossa-ia-em-acao">
                <FileText className="w-5 h-5 mr-2" />
                Ver Exemplos
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.2 }}
        >
          <motion.div
            className="w-8 h-14 border-2 border-white/50 rounded-full flex justify-center cursor-pointer"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-3 bg-white/70 rounded-full mt-2"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>
    </>
  );
};

export default AIResumeHero;