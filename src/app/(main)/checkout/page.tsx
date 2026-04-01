import { getGlobalSettings } from "@/app/(main)/billing/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";
import Link from "next/link";
import { HomeIcon } from "lucide-react";
import prisma from "@/lib/prisma";

export default async function CheckoutPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Passa o currentPeriodEnd atual para o client usar como referência
  // para detectar uma NOVA aprovação (sem disparar se o plano já estava ativo)
  const existingSub = await prisma.userSubscription.findUnique({
    where: { userId },
    select: { currentPeriodEnd: true },
  });

  const settings = await getGlobalSettings();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center py-12 px-4 relative transition-colors duration-500">
      {/* Botão de voltar para a landing page */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-all bg-white dark:bg-stone-900 rounded-full px-4 py-2 shadow-sm border border-stone-100 dark:border-stone-800 text-sm font-semibold hover:shadow-md"
        >
          <HomeIcon className="w-4 h-4" />
          Página Inicial
        </Link>
      </div>

      <div className="max-w-md w-full mt-6">
        <CheckoutClient
          proPrice={settings.proPrice}
          monthlyPrice={settings.monthlyPrice}
          initialPeriodEnd={existingSub?.currentPeriodEnd?.toISOString() ?? null}
        />
      </div>
    </div>
  );
}
