// Wrapper Client Component para importar CreateResumeButton com ssr: false
// Necessário porque `next/dynamic` com ssr:false não pode ser usado em Server Components
"use client";

import type { SubscriptionLevel } from "@/lib/subscription";
import { Button } from "@/components/ui/button";
import { PlusSquare } from "lucide-react";
import dynamic from "next/dynamic";

// Importa sem SSR para evitar o hydration mismatch do Radix UI
const CreateResumeButton = dynamic(() => import("./CreateResumeButton"), {
  ssr: false,
  loading: () => (
    <Button className="mx-auto flex w-fit gap-2" disabled>
      <PlusSquare className="size-5" />
      Novo currículo
    </Button>
  ),
});

interface Props {
  canCreate: boolean;
  subscriptionLevel?: SubscriptionLevel;
}

export default function CreateResumeButtonWrapper({ canCreate, subscriptionLevel }: Props) {
  return (
    <CreateResumeButton
      canCreate={canCreate}
      subscriptionLevel={subscriptionLevel}
    />
  );
}
