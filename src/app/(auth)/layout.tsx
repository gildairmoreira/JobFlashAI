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
      <section className="hidden lg:flex h-full flex-col justify-center p-16 bg-[#0a0a0a] text-white relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] bg-teal-600/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-stone-950/40 mix-blend-overlay" />
        </div>
        
        <div className="relative z-10 flex flex-col h-full justify-between max-w-xl mx-auto w-full">
          {/* Top Section */}
          <div className="space-y-8 mt-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-stone-300 tracking-wide">SISTEMA ATIVO & PROCESSANDO</span>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl xl:text-5xl 2xl:text-6xl font-black tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white via-stone-200 to-stone-500">
                Seu próximo passo na carreira começa agora.
              </h2>
              <p className="text-lg xl:text-xl text-stone-400 leading-relaxed max-w-lg font-light">
                Utilizamos inteligência artificial avançada para transformar suas experiências em currículos magnéticos que atraem as melhores oportunidades.
              </p>
            </div>
          </div>

          {/* Middle/Floating Elements Section */}
          <div className="relative flex-1 w-full flex items-center justify-center my-12">
             {/* Main Mockup Card */}
             <div className="relative w-full max-w-md bg-stone-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent z-0" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-24 bg-stone-700/50 rounded-full" />
                    <div className="h-6 w-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                       <span className="text-[10px] text-blue-400 font-bold">ATS 98%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 w-3/4 bg-stone-200/90 rounded-md" />
                    <div className="h-4 w-1/2 bg-stone-400/80 rounded-md" />
                  </div>
                  <div className="pt-4 space-y-3">
                    <div className="h-2 w-full bg-stone-800 rounded-full" />
                    <div className="h-2 w-5/6 bg-stone-800 rounded-full" />
                    <div className="h-2 w-4/6 bg-stone-800 rounded-full" />
                  </div>
                </div>
             </div>

             {/* Floating badge 1 */}
             <div className="absolute -right-8 top-10 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl animate-[bounce_4s_infinite]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs text-stone-300 font-medium">Aprovação</p>
                    <p className="text-sm font-bold text-white">Garantida</p>
                  </div>
                </div>
             </div>

             {/* Floating badge 2 */}
             <div className="absolute -left-6 bottom-10 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl animate-[bounce_5s_infinite_reverse]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-stone-300 font-medium">Geração IA</p>
                    <p className="text-sm font-bold text-white">Em Segundos</p>
                  </div>
                </div>
             </div>
          </div>
          
          {/* Bottom Section */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
            <div className="space-y-2">
              <div className="text-3xl xl:text-4xl font-black text-white">+15k</div>
              <div className="text-xs font-semibold text-stone-400 tracking-widest uppercase">Currículos Gerados</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-3">
                    <img src="https://i.pravatar.cc/100?img=1" className="w-10 h-10 rounded-full border-2 border-stone-900" alt="User" />
                    <img src="https://i.pravatar.cc/100?img=2" className="w-10 h-10 rounded-full border-2 border-stone-900" alt="User" />
                    <img src="https://i.pravatar.cc/100?img=3" className="w-10 h-10 rounded-full border-2 border-stone-900" alt="User" />
                 </div>
                 <div className="text-3xl xl:text-4xl font-black text-white">4.9/5</div>
              </div>
              <div className="text-xs font-semibold text-stone-400 tracking-widest uppercase">Avaliação Média</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
