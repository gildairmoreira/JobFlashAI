"use client";

import React from "react";
import { 
  Settings, 
  ShieldAlert, 
  Globe, 
  Database, 
  Save,
  Info
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Switch } from "@/components/ui/switch";
import { updateGlobalSettings } from "./actions";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SettingsPanelProps {
  settings: {
    maintenanceMode: boolean;
    maintenanceMessage: string | null;
    proPrice: number;
    monthlyPrice: number;
  };
  adminRole: string;
}

export default function SettingsPanel({ settings, adminRole }: SettingsPanelProps) {
  const isMaster = adminRole === "MASTER_ADMIN";
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [mMode, setMMode] = React.useState(settings.maintenanceMode);
  const [mMessage, setMMessage] = React.useState(settings.maintenanceMessage || "");
  const [proPrice, setProPrice] = React.useState(settings.proPrice.toString());
  const [monPrice, setMonPrice] = React.useState(settings.monthlyPrice.toString());

  async function handleSave() {
    startTransition(async () => {
      try {
        await updateGlobalSettings({
            maintenanceMode: mMode,
            maintenanceMessage: mMessage,
            proPrice: parseFloat(proPrice),
            monthlyPrice: parseFloat(monPrice)
        });
        toast({
          title: "Configurações salvas",
          description: "O sistema foi atualizado com sucesso.",
        });
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: "Não foi possível atualizar as configurações.",
        });
      }
    });
  }
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">Configurações Gerais</h2>
        <p className="text-stone-500 dark:text-stone-400 text-sm">Gerencie o comportamento global da plataforma JobFlashAI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Manutenção e Alertas */}
          <Card className="border-stone-200 dark:border-stone-800 dark:bg-stone-900/50 shadow-sm overflow-hidden rounded-3xl">
            <CardHeader className="bg-stone-50/50 dark:bg-stone-800/30">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-lg">Estado do Sistema</CardTitle>
              </div>
              <CardDescription>Controle o acesso público à plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                <div>
                  <p className="font-bold text-amber-900 dark:text-amber-400 text-sm">Modo de Manutenção</p>
                  <p className="text-xs text-amber-700/70 dark:text-amber-400/60">Bloqueia o acesso de todos os usuários (exceto admins).</p>
                </div>
                <Switch 
                    checked={mMode}
                    onCheckedChange={setMMode}
                    disabled={isPending}
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold dark:text-stone-300">Mensagem de Alerta Global</label>
                <textarea 
                  value={mMessage}
                  onChange={(e) => setMMessage(e.target.value)}
                  disabled={isPending}
                  className="w-full min-h-[100px] p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder="Ex: Teremos uma atualização programada hoje às 22h..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Rules - Restricted to Master Admin for editing */}
          <Card className={cn(
            "border-stone-200 dark:border-stone-800 shadow-sm rounded-3xl transition-opacity",
            !isMaster && "opacity-80 bg-stone-50/50 dark:bg-stone-900/30"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-500" />
                  <CardTitle className="text-lg">Regras de Negócio</CardTitle>
                </div>
                <CardDescription>Ajuste limites e parâmetros de faturamento.</CardDescription>
              </div>
              {!isMaster && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 dark:bg-stone-800 rounded-full border border-stone-200 dark:border-stone-700">
                  <ShieldAlert className="w-3.5 h-3.5 text-stone-400" />
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Apenas Visualização</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Preço Plano Pro (Weekly)</p>
                  <input 
                    type="number" 
                    value={proPrice}
                    onChange={(e) => setProPrice(e.target.value)}
                    disabled={isPending || !isMaster}
                    className="w-full p-3 bg-stone-50 dark:bg-stone-800 border-none rounded-xl text-sm font-bold disabled:cursor-not-allowed" 
                  />
                </div>
                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Preço Plano Monthly</p>
                    <input 
                        type="number" 
                        value={monPrice}
                        onChange={(e) => setMonPrice(e.target.value)}
                        disabled={isPending || !isMaster}
                        className="w-full p-3 bg-stone-50 dark:bg-stone-800 border-none rounded-xl text-sm font-bold disabled:cursor-not-allowed" 
                    />
                </div>
              </div>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 flex gap-3">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed font-medium">
                  {isMaster 
                    ? "Estes preços alimentam o Checkout Transparente do Mercado Pago nativo da plataforma. Atualize-os a qualquer momento."
                    : "Você não tem permissão para alterar os preços. Entre em contato com o administrador master para ajustes financeiros."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-stone-200 dark:border-stone-800 dark:bg-stone-900/50 shadow-sm rounded-3xl sticky top-8">
            <CardHeader>
              <CardTitle className="text-md">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button 
                    onClick={handleSave}
                    disabled={isPending}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 flex items-center gap-2"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Alterações
                </Button>
                <Button variant="outline" className="w-full border-stone-200 dark:border-stone-800 rounded-2xl h-12">
                    Descartar
                </Button>
                <div className="pt-4 border-t border-stone-100 dark:border-stone-800 mt-4 space-y-4">
                    <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500">
                        <Globe className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Deploy: Netlify Production</span>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
