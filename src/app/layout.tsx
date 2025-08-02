import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { ptBR } from "@clerk/localizations";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s - JobFlashAI",
    absolute: "JobFlashAI",
  },
  description:
    "JobFlashAI é a maneira mais fácil de criar um currículo profissional que ajudará você a conquistar o emprego dos seus sonhos.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
          // Justification: Temporary 'as any' due to type mismatch in Clerk's localization types. To be resolved in future updates.
      /* eslint-disable @typescript-eslint/no-explicit-any */
      <ClerkProvider localization={ptBR as any}>
      <html lang="pt-br" suppressHydrationWarning>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-X4RVT0YTBC" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-X4RVT0YTBC');
          `}
        </Script>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
