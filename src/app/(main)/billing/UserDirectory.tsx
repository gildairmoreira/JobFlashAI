"use client";

import React from "react";
import { Users, DollarSign, Zap, UserX } from "lucide-react";
import UserTableRow from "./UserTableRow";

interface UserDirectoryProps {
  stats: {
    totalUsers: number;
    totalRevenue: number;
    pendingPixCount: number;
    frozenOrBanned: number;
  };
  recentUsers: any[];
  adminRole: string;
}

export default function UserDirectory({ stats, recentUsers, adminRole }: UserDirectoryProps) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tighter">Diretório de Usuários</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-2 text-lg">Gerenciamento global de acessos e assinaturas.</p>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <QuickStat 
            label="Total Usuários" 
            value={stats.totalUsers} 
            icon={<Users className="w-4 h-4" />} 
            color="text-stone-500"
        />
        {adminRole === "MASTER_ADMIN" && (
            <>
                <QuickStat 
                    label="Receita Real" 
                    value={`R$ ${stats.totalRevenue.toFixed(2).replace('.', ',')}`} 
                    icon={<DollarSign className="w-4 h-4" />} 
                    color="text-indigo-500"
                    bg="bg-indigo-500/5"
                />
                <QuickStat 
                    label="PIX Pendentes" 
                    value={stats.pendingPixCount} 
                    icon={<Zap className="w-4 h-4" />} 
                    color="text-emerald-500"
                />
            </>
        )}
        <QuickStat 
            label="Bloqueados" 
            value={stats.frozenOrBanned} 
            icon={<UserX className="w-4 h-4" />} 
            color="text-red-500"
        />
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-stone-900 shadow-2xl rounded-[2.5rem] border border-stone-100 dark:border-stone-800 overflow-hidden">
        <div className="p-8 border-b border-stone-50 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
          <h2 className="text-xl font-bold dark:text-white">Lista de Usuários Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-stone-900 text-stone-400 border-b border-stone-100 dark:border-stone-800">
                <th className="px-8 py-5 uppercase text-[10px] font-black tracking-widest text-stone-400">Usuário</th>
                <th className="px-8 py-5 uppercase text-[10px] font-black tracking-widest text-stone-400">Status / Role</th>
                <th className="px-8 py-5 uppercase text-[10px] font-black tracking-widest text-stone-400">Plano</th>
                <th className="px-8 py-5 uppercase text-[10px] font-black tracking-widest text-stone-400 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 dark:divide-stone-800">
              {recentUsers.map((user) => (
                <UserTableRow key={user.userId} user={user} adminRole={adminRole} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function QuickStat({ label, value, icon, color, bg = "bg-white dark:bg-stone-900" }: { label: string, value: string | number, icon: React.ReactNode, color: string, bg?: string }) {
    return (
        <div className={`${bg} p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm transition-all hover:border-indigo-500/30`}>
            <div className={`flex items-center gap-2 mb-4 ${color}`}>
                {icon}
                <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
            </div>
            <p className="text-4xl font-black text-stone-900 dark:text-white tracking-tighter">{value}</p>
        </div>
    );
}
