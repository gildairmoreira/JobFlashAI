"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import RenewButton from "./RenewButton";

interface ExpiredModalProps {
  isExpired: boolean;
}

export default function ExpiredModal({ isExpired }: ExpiredModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal once per session if expired
    if (isExpired && !sessionStorage.getItem("expiredModalDismissed")) {
      setIsOpen(true);
    }
  }, [isExpired]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("expiredModalDismissed", "true");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-100 p-8 sm:p-10 overflow-hidden"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-6">
              <div className="inline-block bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full font-bold text-xs tracking-wide">
                ASSINATURA EXPIRADA
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900">Seu plano expirou</h2>
                <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
                  O período da sua assinatura chegou ao fim. Renove seu plano agora mesmo para recuperar o acesso ilimitado aos seus currículos e ferramentas premium de inteligência artificial. Você ainda pode usar o plano gratuito com as limitações padrão.
                </p>
              </div>

              <div className="pt-2">
                <RenewButton />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
