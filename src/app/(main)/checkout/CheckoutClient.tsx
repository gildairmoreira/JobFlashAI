"use client";

import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPixPayment, createCardPayment } from "./actions";
import { Loader2, Copy, Check, Info, ShieldCheck, ChevronDown } from "lucide-react";
import { initMercadoPago } from '@mercadopago/sdk-react';
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import PaymentSuccess from "./PaymentSuccess";

// O Payment Brick precisa ser importado dinamicamente para não falhar no SSR do Next.js
const MPPayment = dynamic(
  () => import("@mercadopago/sdk-react").then((mod) => mod.Payment),
  { ssr: false, loading: () => <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div> }
);

export default function CheckoutClient({ proPrice, monthlyPrice, initialPeriodEnd }: { proPrice: number, monthlyPrice: number, initialPeriodEnd: string | null }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const rawPlan = searchParams.get("plan");
  const plan = rawPlan === "pro" || rawPlan === "monthly" ? rawPlan : "monthly"; // default
  
  const amount = plan === "pro" ? proPrice : monthlyPrice;

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [loadingPix, setLoadingPix] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [paymentApproved, setPaymentApproved] = useState(false);
  const [approvedPlanType, setApprovedPlanType] = useState<string | null>(null);
  const [theme, setTheme] = useState<'default' | 'dark'>('default');
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Detecta se está em dark mode para o tijolo do MP
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'default');
  }, []);

  useEffect(() => {
    // Inicializa a SDK do MP no client
    const pubKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    if (pubKey) {
      initMercadoPago(pubKey, { locale: 'pt-BR' });
      setSdkInitialized(true);
    }
  }, []);

  useEffect(() => {
    // Gerar Pix assim que montar o componente
    handleGeneratePix();
  }, [plan]);

  // Inicia o polling de status de pagamento assim que o QR Code é gerado
  // Só considera pago se o currentPeriodEnd for MAIOR do que era antes do checkout
  // Isso evita o bug de auto-aprovação quando o user já tinha um plano ativo
  const startPolling = useCallback((paymentId: string | null = null) => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(async () => {
      try {
        const url = paymentId ? `/api/payment-status?paymentId=${paymentId}` : "/api/payment-status";
        const res = await fetch(url);
        const data = await res.json();
        
        const newPeriodEnd = data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null;
        const oldPeriodEnd = initialPeriodEnd ? new Date(initialPeriodEnd) : null;

        // Considera pago APENAS se a data de expiração aumentou em relação ao que existia ANTES do checkout
        const isNewPayment = newPeriodEnd !== null && (
          oldPeriodEnd === null || newPeriodEnd > oldPeriodEnd
        );

        if (isNewPayment && data.status === "ACTIVE") {
          setPaymentApproved(true);
          setApprovedPlanType(data.planType);
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch (e) {
        console.error("Polling erro:", e);
      }
    }, 3000);
  }, [initialPeriodEnd]);

  // Limpa o intervalo de polling ao desmontar
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  async function handleGeneratePix() {
    try {
      setLoadingPix(true);
      const res = await createPixPayment(plan);
      if (res.success) {
        setQrCode(res.qrCode || null);
        setQrCodeBase64(res.qrCodeBase64 || null);
        // Inicia polling assim que o QR code é exibido ao usuário
        startPolling(res.paymentId ? res.paymentId.toString() : null);
      }
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao gerar o código PIX. Tente novamente.",
      });
    } finally {
      setLoadingPix(false);
    }
  }

  function handleCopy() {
    if (!qrCode) return;
    navigator.clipboard.writeText(qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const customization = {
    paymentMethods: {
      creditCard: "all" as any,
      debitCard: "all" as any,
    },
    visual: {
      theme: theme
    }
  } as any;

  const initialization = {
    amount,
  };

  const onSubmit = async (param: any) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const result = await createCardPayment(param.formData, plan);
        if (result.success && (result.status === "approved" || result.status === "in_process")) {
          toast({
            title: "Pagamento aprovado! 🚀",
            description: "Você já pode acessar seus benefícios.",
          });
          setTimeout(() => {
            router.push("/resumes");
          }, 2000);
          resolve();
        } else {
          toast({
            variant: "destructive",
            title: "Pagamento Recusado",
            description: "Verifique os dados do cartão e tente novamente.",
          });
          reject();
        }
      } catch (err) {
        reject();
      }
    });
  };

  // Exibe a tela de sucesso com confete quando o pagamento for aprovado pelo webhook
  if (paymentApproved) {
    return <PaymentSuccess planType={approvedPlanType} />;
  }

  return (
    <>
      <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-black text-stone-900 dark:text-white">Quase lá! 🚀</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-2">Realize o pagamento para liberar seu plano {plan === "pro" ? "Pro" : "Mensal"}.</p>
        <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-4">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
        </div>
      </div>

      <Tabs defaultValue="pix" className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12 rounded-xl bg-stone-100 dark:bg-stone-800/50 p-1 border border-stone-200 dark:border-stone-800">
          <TabsTrigger value="pix" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-stone-900 dark:data-[state=active]:text-indigo-400">PIX</TabsTrigger>
          <TabsTrigger value="card" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-stone-900 dark:data-[state=active]:text-indigo-400">Cartão de Crédito</TabsTrigger>
        </TabsList>
        
        {/* ABA PIX */}
        <TabsContent value="pix" className="bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 flex flex-col items-center text-center outline-none">
          {loadingPix ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-6" />
              <p className="text-stone-500 font-bold tracking-tight">Gerando PIX seguro...</p>
            </div>
          ) : qrCodeBase64 ? (
            <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-500 delay-150">
              <div className="p-3 bg-white rounded-2xl border-[6px] border-stone-100 dark:border-stone-800 shadow-xl mb-6">
                <img src={`data:image/jpeg;base64,${qrCodeBase64}`} alt="QR Code PIX" className="w-60 h-60 rounded-xl" />
              </div>
              
              <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">PIX COPIA E COLA</p>
              <div className="w-full flex items-center bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden mb-6">
                <input 
                  type="text" 
                  readOnly 
                  value={qrCode || ""} 
                  className="w-full bg-transparent p-4 text-sm text-stone-600 dark:text-stone-300 outline-none font-mono truncate"
                />
                <button 
                  onClick={handleCopy}
                  className="p-4 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 transition text-stone-600 dark:text-stone-300 border-l border-stone-200 dark:border-stone-700 h-full flex items-center justify-center"
                >
                  {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              
              <button 
                onClick={handleCopy}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-xl transition shadow-lg shadow-indigo-200 dark:shadow-none flex justify-center items-center gap-2"
              >
                {copied ? <Check className="w-5 h-5" /> : null}
                {copied ? "QR Code Copiado!" : "Copiar Código PIX"}
              </button>

              <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-start gap-3 w-full text-left">
                <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed font-medium">
                  Assim que o pagamento for concluído no seu banco, o sistema liberará seu acesso automaticamente. Não é necessário enviar comprovante.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center">
              <p className="text-stone-500 mb-4">Aconteceu um problema de conexão com o banco.</p>
              <button onClick={handleGeneratePix} className="text-indigo-600 font-bold bg-indigo-50 px-6 py-2 rounded-full hover:bg-indigo-100 transition">Tentar novamente</button>
            </div>
          )}
        </TabsContent>

        {/* ABA CARTÃO DE CRÉDITO */}
        <TabsContent value="card" className="bg-white dark:bg-stone-900 p-2 sm:p-6 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 outline-none min-h-[400px]">
           {sdkInitialized && (
             <div className="animate-in fade-in duration-700 relative z-10">
               <MPPayment
                 initialization={initialization}
                 customization={customization}
                 onSubmit={onSubmit}
               />
             </div>
           )}
        </TabsContent>
      </Tabs>

      {/* Trust Badges & FAQ */}
      <div className="mt-6 w-full max-w-md mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
           <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-3 flex items-center gap-2">
             <ShieldCheck className="w-5 h-5 text-emerald-500" />
             Pagamento 100% Seguro
           </h3>
           <p className="text-sm text-stone-500 dark:text-stone-400 mb-5 leading-relaxed">
             Suas informações de pagamento são processadas diretamente pelo Mercado Pago. Nós não armazenamos os dados do seu cartão.
           </p>

           <div className="border-t border-stone-100 dark:border-stone-800 pt-5 mt-2">
              <h4 className="font-bold text-sm text-stone-700 dark:text-stone-200 mb-3 uppercase tracking-wider">Dúvidas Frequentes</h4>
              <div className="space-y-4">
                 <details className="group cursor-pointer">
                    <summary className="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-indigo-600 transition-colors list-none flex items-center justify-between">
                       Quando meu acesso é liberado?
                       <ChevronDown className="w-4 h-4 text-stone-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 pl-3 border-l-2 border-indigo-200 dark:border-indigo-500/30 leading-relaxed">
                       A liberação é imediata. Assim que o pagamento via PIX ou Cartão for aprovado pelo seu banco, seu acesso entra em vigor automaticamente.
                    </p>
                 </details>
                 <details className="group cursor-pointer">
                    <summary className="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-indigo-600 transition-colors list-none flex items-center justify-between">
                       Já possuo um plano, posso renovar?
                       <ChevronDown className="w-4 h-4 text-stone-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 pl-3 border-l-2 border-indigo-200 dark:border-indigo-500/30 leading-relaxed">
                       Sim! Se você comprar novamente enquanto tiver um plano ativo, os novos dias serão somados ao tempo restante que você já tem na plataforma. Nada é perdido!
                    </p>
                 </details>
              </div>
           </div>
        </div>
      </div>
    </>
  )
}
