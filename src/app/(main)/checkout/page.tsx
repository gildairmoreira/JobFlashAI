import { getGlobalSettings } from "@/app/(main)/billing/actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Fetch prices so we can pass them to Client avoiding waterfalls
  const settings = await getGlobalSettings();

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-md w-full">
        <CheckoutClient 
          proPrice={settings.proPrice} 
          monthlyPrice={settings.monthlyPrice} 
        />
      </div>
    </div>
  );
}
