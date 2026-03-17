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

    // Only count as active revenue if they actually have a Cakto Transaction ID
    const activeProPaid = await (prisma.userSubscription as any).count({
        where: { planType: "PRO", status: "ACTIVE", caktoTransactionId: { not: null } }
    });
    const activeMonthlyPaid = await (prisma.userSubscription as any).count({
        where: { planType: "MONTHLY", status: "ACTIVE", caktoTransactionId: { not: null } }
    });
    const frozenOrBanned = await (prisma.userSubscription as any).count({ where: { status: { in: ["FROZEN", "BANNED"] } } });

    // "Receita Faturada" - synchronized logically and strictly with real Cakto Sales
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

        // Define 'online' if last active within the last 15 minutes
        const now = Date.now();
        const fifteenMinutesAgo = now - 15 * 60 * 1000;

        let lastActiveMs = clerkObj.lastActiveAt || clerkObj.lastSignInAt || 0;
        // Normalize: Clerk timestamps can be in seconds or milliseconds
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
    }).sort((a, b) => {
        // Sort: Online first, then by most recent activity
        if (a.isOnline === b.isOnline) {
            return b.lastActiveAt - a.lastActiveAt;
        }
        return a.isOnline ? -1 : 1;
    });

    return {
        adminRole: adminData.role,
        stats: {
            totalUsers,
            activeProPaid,
            activeMonthlyPaid,
            frozenOrBanned,
            estimatedRevenue
        },
        recentUsers,
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
