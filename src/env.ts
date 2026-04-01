import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    POSTGRES_URL: z.string().min(1),
    POSTGRES_PRISMA_URL: z.string().min(1),
    POSTGRES_URL_NO_SSL: z.string().min(1),
    POSTGRES_URL_NON_POOLING: z.string().min(1),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_HOST: z.string().min(1),
    POSTGRES_PASSWORD: z.string().min(1),
    POSTGRES_DATABASE: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    BLOB_READ_WRITE_TOKEN: z.string().min(1),
    GEMINI_API_KEY: z.string().min(1).optional(),
    CAKTO_WEBHOOK_SECRET: z.string().optional(),
    CAKTO_PRO_PRODUCT_ID: z.string().optional(),
    CAKTO_MONTHLY_PRODUCT_ID: z.string().optional(),
    CAKTO_PRO_CHECKOUT_URL: z.string().optional(),
    CAKTO_MONTHLY_CHECKOUT_URL: z.string().optional(),
    CAKTO_CLIENT_ID: z.string().optional(),
    CAKTO_CLIENT_SECRET: z.string().optional(),
    MERCADOPAGO_ACCESS_TOKEN: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().min(1).url(),
    NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: z.string().min(1),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
  },
});
