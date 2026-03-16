import { getAdminDashboardData } from "./actions";
import { LayoutDashboard, Users, UserX, Activity, DollarSign, Settings, Lock } from "lucide-react";
import UserTableRow from "./UserTableRow";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const { stats, recentUsers, adminRole } = await getAdminDashboardData();

    return (
        <div className="flex min-h-[calc(100vh-76px)] bg-[#fdfdfd]">
            {/* Sidebar Lateral (SaaS Moderno) */}
            <aside className="w-64 bg-stone-950 text-stone-300 hidden flex-col md:flex border-r border-stone-800 shrink-0">
                <div className="p-6">
                    <h2 className="text-xl font-extrabold tracking-tight text-white mb-8 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-indigo-400" /> Control Desk
                    </h2>
                    <nav className="space-y-1.5 font-medium text-sm">
                        <a href="#dashboard" className="flex items-center gap-3 px-4 py-2.5 bg-stone-800/80 text-white rounded-lg shadow-sm border border-stone-700/50">
                            <Users className="w-4 h-4 text-indigo-400" /> Diretório de Usuários
                        </a>
                        {adminRole === "MASTER_ADMIN" && (
                            <a href="#receita" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:text-white hover:bg-stone-800/50 transition-colors">
                                <DollarSign className="w-4 h-4" /> Relatório de Receita
                            </a>
                        )}
                        <a href="#config" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:text-white hover:bg-stone-800/50 transition-colors">
                            <Settings className="w-4 h-4" /> Configurações Gerais
                        </a>
                    </nav>
                </div>
            </aside>

            {/* Conteúdo Principal */}
            <main className="flex-1 px-8 py-10 overflow-auto w-full">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold text-stone-900 tracking-tight flex items-center gap-3">
                            <LayoutDashboard className="w-8 h-8 text-stone-400" />
                            Visão Geral
                        </h1>
                        <p className="text-stone-500 mt-2 text-lg">Métricas oficiais e controle global de assinaturas.</p>
                    </div>
                </header>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12" id="receita">
                    <div className="p-6 bg-white shadow-sm rounded-2xl border border-stone-200">
                        <div className="flex items-center gap-2 mb-4 text-stone-500">
                            <Users className="w-4 h-4" />
                            <p className="text-sm font-semibold uppercase tracking-wider">Total Registros (BD)</p>
                        </div>
                        <p className="text-4xl font-black text-stone-900">{stats.totalUsers}</p>
                    </div>

                    {adminRole === "MASTER_ADMIN" && (
                        <>
                            <div className="p-6 bg-gradient-to-b from-white to-green-50 shadow-sm rounded-2xl border border-green-200">
                                <div className="flex items-center gap-2 mb-4 text-green-600">
                                    <DollarSign className="w-4 h-4" />
                                    <p className="text-sm font-semibold uppercase tracking-wider">Receita (Via Cakto)</p>
                                </div>
                                <p className="text-4xl font-black text-green-700">
                                    R$ {stats.estimatedRevenue.toFixed(2).replace('.', ',')}
                                </p>
                                <p className="text-xs text-green-600/70 mt-2 font-medium">Somente usuários processados nativamente</p>
                            </div>

                            <div className="p-6 bg-white shadow-sm rounded-2xl border border-stone-200">
                                <div className="flex items-center gap-2 mb-4 text-blue-500">
                                    <Activity className="w-4 h-4" />
                                    <p className="text-sm font-semibold uppercase tracking-wider">Assinaturas Ativas</p>
                                </div>
                                <div className="flex gap-4 items-baseline mt-2">
                                    <div className="text-center">
                                        <span className="text-3xl font-black text-blue-600 block">{stats.activeProPaid}</span>
                                        <span className="text-xs font-bold text-stone-400 uppercase">SEMANAL</span>
                                    </div>
                                    <div className="w-[1px] h-8 bg-stone-200 mx-1"></div>
                                    <div className="text-center">
                                        <span className="text-3xl font-black text-purple-600 block">{stats.activeMonthlyPaid}</span>
                                        <span className="text-xs font-bold text-stone-400 uppercase">MENSAL</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="p-6 bg-white shadow-sm rounded-2xl border border-red-50">
                        <div className="flex items-center gap-2 mb-4 text-red-400">
                            <UserX className="w-4 h-4" />
                            <p className="text-sm font-semibold uppercase tracking-wider">Inativos / Banidos</p>
                        </div>
                        <p className="text-4xl font-black text-red-500">{stats.frozenOrBanned}</p>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-stone-100" id="dashboard">
                    <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-stone-800">Diretório de Usuários</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white text-stone-400 border-b border-stone-100">
                                    <th className="px-6 py-4 uppercase text-xs font-bold tracking-wider">Usuário</th>
                                    <th className="px-6 py-4 uppercase text-xs font-bold tracking-wider">Permissão & Status</th>
                                    <th className="px-6 py-4 uppercase text-xs font-bold tracking-wider">Plano Atual</th>
                                    <th className="px-6 py-4 uppercase text-xs font-bold tracking-wider text-right">Controles Radicais</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {recentUsers.map(user => (
                                    <UserTableRow key={user.userId} user={user} adminRole={adminRole} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main >
        </div >
    );
}
