'use client';

import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function LandingPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Força o tema dark para a landing page
  return (
    <div className={`${inter.className} dark bg-black min-h-screen`}>
      {children}
      <Toaster />
    </div>
  );
}