"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateUserPlan, updateUserStatus, promoteToAdmin, demoteFromAdmin } from "./actions";

interface UserTableRowProps {
  user: any;
  adminRole: string;
}

export default function UserTableRow({ user, adminRole }: UserTableRowProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState(user.planType);
  const [currentStatus, setCurrentStatus] = useState(user.status);

  async function handlePlanChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPlan = formData.get("planType") as any;

    startTransition(async () => {
      try {
        await updateUserPlan(user.userId, newPlan);
        setCurrentPlan(newPlan);
        toast({
          title: "Plano atualizado",
          description: `O plano de ${user.firstName} foi alterado para ${newPlan}.`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar plano",
          description: "Ocorreu um erro ao tentar alterar o plano.",
        });
      }
    });
  }

  async function handleStatusChange(status: any) {
    startTransition(async () => {
      try {
        await updateUserStatus(user.userId, status);
        setCurrentStatus(status);
        toast({
          title: "Status atualizado",
          description: `O usuário agora está ${status}.`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar status",
          description: "Não foi possível alterar o status do usuário.",
        });
      }
    });
  }

  async function handlePromote() {
    startTransition(async () => {
      try {
        await promoteToAdmin(user.userId);
        toast({
          title: "Usuário promovido",
          description: `${user.firstName} agora é um administrador.`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao promover",
          description: "Apenas MASTER_ADMIN pode promover outros administradores.",
        });
      }
    });
  }

  async function handleDemote() {
    startTransition(async () => {
      try {
        await demoteFromAdmin(user.userId);
        toast({
          title: "Admin removido",
          description: `O cargo de administrador foi retirado de ${user.firstName}.`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao remover admin",
          description: "Apenas MASTER_ADMIN pode remover outros administradores.",
        });
      }
    });
  }

  return (
    <tr className="hover:bg-stone-50/80 transition-colors">
      <td className="px-6 py-4 text-sm">
        <div className="flex items-center gap-3">
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt="Avatar"
              width={40}
              height={40}
              className="rounded-full shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-500">
              {user.firstName?.charAt(0) || "U"}
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <p className="font-bold text-stone-900">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <p className="text-stone-500 text-xs">{user.email}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <p
                className="text-stone-400 text-[10px] font-mono"
                title={user.userId}
              >
                ID: {user.userId.slice(0, 8)}...
              </p>
              <span className="text-stone-300 text-[10px]">|</span>
              <p className="text-stone-400 text-[10px]">
                {user.isOnline ? (
                    <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
                         <span className="flex h-1.5 w-1.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        Online Agora
                    </span>
                ) : user.lastActiveAt ? (
                    <span className="text-stone-400">Visto há {formatTimeAgo(user.lastActiveAt)}</span>
                ) : (
                    <span className="text-stone-400 italic">Nunca acessou</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-col gap-2 items-start">
          <span
            className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wide
                ${
                  user.role === "MASTER_ADMIN"
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                    : user.role === "ADMIN"
                      ? "bg-amber-100 text-amber-700 border border-amber-200"
                      : "bg-stone-100 text-stone-600 border border-stone-200"
                }`}
          >
            {user.role}
          </span>
          {currentStatus !== "ACTIVE" && (
            <span
                className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wide flex items-center gap-1
                    ${
                      currentStatus === "FROZEN"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                    }`}
            >
                {currentStatus === "FROZEN" ? "❄️" : "⛔"}{" "}
                {currentStatus}
            </span>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <form
          onSubmit={handlePlanChange}
          className="flex flex-col xl:flex-row items-start xl:items-center gap-2"
        >
          <div className="flex bg-stone-50 rounded-lg p-0.5 border border-stone-200 shadow-sm w-[130px]">
            <select
              name="planType"
              value={currentPlan}
              onChange={(e) => setCurrentPlan(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-stone-700 focus:ring-0 cursor-pointer outline-none w-full py-1.5 px-2"
              disabled={isPending}
            >
              <option value="FREE">📦 FREE</option>
              <option value="PRO">⚡ PRO</option>
              <option value="MONTHLY">💎 MENSAL</option>
            </select>
          </div>
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            disabled={isPending}
            className="h-8 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold shrink-0 border border-stone-200"
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Salvar"}
          </Button>
        </form>
      </td>

      <td className="px-6 py-4 text-right flex justify-end">
        <div className="flex flex-col gap-2 items-end">
          {!(user.role === "MASTER_ADMIN" && adminRole !== "MASTER_ADMIN") && (
            <div className="flex bg-stone-100/80 rounded-lg p-1 border border-stone-200 shadow-sm max-w-max">
              <button
                onClick={() => handleStatusChange("ACTIVE")}
                disabled={isPending}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  currentStatus === "ACTIVE"
                    ? "bg-white shadow text-slate-800"
                    : "text-stone-500 hover:text-stone-700"
                }`}
                title="Manter ativo"
              >
                Ativo
              </button>
              <button
                onClick={() => handleStatusChange("FROZEN")}
                disabled={isPending}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  currentStatus === "FROZEN"
                    ? "bg-orange-100 shadow-sm text-orange-700"
                    : "text-stone-500 hover:text-stone-700"
                }`}
                title="Congelar e Restringir"
              >
                Congelar
              </button>
              <button
                onClick={() => handleStatusChange("BANNED")}
                disabled={isPending}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  currentStatus === "BANNED"
                    ? "bg-red-500 shadow-sm text-white"
                    : "text-stone-500 hover:text-stone-700"
                }`}
                title="Banir"
              >
                Banir
              </button>
            </div>
          )}

          {adminRole === "MASTER_ADMIN" && user.role === "USER" && (
            <button
              onClick={handlePromote}
              disabled={isPending}
              className="text-[10px] text-stone-400 hover:text-stone-800 underline uppercase tracking-widest font-bold px-1 transition-colors"
            >
              Promover Admin
            </button>
          )}

          {adminRole === "MASTER_ADMIN" && user.role === "ADMIN" && (
            <button
              onClick={handleDemote}
              disabled={isPending}
              className="text-[10px] text-red-400 hover:text-red-600 underline uppercase tracking-widest font-bold px-1 transition-colors"
            >
              Remover Admin
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
function formatTimeAgo(timestamp: number) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours}h ${minutes % 60}min`;
    return `${days}d ${hours % 24}h`;
}
