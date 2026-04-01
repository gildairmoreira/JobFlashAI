import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import type { Session } from "better-auth/types";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/api/cakto/webhook",
  "/api/mercadopago/webhook",
  "/print",
  "/api/auth", // Necessário para o próprio Better Auth funcionar
];

export default async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verifica se a rota é pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || (route !== "/" && pathname.startsWith(`${route}/`))
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verifica sessão para rotas protegidas
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    },
  );

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes (exceto auth e webhooks se necessário)
    "/(api|trpc)(.*)",
  ],
};
