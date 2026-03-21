"use client";

import { Loader2, ShieldCheck } from "lucide-react";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 dark:bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center px-6">
        <div className="relative">
          {/* Círculo Pulsante de Fundo */}
          <div className="absolute inset-x-0 inset-y-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse scale-150" />
          
          <div className="relative bg-white dark:bg-stone-900 p-6 rounded-3xl shadow-xl border border-stone-100 dark:border-stone-800">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">
            Preparando Checkout Seguro...
          </h2 >
          <p className="text-sm text-stone-500 dark:text-stone-400 font-medium">
            Estamos gerando seu link de pagamento oficial do Mercado Pago. Você será redirecionado em instantes.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-900 rounded-full border border-stone-200 dark:border-stone-800 mt-4 opacity-70">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Ambiente 100% Protegido</span>
        </div>
      </div>
    </div>
  );
}
