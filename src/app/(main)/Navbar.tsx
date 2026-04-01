"use client";

import logo from "@/assets/logo.png";
import ThemeToggle from "@/components/ThemeToggle";
import { UserDropdown } from "@/components/auth/UserDropdown";
import { CreditCard, ShieldCheck, Crown, Home } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import usePremiumModal from "@/hooks/usePremiumModal";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import ImportResumeButton from "./resumes/ImportResumeButton";
import { usePathname } from "next/navigation";

export default function Navbar({
  isAdmin,
  userPlan: initialPlan = "FREE",
  periodEnd: initialPeriodEnd,
  canCreate,
  canImport
}: {
  isAdmin?: boolean;
  userPlan?: string;
  periodEnd?: string | null;
  canCreate: boolean;
  canImport: boolean;
}) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const premiumModal = usePremiumModal();

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
          {pathname === "/resumes" && (
            <div className="hidden md:flex">
              <ImportResumeButton canCreate={canCreate} canImport={canImport} variant="nav" />
            </div>
          )}
          <ThemeToggle />
          
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
