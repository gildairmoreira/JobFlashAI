import { getAdminDashboardData, promoteToAdmin, updateUserStatus, updateUserPlan } from "./actions";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { LayoutDashboard, Users, UserX, Activity, DollarSign, Settings, Crown, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const { stats, recentUsers, adminRole } = await getAdminDashboardData();

    async function handleBan(userId: string) {
        "use server";
        await updateUserStatus(userId, "BANNED");
        revalidatePath("/billing");
    }

    async function handleFreeze(userId: string) {
        "use server";
        await updateUserStatus(userId, "FROZEN");
        revalidatePath("/billing");
    }

    async function handleActive(userId: string) {
        "use server";
        await updateUserStatus(userId, "ACTIVE");
        revalidatePath("/billing");
    }

    async function handlePromote(userId: string) {
        "use server";
        try {
            await promoteToAdmin(userId);
            revalidatePath("/billing");
        } catch (err) {
            console.error(err);
        }
    }

    async function handlePlanChange(formData: FormData) {
        "use server";
        const userId = formData.get("userId") as string;
        const newPlan = formData.get("planType") as "FREE" | "PRO" | "LIFETIME";
        if (userId && newPlan) {
            await updateUserPlan(userId, newPlan);
            revalidatePath("/billing");
        }
    }

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

                {/* KPI Cards (Cards Minimalistas SaaS) */}
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
                                        <span className="text-3xl font-black text-purple-600 block">{stats.activeLifetimePaid}</span>
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
                                    <tr key={user.userId} className="hover:bg-stone-50/80 transition-colors">
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex items-center gap-3">
                                                {user.imageUrl ? (
                                                    <Image src={user.imageUrl} alt="Avatar" width={40} height={40} className="rounded-full shadow-sm" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-500">
                                                        {user.firstName?.charAt(0) || "U"}
                                                    </div>
                                                )}
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-stone-900">{user.firstName} {user.lastName}</p>
                                                        {user.isOnline && (
                                                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-green-100 border border-green-200 text-green-700 text-[9px] font-black uppercase tracking-wider relative overflow-hidden">
                                                                <span className="flex h-1.5 w-1.5 relative">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500 line-clamp-1"></span>
                                                                </span>
                                                                ACTIVE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-stone-500 text-xs">{user.email}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-stone-400 text-[10px] font-mono" title={user.userId}>ID: {user.userId.slice(0, 8)}...</p>
                                                        {!user.isOnline && (
                                                            <>
                                                                <span className="text-stone-300 text-[10px]">|</span>
                                                                <p className="text-stone-400 text-[10px]">
                                                                    {user.lastActiveAt ? `Visto há ${Math.floor((Date.now() - user.lastActiveAt) / 60000)} min` : 'Nunca acessou'}
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wide
                                                    ${user.role === 'MASTER_ADMIN' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                                                        user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-stone-100 text-stone-600 border border-stone-200'}`}>
                                                    {user.role}
                                                </span>
                                                <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wide flex items-center gap-1
                                                    ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                        user.status === 'FROZEN' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                                    {user.status === 'ACTIVE' ? '🟢' : user.status === 'FROZEN' ? '❄️' : '⛔'} {user.status}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <form action={handlePlanChange} className="flex flex-col xl:flex-row items-start xl:items-center gap-2">
                                                <input type="hidden" name="userId" value={user.userId} />
                                                <div className="flex bg-stone-50 rounded-lg p-0.5 border border-stone-200 shadow-sm w-[130px]">
                                                    <select
                                                        name="planType"
                                                        defaultValue={user.planType}
                                                        className="bg-transparent border-none text-xs font-bold text-stone-700 focus:ring-0 cursor-pointer outline-none w-full py-1.5 px-2"
                                                    >
                                                        <option value="FREE">📦 FREE</option>
                                                        <option value="PRO">⚡ PRO</option>
                                                        <option value="LIFETIME">💎 MENSAL</option>
                                                    </select>
                                                </div>
                                                <Button type="submit" size="sm" variant="ghost" className="h-8 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold shrink-0 border border-stone-200">
                                                    Salvar
                                                </Button>
                                            </form>
                                        </td>

                                        <td className="px-6 py-4 text-right flex justify-end">
                                            <div className="flex flex-col gap-2 items-end">
                                                {!(user.role === 'MASTER_ADMIN' && adminRole !== 'MASTER_ADMIN') && (
                                                    <div className="flex bg-stone-100/80 rounded-lg p-1 border border-stone-200 shadow-sm max-w-max">
                                                        <form action={handleActive.bind(null, user.userId)}>
                                                            <button
                                                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${user.status === 'ACTIVE' ? 'bg-white shadow text-slate-800' : 'text-stone-500 hover:text-stone-700'}`}
                                                                title="Manter ativo"
                                                            >
                                                                Ativo
                                                            </button>
                                                        </form>
                                                        <form action={handleFreeze.bind(null, user.userId)}>
                                                            <button
                                                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${user.status === 'FROZEN' ? 'bg-orange-100 shadow-sm text-orange-700' : 'text-stone-500 hover:text-stone-700'}`}
                                                                title="Congelar e Restringir"
                                                            >
                                                                Congelar
                                                            </button>
                                                        </form>
                                                        <form action={handleBan.bind(null, user.userId)}>
                                                            <button
                                                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${user.status === 'BANNED' ? 'bg-red-500 shadow-sm text-white' : 'text-stone-500 hover:text-stone-700'}`}
                                                                title="Banir"
                                                            >
                                                                Banir
                                                            </button>
                                                        </form>
                                                    </div>
                                                )}

                                                {adminRole === "MASTER_ADMIN" && user.role === "USER" && (
                                                    <form action={handlePromote.bind(null, user.userId)}>
                                                        <button type="submit" className="text-[10px] text-stone-400 hover:text-stone-800 underline uppercase tracking-widest font-bold px-1 transition-colors">Promover Admin</button>
                                                    </form>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main >
        </div >
    );
}
