'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <Link href="/" className="inline-block mb-12 cursor-pointer">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-3xl font-extrabold text-stone-900 tracking-tight">JobFlashAI</span>
          </motion.div>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl shadow-xl p-8 border border-stone-100 dark:border-stone-800 text-center"
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [-10, 10, -10, 10, 0] }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeInOut" }}
          className="flex justify-center mb-6"
        >
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full text-blue-600 dark:text-blue-400">
            <Frown className="w-16 h-16" />
          </div>
        </motion.div>

        <h1 className="text-4xl font-extrabold text-stone-900 dark:text-white mb-2 tracking-tight">
          Ops! 404
        </h1>
        <h2 className="text-xl font-semibold text-stone-700 dark:text-stone-300 mb-4">
          Página não encontrada
        </h2>
        <p className="text-stone-500 dark:text-stone-400 mb-8 font-light">
          Parece que você se perdeu no espaço. A página que você está procurando pode ter sido removida, renomeada ou está temporariamente indisponível.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full sm:w-auto flex items-center justify-center gap-2 border-stone-200 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>

          <Button
            asChild
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
          >
            <Link href="/">
              <Home className="w-4 h-4" />
              Página Inicial
            </Link>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="mt-12 text-sm text-stone-400 font-light"
      >
        Você encontrou um lugar que não existe.
      </motion.div>
    </div>
  );
}
