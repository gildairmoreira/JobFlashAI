import { env } from "@/env";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const headers = req.headers;
        const signature = headers.get("x-cakto-signature");

        if (process.env.CAKTO_WEBHOOK_SECRET) {
            if (!signature) {
                console.error("Cakto Webhook Warning: Assinatura ausente");
                return new Response("Unauthorized", { status: 401 });
            }
            const expectedSignature = crypto.createHmac("sha256", process.env.CAKTO_WEBHOOK_SECRET).update(rawBody).digest("hex");
            if (signature !== expectedSignature) {
                console.error("Cakto Webhook Warning: Assinatura inválida (HMAC Mismatch)");
                return new Response("Unauthorized", { status: 401 });
            }
        }

        const payload = JSON.parse(rawBody);
        const eventType = payload.event;

        // We only care about approved payments for now
        if (eventType !== "payment.approved" && eventType !== "payment.completed") {
            return new Response("Event ignored", { status: 200 });
        }

        const transactionId = payload.data?.transaction?.id;
        const customerEmail = payload.data?.customer?.email; // Usually the user's primary identifier before Clerk ID is linked via metadata, or they pass a custom parameter.
        const productId = payload.data?.product?.id?.toString();

        // The user might pass the Clerk userId in the checkout metadata/custom fields
        const clerkUserId = payload.data?.metadata?.clerk_user_id || payload.data?.custom_fields?.clerk_user_id;

        if (!clerkUserId) {
            console.error("Cakto Webhook Error: clerk_user_id missing from metadata.");
            return new Response("Missing clerk_user_id in metadata", { status: 400 });
        }

        const CAKTO_PRO_ID = process.env.CAKTO_PRO_PRODUCT_ID || "123_PRO";
        const CAKTO_LIFETIME_ID = process.env.CAKTO_LIFETIME_PRODUCT_ID || "123_LIFETIME";

        let planType: "FREE" | "PRO" | "LIFETIME" = "FREE";
        let expirationDate: Date | null = null;

        if (productId === CAKTO_PRO_ID) {
            planType = "PRO";
            expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 7); // 7 days from now
        } else if (productId === CAKTO_LIFETIME_ID) {
            planType = "LIFETIME";
            expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 31); // Monthly recurrence
        }

        if (planType !== "FREE") {
            await prisma.userSubscription.upsert({
                where: { userId: clerkUserId },
                create: {
                    userId: clerkUserId,
                    planType,
                    caktoTransactionId: transactionId,
                    status: "ACTIVE",
                    currentPeriodEnd: expirationDate,
                },
                update: {
                    planType,
                    caktoTransactionId: transactionId,
                    status: "ACTIVE",
                    currentPeriodEnd: expirationDate,
                },
            });
        }

        return new Response("Webhook processed", { status: 200 });
    } catch (error) {
        console.error("Cakto Webhook Error:", error);
        return new Response("Webhook handler failed", { status: 500 });
    }
}

