import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Rocket, Sparkles, Clock } from 'lucide-react';
import LandingPageLayout from '@/app/LandingPageLayout';
import NavBar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Em Breve | JobFlashAI',
  description: 'Estamos trabalhando em novidades incríveis para turbinar sua busca por emprego.',
};

export default function ComingSoonPage() {
  return (
    <LandingPageLayout>
      <NavBar className="bg-white/80 backdrop-blur-md border-b border-stone-200" />
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-24 px-4 bg-[#FAF9F7]">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-4">
            <Rocket className="w-12 h-12 text-blue-600" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-stone-900 tracking-tight">
            Novidades a caminho! <Sparkles className="inline-block w-10 h-10 text-yellow-400" />
          </h1>
          
          <p className="text-xl text-stone-600 font-light leading-relaxed max-w-xl mx-auto">
            Estamos construindo recursos incríveis (como novos Templates e Exemplos) para deixar seu currículo ainda mais irresistível para os recrutadores. Fique ligado!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 pb-12">
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-stone-100">
              <Clock className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="font-bold text-stone-900">Em Desenvolvimento</h3>
              <p className="text-sm text-stone-500 text-center mt-2">Nossa IA está trabalhando a todo vapor.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-stone-100">
              <Sparkles className="w-8 h-8 text-yellow-500 mb-3" />
              <h3 className="font-bold text-stone-900">Novos Templates</h3>
              <p className="text-sm text-stone-500 text-center mt-2">Designs que convertem mais entrevistas.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-stone-100">
              <Rocket className="w-8 h-8 text-red-500 mb-3" />
              <h3 className="font-bold text-stone-900">Exemplos Reais</h3>
              <p className="text-sm text-stone-500 text-center mt-2">Inspire-se em quem já foi contratado.</p>
            </div>
          </div>
          
          <div>
            <Button asChild size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-8">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para o Início
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </LandingPageLayout>
  );
}
