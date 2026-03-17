"use client";

import React, { useState } from "react";
import { Users, BarChart3, Settings as SettingsIcon, LayoutDashboard } from "lucide-react";

interface AdminPanelTabsProps {
  userDirectory: React.ReactNode;
  revenueReport: React.ReactNode;
  settingsPanel: React.ReactNode;
  stats: any;
  adminRole: string;
}

export default function AdminPanelTabs({
  userDirectory,
  revenueReport,
  settingsPanel,
  stats,
  adminRole
}: AdminPanelTabsProps) {
  const [activeTab, setActiveTab] = useState<"users" | "revenue" | "settings">("users");

  return (
    <div className="flex min-h-[calc(100vh-76px)] bg-white dark:bg-stone-950 transition-colors duration-500">
      <aside className="w-72 bg-stone-50 dark:bg-stone-950 text-stone-600 dark:text-stone-300 hidden flex-col md:flex border-r border-stone-200 dark:border-stone-800/50 shrink-0 sticky top-[76px] h-[calc(100vh-76px)] overflow-y-auto">
        <div className="p-8">
                <div className="flex items-center gap-3 mb-10 px-2 text-stone-900 dark:text-white">
            <div className="p-2 bg-indigo-500 rounded-xl">
                <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-black tracking-tighter">
                Control Desk
            </h2>
          </div>
          
          <nav className="space-y-2">
            <TabButton 
                isActive={activeTab === "users"} 
                onClick={() => setActiveTab("users")}
                icon={<Users className="w-4 h-4" />}
                label="Diretório de Usuários"
            />
            
            {adminRole === "MASTER_ADMIN" && (
                <TabButton 
                    isActive={activeTab === "revenue"} 
                    onClick={() => setActiveTab("revenue")}
                    icon={<BarChart3 className="w-4 h-4" />}
                    label="Relatório de Receita"
                    variant="emerald"
                />
            )}
            
            <TabButton 
                isActive={activeTab === "settings"} 
                onClick={() => setActiveTab("settings")}
                icon={<SettingsIcon className="w-4 h-4" />}
                label="Configurações Gerais"
            />
          </nav>

          <div className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-800/50">
            <div className="px-4 py-4 bg-stone-100 dark:bg-stone-900/50 rounded-3xl border border-stone-200 dark:border-stone-800/30">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500 mb-2">Sua Permissão</p>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${adminRole === "MASTER_ADMIN" ? "bg-emerald-500" : "bg-indigo-500"}`} />
                    <span className="text-sm font-bold text-stone-900 dark:text-white capitalize">{adminRole.replace('_', ' ')}</span>
                </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Área de Conteúdo */}
      <main className="flex-1 px-4 md:px-12 py-10 w-full animate-in fade-in duration-700">
        {activeTab === "users" && userDirectory}
        {activeTab === "revenue" && adminRole === "MASTER_ADMIN" && revenueReport}
        {activeTab === "settings" && settingsPanel}
      </main>
    </div>
  );
}

function TabButton({ 
    isActive, 
    onClick, 
    icon, 
    label, 
    variant = "indigo" 
}: { 
    isActive: boolean, 
    onClick: () => void, 
    icon: React.ReactNode, 
    label: string,
    variant?: "indigo" | "emerald"
}) {
    const activeStyles = {
        indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.05)]",
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
    };

    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 border font-bold text-sm ${
                isActive 
                ? `${activeStyles[variant]} border-opacity-100` 
                : "text-stone-500 dark:text-stone-500 border-transparent hover:text-stone-900 dark:hover:text-stone-300 hover:bg-white dark:hover:bg-stone-900/50"
            }`}
        >
            <div className={`transition-transform duration-300 ${isActive ? "scale-110" : "scale-100"}`}>
                {icon}
            </div>
            {label}
        </button>
    );
}
