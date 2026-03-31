"use client";

import logo from "@/assets/logo.png";
import ThemeToggle from "@/components/ThemeToggle";
import { UserButton, useClerk } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { CreditCard, ShieldCheck, Crown, Home } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import usePremiumModal from "@/hooks/usePremiumModal";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import ImportResumeButton from "./resumes/ImportResumeButton";

export default function Navbar({
  isAdmin,
  userPlan: initialPlan = "FREE",
  periodEnd: initialPeriodEnd,
  canCreate
}: {
  isAdmin?: boolean;
  userPlan?: string;
  periodEnd?: string | null;
  canCreate: boolean;
}) {
  const { theme } = useTheme();
  const premiumModal = usePremiumModal();
  const clerk = useClerk();

  // Estado local para atualizar em tempo real após o pagamento
  const [userPlan, setUserPlan] = useState(initialPlan);
  const [periodEnd, setPeriodEnd] = useState(initialPeriodEnd);

  // Sincroniza com as props do servidor quando elas mudam (ex: navegação)
  useEffect(() => {
    setUserPlan(initialPlan);
    setPeriodEnd(initialPeriodEnd);
  }, [initialPlan, initialPeriodEnd]);

  // Busca a assinatura atualizada do servidor periodicamente
  // e ao montar, garantindo que a UI reflita o estado real
  const refreshSubscription = useCallback(async () => {
    try {
      const res = await fetch("/api/payment-status");
      if (!res.ok) return;
      const data = await res.json();
      if (data.planType && data.planType !== "FREE") {
        setUserPlan(data.planType);
        setPeriodEnd(data.currentPeriodEnd);
      } else if (data.planType === null && data.status === null) {
        // Sem assinatura
        setUserPlan("FREE");
        setPeriodEnd(null);
      }
    } catch {}
  }, []);

  // Atualiza a assinatura ao montar e a cada 30 segundos
  useEffect(() => {
    refreshSubscription();
    const interval = setInterval(refreshSubscription, 30000);
    return () => clearInterval(interval);
  }, [refreshSubscription]);

  // Também atualiza quando a janela volta ao foco (usuário voltou da tela de pagamento)
  useEffect(() => {
    const handleFocus = () => refreshSubscription();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshSubscription]);

  const isPremium = userPlan !== "FREE";

  let formattedDate = "";
  if (periodEnd) {
    formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(periodEnd));
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-100 dark:border-stone-800 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-4">
          <Link href="/resumes" className="flex items-center gap-2">
            <Image
              src={logo}
              alt="Logo"
              width={35}
              height={35}
              className="rounded-full"
            />
            <span className="text-xl font-bold tracking-tight hidden sm:inline-block">
              JobFlashAI
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex">
            <ImportResumeButton canCreate={canCreate} variant="nav" />
          </div>
          <ThemeToggle />
          <UserButton
            appearance={{
              baseTheme: theme === "dark" ? dark : undefined,
              elements: { avatarBox: { width: 35, height: 35 } },
            }}
          >
            <UserButton.UserProfilePage
              label="Assinatura"
              url="subscription"
              labelIcon={<ShieldCheck className="size-4" />}
            >
              <div className="p-8 space-y-6 max-w-lg">
                <h1 className="text-2xl font-bold">Gerenciar Assinatura</h1>

                <div className="p-6 rounded-2xl border bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 rounded-full">
                      <Crown className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-500 uppercase tracking-widest">Plano Atual</p>
                      <p className={`text-3xl font-black ${
                        isPremium 
                          ? "text-indigo-600 dark:text-indigo-400" 
                          : "text-stone-800 dark:text-stone-200"
                      }`}>
                        {userPlan === "PRO" ? "SEMANAL" : userPlan === "MONTHLY" ? "MENSAL" : "GRÁTIS"}
                      </p>
                    </div>
                  </div>

                  {isPremium && formattedDate ? (
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      Válido até: <span className="font-bold text-stone-900 dark:text-white">{formattedDate}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      Você está no plano básico com limitações de uso e geração de currículos (1 apenas).
                    </p>
                  )}

                  <div className="pt-2">
                    {userPlan === "FREE" && (
                      <Link
                        href="/#precos"
                        onClick={() => clerk.closeUserProfile()}
                        className="block text-center w-full py-3 bg-stone-900 dark:bg-white dark:text-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 dark:hover:bg-stone-200 transition shadow-lg"
                      >
                        Fazer Upgrade Agora
                      </Link>
                    )}

                    {userPlan === "PRO" && (
                      <Link
                        href="/resumes?plan=monthly"
                        onClick={() => clerk.closeUserProfile()}
                        className="block text-center w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:shadow-indigo-500/20 hover:scale-[1.02] transition shadow-lg"
                      >
                        🔥 Upgrade para Plano Mensal
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </UserButton.UserProfilePage>

            {/* Link para a Home Page */}
            <UserButton.MenuItems>
              <UserButton.Link
                label="Página Inicial (Site)"
                labelIcon={<Home className="size-4" />}
                href="/"
              />
            </UserButton.MenuItems>

            {isAdmin && (
              <UserButton.MenuItems>
                <UserButton.Link
                  label="Painel Admin"
                  labelIcon={<CreditCard className="size-4" />}
                  href="/billing"
                />
              </UserButton.MenuItems>
            )}
          </UserButton>
        </div>
      </div>
    </header>
  );
}
