import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-3 py-6 text-center">
      <h1 className="text-3xl font-bold">Sucesso no Faturamento</h1>
      <p>
        O checkout foi bem-sucedido e sua conta Pro foi ativada.
        Aproveite!
      </p>
      <Button asChild>
        <Link href="/resumes">Ir para currículos</Link>
      </Button>
    </main>
  );
}
