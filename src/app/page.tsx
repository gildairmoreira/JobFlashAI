import logo from "@/assets/logo.png";
import resumePreview from "@/assets/resume-preview.jpg";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-100 px-5 py-12 text-center text-gray-900 md:flex-row md:text-start lg:gap-12">
      <div className="max-w-prose space-y-3">
        <Image
          src={logo}
          alt="JobFlashAI Logo"
          width={150}
          height={150}
          className="mx-auto md:ms-0"
        />
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Crie o{" "}
          <span className="inline-block bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Currículo Perfeito
          </span>{" "}
          em Minutos
        </h1>
        <p className="text-lg text-gray-500">
          Nosso <span className="font-bold">gerador de currículos com IA</span> ajuda você
          a criar um currículo profissional de forma rápida e fácil.
        </p>
        <Button asChild size="lg" variant="premium">
          <Link href="/resumes">Começar agora</Link>
        </Button>
      </div>
      <div>
        <Image
          src={resumePreview}
          alt="Prévia do currículo"
          width={600}
          className="shadow-md lg:rotate-[1.5deg]"
        />
      </div>
    </main>
  );
}
