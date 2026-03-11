"use client";

import logo from "@/assets/logo.png";
import ThemeToggle from "@/components/ThemeToggle";
import { UserButton, useClerk } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { CreditCard, ShieldCheck, Crown } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import usePremiumModal from "@/hooks/usePremiumModal";

export default function Navbar({
  isAdmin,
  userPlan = "FREE",
  periodEnd
}: {
  isAdmin?: boolean;
  userPlan?: string;
  periodEnd?: string | null;
}) {
  const { theme } = useTheme();
  const premiumModal = usePremiumModal();
  const clerk = useClerk();

  const isPremium = userPlan !== "FREE";

  let formattedDate = "";
  if (periodEnd) {
    formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(periodEnd));
  }

  return (
    <header className="shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 p-3">
        <Link href="/resumes" className="flex items-center gap-2">
          <Image
            src={logo}
            alt="Logo"
            width={50}
            height={50}
            className="rounded-full"
          />
          <span className="text-xl font-bold tracking-tight">
            JobFlashAI
          </span>
        </Link>
        <div className="flex items-center gap-3">
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
                      <p className="text-3xl font-black">
                        {userPlan === "PRO" ? "SEMANAL" : userPlan === "LIFETIME" ? "MENSAL" : "GRÁTIS"}
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

                  {!isPremium && (
                    <Link
                      href="/#precos"
                      onClick={() => clerk.closeUserProfile()}
                      className="block text-center w-full py-3 bg-stone-900 text-white font-bold rounded-lg hover:bg-stone-800 transition"
                    >
                      Fazer Upgrade Agora
                    </Link>
                  )}
                </div>
              </div>
            </UserButton.UserProfilePage>

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
