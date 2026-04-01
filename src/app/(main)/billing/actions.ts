"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Utility to verify if current user is an admin
export async function verifyAdminAccess() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user) {
        redirect("/login");
    }

    const userId = session.user.id;
    const email = session.user.email;

    const userSub = await prisma.userSubscription.findUnique({
        where: { userId },
    }) as any;

    const isMasterAdmin = email === "gildair457@gmail.com";
    const isAdmin = userSub?.role === "ADMIN" || userSub?.role === "MASTER_ADMIN" || isMasterAdmin;

    if (!isAdmin) {
        redirect("/resumes");
    }

    // Ensure MASTER_ADMIN is set if he matches email
    if (isMasterAdmin && userSub?.role !== "MASTER_ADMIN") {
        await (prisma.userSubscription as any).upsert({
            where: { userId },
            create: { userId, role: "MASTER_ADMIN" },
            update: { role: "MASTER_ADMIN" },
        });
    }

    return { userId, role: isMasterAdmin ? "MASTER_ADMIN" : userSub?.role };
}

// Fetch general dashboard data
export async function getAdminDashboardData() {
    const adminData = await verifyAdminAccess();

    // Basic stats
    // @ts-ignore
    const totalUsersDb = await prisma.user.count();

    // 1. Fetch Real Transactions (Mercado Pago based)
    const allTransactions = await (prisma as any).transaction.findMany();
    const paidTransactions = allTransactions.filter((t: any) => t.status === "PAID");
    const pendingTransactions = allTransactions.filter((t: any) => t.status === "PENDING");
    
    // Exact revenue from PAID transactions
    const totalRevenue = paidTransactions.reduce((acc: number, curr: any) => acc + curr.amount, 0);

    const [activeProPaid, activeMonthlyPaid, frozenOrBanned] = await prisma.$transaction([
        prisma.userSubscription.count({
            where: { planType: "PRO", status: "ACTIVE", caktoTransactionId: { not: null } }
        }),
        prisma.userSubscription.count({
            where: { planType: "MONTHLY", status: "ACTIVE", caktoTransactionId: { not: null } }
        }),
        prisma.userSubscription.count({ where: { status: { in: ["FROZEN", "BANNED"] } } })
    ]);

    // 2. Revenue History (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueByDay = await (prisma as any).transaction.findMany({
        where: {
            status: "PAID",
            createdAt: { gte: thirtyDaysAgo }
        },
        orderBy: { createdAt: "asc" }
    });

    const historyMap: Record<string, number> = {};
    revenueByDay.forEach((t: any) => {
        const dateStr = new Date(t.createdAt).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' });
        historyMap[dateStr] = (historyMap[dateStr] || 0) + t.amount;
    });

    const revenueHistory = Object.entries(historyMap).map(([date, revenue]) => ({
        date,
        revenue
    }));

    // 3. Funnel Data
    const funnelEvents = await (prisma as any).analyticEvent.groupBy({
        by: ['event'],
        _count: { id: true }
    });

    const getCount = (evt: string) => (funnelEvents as any[]).find((f: any) => f.event === evt)?._count.id || 0;

    const funnelData = [
        { name: "Visitas Checkout", value: getCount("initiate_checkout") },
        { name: "Pgtos Iniciados", value: getCount("pix_gerado") + getCount("boleto_gerado") + getCount("picpay_gerado") },
        { name: "Vendas Concluídas", value: paidTransactions.length }
    ];

    // Basic estimates
    const estimatedRevenue = (activeProPaid * 19.90) + (activeMonthlyPaid * 49.90);

    // Fetch latest 50 users from Database (Better Auth source of truth)
    // @ts-ignore
    const usersList = await prisma.user.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        include: {
            subscription: true,
            sessions: {
                take: 1,
                orderBy: { updatedAt: "desc" }
            }
        }
    });

    const recentUsers = usersList.map((userObj: any) => {
        const now = new Date();
        const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

        const lastActiveDate = userObj.sessions[0]?.updatedAt || userObj.updatedAt || userObj.createdAt;
        const isOnline = lastActiveDate > fifteenMinutesAgo;

        return {
            userId: userObj.id,
            planType: userObj.subscription?.planType || "FREE",
            role: userObj.subscription?.role || "USER",
            status: userObj.subscription?.status || "ACTIVE",
            createdAt: userObj.createdAt,
            lastActiveAt: lastActiveDate.getTime(),
            isOnline,
            email: userObj.email,
            firstName: userObj.name.split(" ")[0] || "",
            lastName: userObj.name.split(" ").slice(1).join(" ") || "",
            imageUrl: userObj.image || ""
        }
    });

    // 4. Last 10 Sales
    const lastPaidSales = await (prisma as any).transaction.findMany({
        where: { status: { in: ["PAID", "REFUNDED"] } },
        orderBy: { createdAt: "desc" },
        take: 10
    });

    return {
        adminRole: adminData.role,
        stats: {
            totalUsers: totalUsersDb,
            activeProPaid,
            activeMonthlyPaid,
            frozenOrBanned,
            estimatedRevenue,
            totalRevenue,
            pendingPixCount: pendingTransactions.length,
            conversionRate: (paidTransactions.length + pendingTransactions.length) > 0 
                ? (paidTransactions.length / (paidTransactions.length + pendingTransactions.length)) * 100 
                : 0
        },
        revenueHistory,
        funnelData,
        recentUsers,
        lastPaidSales,
    };
}

// Admin Actions
export async function updateUserStatus(targetUserId: string, status: "ACTIVE" | "FROZEN" | "BANNED") {
    const adminData = await verifyAdminAccess();

    const target = await prisma.userSubscription.findUnique({ where: { userId: targetUserId } });
    if (target?.role === "MASTER_ADMIN" && adminData.role !== "MASTER_ADMIN") {
        throw new Error("Admins cannot modify MASTER_ADMIN");
    }

    await (prisma.userSubscription as any).upsert({
        where: { userId: targetUserId },
        create: { userId: targetUserId, status },
        update: { status },
    });

    revalidatePath("/billing");
    return { success: true };
}

// Admin Action: Change User Plan
export async function updateUserPlan(targetUserId: string, newPlanType: "FREE" | "PRO" | "MONTHLY") {
    const adminData = await verifyAdminAccess();

    // Determine current expiration based on new plan
    let expirationDate: Date | null = null;
    if (newPlanType === "PRO") {
        expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
    } else if (newPlanType === "MONTHLY") {
        expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 31);
    }

    await (prisma.userSubscription as any).upsert({
        where: { userId: targetUserId },
        create: {
            userId: targetUserId,
            planType: newPlanType,
            currentPeriodEnd: expirationDate
        },
        update: {
            planType: newPlanType,
            currentPeriodEnd: expirationDate !== null ? expirationDate : null
        },
    });

    revalidatePath("/billing");
    return { success: true };
}

// Admin Action: Add Vaga-Fit Credits (by decrementing usage)
export async function addJobFitCredits(targetUserId: string, amountToAdd: number) {
    const adminData = await verifyAdminAccess();

    await (prisma as any).userUsage.upsert({
        where: { userId: targetUserId },
        create: {
            userId: targetUserId,
            jobFitUsesThisMonth: -amountToAdd,
        },
        update: {
            jobFitUsesThisMonth: {
                decrement: amountToAdd
            }
        }
    });

    revalidatePath("/billing");
    return { success: true };
}

// Promote user to ADMIN
export async function promoteToAdmin(targetUserId: string) {
    const adminData = await verifyAdminAccess();

    if (adminData.role !== "MASTER_ADMIN") {
        throw new Error("Only MASTER_ADMIN can promote other users to ADMIN");
    }

    await (prisma.userSubscription as any).upsert({
        where: { userId: targetUserId },
        create: { userId: targetUserId, role: "ADMIN" },
        update: { role: "ADMIN" },
    });

    revalidatePath("/billing");
    return { success: true };
}

// Demote user from ADMIN
export async function demoteFromAdmin(targetUserId: string) {
    const adminData = await verifyAdminAccess();

    if (adminData.role !== "MASTER_ADMIN") {
        throw new Error("Only MASTER_ADMIN can demote other users from ADMIN");
    }

    await (prisma.userSubscription as any).upsert({
        where: { userId: targetUserId },
        create: { userId: targetUserId, role: "USER" },
        update: { role: "USER" },
    });

    revalidatePath("/billing");
    return { success: true };
}

export async function deleteUser(targetUserId: string) {
    const adminData = await verifyAdminAccess();

    if (adminData.role !== "MASTER_ADMIN") {
        throw new Error("Somente o MASTER_ADMIN pode excluir usuários permanentemente.");
    }

    const target = await prisma.userSubscription.findUnique({ where: { userId: targetUserId } });
    if (target?.role === "MASTER_ADMIN") {
        throw new Error("Não é possível excluir outro MASTER_ADMIN.");
    }

    // Exclui o usuário (aciona gatilhos de cascade no banco de dados)
    await prisma.user.delete({
        where: { id: targetUserId }
    });

    revalidatePath("/billing");
    return { success: true };
}

// Global Settings Actions
export async function getGlobalSettings() {
    try {
        let settings = await (prisma as any).globalSetting?.findUnique({
            where: { id: "global" }
        });

        if (!settings) {
            settings = await (prisma as any).globalSetting?.create({
                data: { 
                    id: "global",
                    maintenanceMode: false,
                    proPrice: 19.90,
                    monthlyPrice: 49.90,
                    maintenanceMessage: "Estamos em manutenção programada. Voltaremos em breve!"
                }
            });
        }

        return settings;
    } catch (e) {
        console.error("Erro ao buscar configurações globais:", e);
        return {
            id: "global",
            maintenanceMode: false,
            maintenanceMessage: "Estamos em manutenção programada. Voltaremos em breve!",
            proPrice: 19.90,
            monthlyPrice: 49.90
        };
    }
}

export async function updateGlobalSettings(data: {
    maintenanceMode?: boolean;
    maintenanceMessage?: string;
    proPrice?: number;
    monthlyPrice?: number;
}) {
    await verifyAdminAccess();

    try {
        const updated = await (prisma as any).globalSetting.update({
            where: { id: "global" },
            data: data
        });
        
        revalidatePath("/", "layout"); 
        return updated;
    } catch (e) {
        console.error("Erro ao atualizar configurações globais:", e);
        throw new Error("Falha ao atualizar configurações.");
    }
}

