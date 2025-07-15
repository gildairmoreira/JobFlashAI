// import prisma from "@/lib/prisma";
// import stripe from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
// import { formatDate } from "date-fns";
import { Metadata } from "next";
// import Stripe from "stripe";
// import GetSubscriptionButton from "./GetSubscriptionButton";
// import ManageSubscriptionButton from "./ManageSubscriptionButton";

export const metadata: Metadata = {
  title: "Faturamento",
};

// Billing page simplified - all features are now free
export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // No subscription management needed since all features are free
  // const subscription = await prisma.userSubscription.findUnique({
  //   where: { userId },
  // });

  // const priceInfo = subscription && subscription.stripePriceId
  //   ? await stripe.prices.retrieve(subscription.stripePriceId, {
  //       expand: ["product"],
  //     })
  //   : null;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
      <h1 className="text-3xl font-bold">Faturamento</h1>
      <p>
        Seu plano atual:{" "}
        <span className="font-bold text-green-600">
          Premium - Todas as funcionalidades liberadas gratuitamente!
        </span>
      </p>
      <div className="rounded-lg bg-green-50 p-4 border border-green-200">
        <h2 className="text-lg font-semibold text-green-800 mb-2">🎉 Acesso Total Gratuito</h2>
        <p className="text-green-700">
          Todas as funcionalidades premium estão disponíveis gratuitamente. 
          Aproveite para criar currículos ilimitados com IA!
        </p>
      </div>
      {/* Subscription management removed since all features are free */}
      {/* {subscription ? (
        <>
          {subscription.stripeCancelAtPeriodEnd && subscription.stripeCurrentPeriodEnd && (
            <p className="text-destructive">
              Sua assinatura será cancelada em{" "}
              {formatDate(subscription.stripeCurrentPeriodEnd, "dd 'de' MMMM 'de' yyyy")}
            </p>
          )}
          <ManageSubscriptionButton />
        </>
      ) : (
        <GetSubscriptionButton />
      )} */}
    </main>
  );
}
