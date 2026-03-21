"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts";
import { 
  TrendingUp, 
  Zap,
  Target,
  ArrowUpRight,
} from "lucide-react";

interface RevenueReportProps {
  stats: {
    totalRevenue: number;
    pendingPixCount: number;
    conversionRate: number;
    totalUsers: number;
  };
  revenueHistory: any[];
  funnelData: any[];
  lastPaidSales: any[];
}

const COLORS = ['#6366f1', '#f59e0b', '#10b981'];

export default function RevenueReport({
  stats,
  revenueHistory,
  funnelData,
  lastPaidSales
}: RevenueReportProps) {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header com Glassmorphism sutil */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-stone-900/50 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">Relatório Financeiro</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm">Dados consolidados de vendas e conversão do funil.</p>
        </div>
        <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live Analytics</span>
        </div>
      </div>

      {/* KPI Cloud - Design Moderno */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Receita Líquida" 
          value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
          trend="+R$ 0,00 hoje"
          gradient="from-emerald-500/10 to-transparent"
        />
        <MetricCard 
          label="PIX Gerados" 
          value={stats.pendingPixCount}
          icon={<Zap className="w-4 h-4 text-amber-500" />}
          trend="Aguardando Pgto"
          gradient="from-amber-500/10 to-transparent"
        />
        <MetricCard 
          label="Taxa de Conversão" 
          value={`${stats.conversionRate.toFixed(1)}%`}
          icon={<Target className="w-4 h-4 text-indigo-500" />}
          trend="Média de funil"
          gradient="from-indigo-500/10 to-transparent"
        />
        <MetricCard 
          label="LTV Estimado" 
          value={`R$ ${(stats.totalRevenue / (stats.totalUsers || 1)).toFixed(2)}`}
          icon={<ArrowUpRight className="w-4 h-4 text-stone-400" />}
          trend="Por usuário"
          gradient="from-stone-500/10 to-transparent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 shadow-xl border-stone-200 dark:border-stone-800 dark:bg-stone-900 p-2 rounded-3xl overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-bold">Crescimento de Receita</CardTitle>
            <CardDescription>Vendas aprovadas nos últimos 30 dias.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" strokeOpacity={0.1} />
                <XAxis 
                    dataKey="date" 
                    stroke="#888" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10} 
                />
                <YAxis 
                    stroke="#888" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(v) => `R$${v}`} 
                />
                <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255,255,255,0.9)' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#revenueGrad)" 
                    animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Funnel - Visualização de Funil Elite */}
        <Card className="shadow-xl border-stone-200 dark:border-stone-800 dark:bg-stone-900 p-2 rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Funil de Conversão</CardTitle>
            <CardDescription>Desempenho por etapa.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={funnelData} margin={{ left: 10, right: 40 }}>
                <XAxis type="number" hide />
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#888" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    width={90}
                />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                  {funnelData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Vendas - Modernizada */}
      <div className="bg-white dark:bg-stone-900 shadow-2xl rounded-[2.5rem] border border-stone-100 dark:border-stone-800 overflow-hidden">
        <div className="p-8 border-b border-stone-50 dark:border-stone-800 flex items-center justify-between">
            <div>
                <h3 className="text-xl font-bold dark:text-white">Transações Recentes</h3>
                <p className="text-stone-400 text-sm">Fluxo de caixa em tempo real.</p>
            </div>
            <button className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 px-4 py-2 rounded-full hover:bg-indigo-100 transition">Ver Tudo</button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-stone-50/50 dark:bg-stone-800/20 text-stone-400 text-[10px] uppercase tracking-widest font-black">
                        <th className="px-8 py-5">Identificação</th>
                        <th className="px-8 py-5">Valor & Método</th>
                        <th className="px-8 py-5">Data Transação</th>
                        <th className="px-8 py-5 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-50 dark:divide-stone-800">
                    {lastPaidSales.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-8 py-12 text-center text-stone-300 dark:text-stone-600 font-medium italic">Nenhuma venda aprovada nas últimas horas.</td>
                        </tr>
                    ) : (
                        lastPaidSales.map((sale) => (
                            <tr key={sale.id} className="group hover:bg-stone-50 dark:hover:bg-indigo-500/5 transition-all duration-300">
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-stone-900 dark:text-stone-100">{sale.customerName || "Cliente Desconhecido"}</span>
                                        <span className="text-xs text-stone-400">{sale.customerEmail}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="font-black text-indigo-600 dark:text-indigo-400 tracking-tighter text-lg">
                                            R$ {sale.amount.toFixed(2)}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase text-stone-400">{sale.paymentMethod || "Cartão"}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-stone-500 dark:text-stone-400 text-sm">
                                    {new Date(sale.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    {sale.status === "REFUNDED" ? (
                                        <div className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                            Estornado
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            Aprovado
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, trend, gradient }: { label: string, value: string | number, icon: React.ReactNode, trend: string, gradient: string }) {
    return (
        <div className={`relative overflow-hidden group bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">{label}</span>
                    <div className="p-2 bg-stone-50 dark:bg-stone-800 rounded-xl group-hover:scale-110 transition-transform">
                        {icon}
                    </div>
                </div>
                <div className="text-3xl font-black text-stone-900 dark:text-white tracking-tighter mb-1 select-none">
                    {value}
                </div>
                <div className="text-[10px] font-medium text-stone-400 flex items-center gap-1">
                    {trend}
                </div>
            </div>
        </div>
    )
}
