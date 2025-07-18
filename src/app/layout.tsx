import React from "react";
import ClientThemeWrapper from "@/components/ClientThemeWrapper";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/print.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s - JobFlashAI",
    absolute: "JobFlashAI",
  },
  description:
    "JobFlashAI é a maneira mais fácil de criar um currículo profissional que vai te ajudar a conseguir o emprego dos seus sonhos.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <html lang="pt-BR" suppressHydrationWarning>
        <head>
          <script 
            defer 
            src="https://cloud.umami.is/script.js" 
            data-website-id="fe0709ff-f9d4-4237-830f-da156fb7349e"
          ></script>
        </head>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
          >
            <ClientThemeWrapper>
              {children}
              <Toaster />
            </ClientThemeWrapper>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
