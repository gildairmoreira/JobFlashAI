"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// Tela de sucesso de pagamento com animação de confete
// Exibida quando o pagamento PIX é aprovado via webhook
export default function PaymentSuccess({ planType }: { planType: string | null }) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  const launchConfetti = useCallback(async () => {
    // Importação dinâmica para garantir que só execute no browser, nunca no SSR
    const confettiModule = await import("canvas-confetti");
    const confetti = confettiModule.default;

    const duration = 4000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#6366f1", "#8b5cf6", "#10b981"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#6366f1", "#8b5cf6", "#10b981"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  useEffect(() => {
    launchConfetti();

    // Contagem regressiva para redirecionar para /resumes
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/resumes");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [launchConfetti, router]);

  const planLabel = planType === "PRO" ? "Pro (7 Dias)" : "Mensal";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-stone-950 animate-in fade-in duration-500">
      <div className="text-center px-6 max-w-sm mx-auto">
        {/* Ícone Principal */}
        <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-700">
          <svg
            className="w-12 h-12 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-black text-stone-900 dark:text-white mb-2">
          Pagamento Aprovado! 🎉
        </h1>

        {/* Subtítulo */}
        <p className="text-stone-500 dark:text-stone-400 text-base mb-2">
          Seu plano <span className="font-bold text-indigo-600 dark:text-indigo-400">{planLabel}</span> está ativo agora.
        </p>
        <p className="text-stone-400 dark:text-stone-500 text-sm mb-8">
          Bem-vindo ao time premium do JobFlashAI! ✨
        </p>

        {/* Barra de progresso */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 mb-4 overflow-hidden">
          <div
            className="h-2 bg-indigo-500 rounded-full transition-all ease-linear"
            style={{
              width: `${((5 - countdown) / 5) * 100}%`,
              transitionDuration: "1s",
            }}
          />
        </div>

        {/* Mensagem de redirecionamento */}
        <p className="text-sm text-stone-400 dark:text-stone-500">
          Você será redirecionado em{" "}
          <span className="font-bold text-indigo-500">{countdown}s</span>...
        </p>

        {/* Botão de ação imediata */}
        <button
          onClick={() => router.push("/resumes")}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          Ir para meus currículos agora →
        </button>
      </div>
    </div>
  );
}
