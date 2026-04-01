import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_BASE_URL 
    ? new URL(process.env.NEXT_PUBLIC_BASE_URL) 
    : (process.env.NODE_ENV === 'development' ? new URL("http://localhost:3000") : undefined), // Define a URL base para metadados (OG, Twitter)
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
    <html lang="pt-br" suppressHydrationWarning>
      <head>
        {/* Google Fonts para templates de currículo */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=EB+Garamond:wght@400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600&family=Lato:wght@300;400;700&family=Merriweather:wght@300;400;700&family=Nunito+Sans:wght@300;400;600;700&family=Source+Serif+4:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-X4RVT0YTBC" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive" dangerouslySetInnerHTML={{
           __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-X4RVT0YTBC');
           `
        }} />
      </body>
    </html>
  );
}
