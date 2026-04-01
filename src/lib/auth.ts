import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    emailAndPassword: {
        enabled: true,
    },
    // Força o uso de Database Sessions para maior controle
    session: {
        strategy: "database",
        expiresIn: 60 * 60 * 24 * 30, // 30 dias
        updateAge: 60 * 60 * 24, // 1 dia
    },
    user: {
        deleteUser: {
            enabled: true,
        }
    },
    plugins: [
        // plugins: [ ... ]
    ]
});
