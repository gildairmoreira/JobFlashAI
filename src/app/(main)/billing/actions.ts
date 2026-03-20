"use server";

import prisma from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { revalidatePath } from "next/cache";

// Utility to verify if current user is an admin
export async function verifyAdminAccess() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const userSub = await prisma.userSubscription.findUnique({
        where: { userId },
    }) as any;

    // Master Admin is hardcoded or set manually
    const client = await clerkClient();
    const currentUserObj = await client.users.getUser(userId);
    const email = currentUserObj.emailAddresses[0]?.emailAddress;

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
    const totalUsersDb = await (prisma.userSubscription as any).count();

    // 1. Fetch Real Transactions (Cakto based)
    const allTransactions = await (prisma as any).transaction.findMany();
    const paidTransactions = allTransactions.filter((t: any) => t.status === "PAID");
    const pendingTransactions = allTransactions.filter((t: any) => t.status === "PENDING");
    
    // Exact revenue from PAID transactions
    const totalRevenue = paidTransactions.reduce((acc: number, curr: any) => acc + curr.amount, 0);

    // FIX: Using $transaction instead of transaction
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

    // 3. Funnel Data (With Mocking)
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

    // Basic legacy metrics
    const estimatedRevenue = (activeProPaid * 19.90) + (activeMonthlyPaid * 49.90);

    // Fetch latest 50 users from Clerk as source of truth for all signups
    const client = await clerkClient();
    const clerkUserList = await client.users.getUserList({
        limit: 50,
        orderBy: "-created_at"
    });

    const userIds = clerkUserList.data.map(u => u.id);

    // Fetch their corresponding DB records
    const dbUsers = await (prisma.userSubscription as any).findMany({
        where: { userId: { in: userIds } }
    });

    const totalUsers = clerkUserList.totalCount || totalUsersDb;

    const recentUsers = clerkUserList.data.map(clerkObj => {
        const u = dbUsers.find((db: any) => db.userId === clerkObj.id);

        const now = Date.now();
        const fifteenMinutesAgo = now - 15 * 60 * 1000;

        let lastActiveMs = clerkObj.lastActiveAt || clerkObj.lastSignInAt || 0;
        if (lastActiveMs > 0 && lastActiveMs < 1000000000000) {
            lastActiveMs *= 1000;
        }

        const isOnline = lastActiveMs > fifteenMinutesAgo;

        return {
            userId: clerkObj.id,
            planType: (u as any)?.planType || "FREE",
            role: (u as any)?.role || "USER",
            status: (u as any)?.status || "ACTIVE",
            createdAt: (u as any)?.createdAt || new Date(clerkObj.createdAt),
            lastActiveAt: lastActiveMs,
            isOnline,
            email: clerkObj.emailAddresses[0]?.emailAddress || "Sem E-mail",
            firstName: clerkObj.firstName || "",
            lastName: clerkObj.lastName || "",
            imageUrl: clerkObj.imageUrl || ""
        }
    });

    // 4. Last 10 Sales
    const lastPaidSales = await (prisma as any).transaction.findMany({
        where: { status: "PAID" },
        orderBy: { createdAt: "desc" },
        take: 10
    });

    return {
        adminRole: adminData.role,
        stats: {
            totalUsers,
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

    // Determine current expiration based on new plan (optional, but good practice)
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

// Global Settings Actions - Optimized for Windows dev-server locks
export async function getGlobalSettings() {
    // REMOVIDO: verifyAdminAccess() 
    // Esta função deve ser acessível por qualquer pessoa (inclusive Landing Page) 
    // para verificar status do sistema e preços.
    
    try {
        // Try standard access first
        let settings = await (prisma as any).globalSetting?.findFirst({
            where: { id: "global" }
        });

        if (!settings) {
            // Fallback to raw query if model is missing from client or table is empty
            const rawResults = await prisma.$queryRawUnsafe(`SELECT * FROM "global_settings" WHERE "id" = 'global' LIMIT 1`) as any[];
            settings = rawResults[0];
            
            if (!settings) {
                // Initialize if both fail
                settings = await (prisma as any).globalSetting?.create({
                    data: { id: "global" }
                }) || await prisma.$executeRawUnsafe(`INSERT INTO "global_settings" ("id", "maintenanceMode", "proPrice", "monthlyPrice", "updatedAt") VALUES ('global', false, 19.90, 49.90, NOW()) RETURNING *`);
            }
        }

        return settings;
    } catch (e) {
        console.error("Prisma Client out of sync, using raw query fallback", e);
        const rawResults = await prisma.$queryRawUnsafe(`SELECT * FROM "global_settings" WHERE "id" = 'global' LIMIT 1`) as any[];
        if (rawResults.length > 0) return rawResults[0];
        
        // Return defaults if everything fails to prevent UI crash
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
        const updated = await (prisma as any).globalSetting.upsert({
            where: { id: "global" },
            update: data,
            create: { id: "global", ...data }
        });
        
        // Sincronização com Cakto (Background)
        if (data.proPrice) updateCaktoOfferPrice(process.env.CAKTO_PRO_PRODUCT_ID!, data.proPrice);
        if (data.monthlyPrice) updateCaktoOfferPrice(process.env.CAKTO_MONTHLY_PRODUCT_ID!, data.monthlyPrice);

        revalidatePath("/", "layout"); // Revalidação total para refletir mudanças no layout global
        return updated;
    } catch (e) {
        // Raw query fallback for updates
        const sets = Object.entries(data)
            .map(([k, v]) => `"${k}" = ${typeof v === 'string' ? `'${v}'` : v}`)
            .join(', ');
        
        await prisma.$executeRawUnsafe(`
            UPDATE "global_settings" 
            SET ${sets}, "updatedAt" = NOW() 
            WHERE "id" = 'global'
        `);
        
        // Sincronização com Cakto (Background - Raw Fallback)
        if (data.proPrice) updateCaktoOfferPrice(process.env.CAKTO_PRO_PRODUCT_ID!, data.proPrice);
        if (data.monthlyPrice) updateCaktoOfferPrice(process.env.CAKTO_MONTHLY_PRODUCT_ID!, data.monthlyPrice);

        revalidatePath("/", "layout"); // Revalidação total para refletir mudanças no layout global
        return { success: true };
    }
}

async function getCaktoAccessToken() {
    const clientId = process.env.CAKTO_CLIENT_ID;
    const clientSecret = process.env.CAKTO_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) return null;

    try {
        // EXATO: Seguindo o exemplo da documentação (CURL)
        // A Cakto NÃO usa grant_type no exemplo oficial
        const params = new URLSearchParams();
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);

        const response = await fetch('https://api.cakto.com.br/public_api/token/', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded' 
            },
            body: params.toString()
        });

        if (response.ok) {
            const data = await response.json();
            return data.access_token;
        }

        console.error("Cakto OAuth Precision Error:", {
            status: response.status,
            body: await response.text()
        });
        return null;
    } catch (e) {
        console.error("Cakto Auth Request Exception:", e);
        return null;
    }
}

async function updateCaktoOfferPrice(id: string, newPrice: number) {
    const accessToken = await getCaktoAccessToken();
    if (!accessToken || !id) return;

    const priceStr = newPrice.toFixed(2);

    try {
        // 1. Tentar descobrir se o ID é um PRODUTO e buscar suas ofertas
        const productRes = await fetch(`https://api.cakto.com.br/public_api/products/${id}/`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (productRes.ok) {
            console.log(`Cakto: ID ${id} is a Product. Searching for associated offers...`);
            
            // Buscar ofertas vinculadas a este produto
            const offersListRes = await fetch(`https://api.cakto.com.br/public_api/offers/?product=${id}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (offersListRes.ok) {
                const offersData = await offersListRes.json();
                const offers = Array.isArray(offersData) ? offersData : (offersData.results || []);
                
                console.log(`Cakto: Found ${offers.length} offers for product ${id}. Updating all...`);
                
                for (const offer of offers) {
                    const offerId = offer.id;
                    const updatedOffer = { ...offer, price: newPrice };
                    
                    const putRes = await fetch(`https://api.cakto.com.br/public_api/offers/${offerId}/`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedOffer)
                    });

                    if (putRes.ok) {
                        console.log(`Cakto Sync Success (Offer via Product): ${offerId} -> R$ ${newPrice}`);
                    } else {
                        console.error(`Cakto Failed to update offer ${offerId}:`, await putRes.text());
                    }
                }
                // Também atualizamos o produto em si (como redundância)
                const productData = await productRes.json();
                fetch(`https://api.cakto.com.br/public_api/products/${id}/`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...productData, price: priceStr })
                }).catch(() => {});
                
                return;
            }
        }

        // 2. FALLBACK: Tentar o ID diretamente como OFERTA
        const getOffer = await fetch(`https://api.cakto.com.br/public_api/offers/${id}/`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (getOffer.ok) {
            const offerData = await getOffer.json();
            const updatedOffer = { ...offerData, price: newPrice };

            const resPut = await fetch(`https://api.cakto.com.br/public_api/offers/${id}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedOffer)
            });

            if (resPut.ok) {
                console.log(`Cakto Sync Success (Direct Offer): ${id} -> R$ ${newPrice}`);
                return;
            }
        }

        console.error(`Cakto Sync Failed for ${id}: Product/Offers not found after deep search.`);
    } catch (e) {
        console.error("Cakto Sync Exception:", e);
    }
}
