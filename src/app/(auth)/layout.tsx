import React from "react";
import Image from "next/image";
import Link from "next/link";
import logoImg from "@/assets/logo.png";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden auth-no-scroll grid lg:grid-cols-2">
      {/* Lado Esquerdo: Formulário */}
      <main className="h-full flex items-center justify-center p-4 bg-stone-50 dark:bg-stone-950 relative overflow-hidden">
        {/* Ornamentos de Background */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-stone-400/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="w-full max-w-sm space-y-3 relative z-10">
          <div className="flex flex-col items-center text-center space-y-1">
            <Link href="/" className="transition-transform hover:scale-105 active:scale-95">
              <div className="relative w-16 h-16 mb-2">
                <Image
                  src={logoImg}
                  alt="JobFlash Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>
          {children}
          
          <p className="text-center text-xs text-stone-500 dark:text-stone-400 mt-8">
            © {new Date().getFullYear()} JobFlashAI. Todos os direitos reservados.
          </p>
        </div>
      </main>

      {/* Lado Direito: Preview/Copy (Visual Premium) */}
      <section className="hidden lg:flex h-full flex-col justify-center p-12 bg-stone-900 text-white relative overflow-hidden">
        {/* Efeito de Gradiente/Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(var(--primary-rgb),0.15),transparent)] z-0" />
        
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-medium text-stone-300">
            ✨ Design Premium & IA
          </div>
          <h2 className="text-3xl xl:text-4xl font-bold tracking-tight leading-tight">
            Seu próximo passo na carreira começa aqui.
          </h2>
          <p className="text-base xl:text-lg text-stone-300 leading-relaxed">
            Utilizamos inteligência artificial de ponta para transformar seus dados em currículos imparáveis. 
          </p>
          
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="space-y-1">
              <div className="text-xl xl:text-2xl font-bold">+15k</div>
              <div className="text-[10px] text-stone-400 uppercase">Currículos</div>
            </div>
            <div className="space-y-1">
              <div className="text-xl xl:text-2xl font-bold">98%</div>
              <div className="text-[10px] text-stone-400 uppercase">Satisfação</div>
            </div>
          </div>
        </div>

        {/* Novo Balão Flutuante Superior - Reposicionado para não sobrepor */}
        <div className="absolute top-8 right-12 max-w-[180px] p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md animate-bounce-subtle hidden xl:block">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-medium text-stone-300 uppercase tracking-wider">Sistema Ativo</span>
          </div>
          <p className="text-[10px] text-stone-200 leading-tight">
            IA processando novos modelos em tempo real.
          </p>
        </div>

        {/* Citação Flutuante */}
        <div className="absolute bottom-12 right-12 max-w-xs p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <p className="text-sm italic text-stone-200 mb-4">
            "O JobFlash reduziu meu tempo de edição em 90%. Em uma semana consegui 3 entrevistas."
          </p>
          <div className="flex items-center gap-3">
            <img 
              src="https://i.pravatar.cc/150?u=a042581f4e29026024d" 
              alt="Ricardo S." 
              className="w-8 h-8 rounded-full border border-stone-600 object-cover" 
            />
            <div>
              <div className="text-xs font-bold">Ricardo S.</div>
              <div className="text-[10px] text-stone-400">Engenheiro de Software</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
