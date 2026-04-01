import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    // baseURL deve ser o mesmo do BETTER_AUTH_URL, mas no frontend priorizamos o localhost se for dev
    baseURL: process.env.NODE_ENV === "development" 
        ? "http://localhost:3000" 
        : process.env.NEXT_PUBLIC_BASE_URL,
});

export const { 
    signIn,
    signUp,
    signOut, 
    useSession
} = authClient;
