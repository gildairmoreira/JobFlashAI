import PremiumModal from "@/components/premium/PremiumModal";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import ClientNavbar from "./ClientNavbar";
import SubscriptionLevelProvider from "./SubscriptionLevelProvider";
import prisma from "@/lib/prisma";
import RenewButton from "@/components/premium/RenewButton";
import { getGlobalSettings } from "./billing/actions";
import { Hammer } from "lucide-react";
import { canCreateResume, canImportResume } from "@/lib/permissions";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return null;
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  const userSubscriptionLevel = await getUserSubscriptionLevel(userId);
  const totalCount = await prisma.resume.count({ where: { userId } });
  const canCreate = canCreateResume(userSubscriptionLevel, totalCount);
  const canImport = canImportResume(userSubscriptionLevel);

  const isMaster = userEmail === "gildair457@gmail.com";
  const userSub = await prisma.userSubscription.findUnique({ where: { userId } });
  const isAdmin = isMaster || userSub?.role === "ADMIN" || userSub?.role === "MASTER_ADMIN";
  
  // Real Maintenance Mode Implementation
  const globalSettings = await getGlobalSettings();
  if (globalSettings.maintenanceMode && !isAdmin) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 text-center">
            <div className="max-w-md space-y-6 p-8 bg-white rounded-3xl shadow-xl border border-stone-100">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Hammer className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black text-stone-900 tracking-tight">Em Manutenção</h1>
                <p className="text-stone-600 leading-relaxed">
                    {globalSettings.maintenanceMessage || "Estamos trabalhando para melhorar sua experiência. Voltaremos em alguns instantes!"}
                </p>
                <div className="pt-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">JobFlashAI System Status: Maintenance</div>
                </div>
            </div>
        </div>
    );
  }

  if (userSubscriptionLevel === "banned") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-stone-950 px-4 text-center text-white">
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-bold text-red-500">Acesso Restrito</h1>
          <p className="text-stone-400">Esta conta foi banida permanentemente e não pode acessar a plataforma.</p>
        </div>
      </div>
    );
  }

  if (userSubscriptionLevel === "frozen") {
    const isExpired = userSub?.currentPeriodEnd && userSub.currentPeriodEnd < new Date();

    return (
      <SubscriptionLevelProvider userSubscriptionLevel={userSubscriptionLevel}>
        <div className="flex min-h-[100dvh] flex-col bg-[#FAF9F7]">
          <ClientNavbar isAdmin={isAdmin} canCreate={canCreate} canImport={canImport} />
          <main className="flex flex-1 items-center justify-center px-4 py-12">
            <div className="max-w-xl w-full text-center space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-stone-100">
              <div className="inline-block bg-orange-100 text-orange-700 px-5 py-2 rounded-full font-bold text-sm tracking-wide">
                {isExpired ? "ASSINATURA EXPIRADA" : "CONTA INATIVA"}
              </div>

              {isExpired ? (
                <div className="space-y-6">
                  <h1 className="text-3xl font-black text-stone-900">Seu plano expirou</h1>
                  <p className="text-stone-600 text-lg">
                    O período da sua assinatura chegou ao fim. Renove seu plano agora mesmo para recuperar o acesso aos seus currículos e ferramentas premium de inteligência artificial.
                  </p>
                  <div className="pt-4">
                    <RenewButton />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h1 className="text-3xl font-black text-stone-900">Sua conta foi congelada</h1>
                  <p className="text-stone-600 text-lg">
                    Sua conta foi temporariamente desativada pela administração. Por favor, entre em contato com nosso suporte para regularizar sua situação.
                  </p>
                  <div className="pt-4">
                    <a href="mailto:contato.gildair@gmail.com" className="inline-block px-10 py-5 bg-stone-900 text-white font-bold rounded-full hover:bg-stone-800 transition shadow-lg hover:scale-105">
                      Falar com Suporte (contato.gildair@gmail.com)
                    </a>
                  </div>
                </div>
              )}
            </div>
          </main>
          <PremiumModal />
        </div>
      </SubscriptionLevelProvider>
    );
  }

  return (
    <SubscriptionLevelProvider userSubscriptionLevel={userSubscriptionLevel}>
      <div className="flex min-h-screen flex-col">
        <ClientNavbar
          isAdmin={isAdmin}
          userPlan={userSub?.planType || "FREE"}
          periodEnd={userSub?.currentPeriodEnd?.toISOString() || null}
          canCreate={canCreate}
          canImport={canImport}
        />
        {children}
        <PremiumModal />
      </div>
    </SubscriptionLevelProvider>
  );
}
