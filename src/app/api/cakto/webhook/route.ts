import { env } from "@/env";
import prisma from "@/lib/prisma";
import { PlanType } from "@prisma/client";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const headers = req.headers;
        const signature = headers.get("x-cakto-signature");

        if (!process.env.CAKTO_WEBHOOK_SECRET) {
            console.error("Cakto Webhook Error: CAKTO_WEBHOOK_SECRET is not configured. Rejecting for security.");
            return new Response("Webhook secret not configured", { status: 500 });
        }

        if (!signature) {
            console.error("Cakto Webhook Warning: Assinatura ausente");
            return new Response("Unauthorized", { status: 401 });
        }
        
        const expectedSignature = crypto.createHmac("sha256", process.env.CAKTO_WEBHOOK_SECRET).update(rawBody).digest("hex");
        if (signature !== expectedSignature) {
            console.error("Cakto Webhook Warning: Assinatura inválida (HMAC Mismatch)");
            return new Response("Unauthorized", { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const eventType = payload.event;
        const data = payload.data;

        // Extract identifiers
        const transactionId = data?.transaction?.id?.toString();
        const customerEmail = data?.customer?.email;
        const customerName = data?.customer?.name;
        const clerkUserId = data?.metadata?.clerk_user_id || data?.custom_fields?.clerk_user_id;

        // Logging event for funnel analytics
        await (prisma as any).analyticEvent.create({
            data: {
                userId: clerkUserId || null,
                event: eventType,
                metadata: {
                    transactionId,
                    email: customerEmail,
                    product: data?.product?.name
                }
            }
        });

        // 1. Handle Checkout Initiation (Funnel Top)
        if (eventType === "initiate_checkout") {
            return new Response("Event logged", { status: 200 });
        }

        // 2. Handle Payment Generated (PIX, Boleto, etc. - Funnel Middle)
        if (eventType === "pix_gerado" || eventType === "boleto_gerado" || eventType === "picpay_gerado") {
            if (clerkUserId && transactionId) {
                await (prisma as any).transaction.upsert({
                    where: { caktoTransactionId: transactionId },
                    create: {
                        userId: clerkUserId,
                        caktoTransactionId: transactionId,
                        amount: parseFloat(data?.transaction?.amount || "0"),
                        status: "PENDING",
                        paymentMethod: eventType.replace("_gerado", ""),
                        customerEmail,
                        customerName,
                    },
                    update: {
                        status: "PENDING",
                    }
                });
            }
            return new Response("Pending transaction created", { status: 200 });
        }

        // 3. Handle Approved Payments (Funnel Conversion)
        if (eventType === "purchase_approved" || eventType === "payment.approved" || eventType === "payment.completed") {
            const productId = data?.product?.id?.toString();
            if (!clerkUserId) {
                console.error("Cakto Webhook Error: clerk_user_id missing from metadata.");
                return new Response("Missing clerk_user_id", { status: 400 });
            }

            const CAKTO_PRO_ID = process.env.CAKTO_PRO_PRODUCT_ID;
            const CAKTO_MONTHLY_ID = process.env.CAKTO_MONTHLY_PRODUCT_ID;

            let planType: PlanType = "FREE" as PlanType;
            let expirationDate: Date | null = null;

            if (productId === CAKTO_PRO_ID) {
                planType = "PRO" as PlanType;
                expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + 7);
            } else if (productId === CAKTO_MONTHLY_ID) {
                planType = "MONTHLY" as PlanType;
                expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + 31);
            }

            if (planType !== "FREE") {
                // Update Subscription
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

                // Update or Create Transaction as PAID
                if (transactionId) {
                    await (prisma as any).transaction.upsert({
                        where: { caktoTransactionId: transactionId },
                        create: {
                            userId: clerkUserId,
                            caktoTransactionId: transactionId,
                            amount: parseFloat(data?.transaction?.amount || "0"),
                            status: "PAID",
                            paymentMethod: data?.transaction?.payment_method || "unknown",
                            customerEmail,
                            customerName,
                        },
                        update: {
                            status: "PAID",
                        }
                    });
                }
            }
            return new Response("Purchase approved and subscription updated", { status: 200 });
        }

        return new Response("Event ignored", { status: 200 });
    } catch (error) {
        console.error("Cakto Webhook Error:", error);
        return new Response("Webhook handler failed", { status: 500 });
    }
}

