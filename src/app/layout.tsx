import ClientThemeWrapper from "@/components/ClientThemeWrapper";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <ClientThemeWrapper>
              <Toaster />
            </ClientThemeWrapper>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
