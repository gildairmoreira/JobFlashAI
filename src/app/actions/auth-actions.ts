"use server";

import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getUserSubscription() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user) return null;

    const subscription = await prisma.userSubscription.findUnique({
        where: { userId: session.user.id },
    });

    return subscription;
}
