"use client";

import logo from "@/assets/logo.png";
import ClientThemeWrapper from "@/components/ClientThemeWrapper";
import ThemeToggle from "@/components/ThemeToggle";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { CreditCard } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

function ThemedUserButton() {
  const { theme } = useTheme();
  
  return (
    <UserButton
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
        elements: {
          avatarBox: {
            width: 35,
            height: 35,
          },
        },
      }}
    >
      <UserButton.MenuItems>
        <UserButton.Link
          label="Configurações"
          labelIcon={<CreditCard className="size-4" />}
          href="/settings"
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}

export default function Navbar() {
  return (
    <header className="shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 p-3">
        <Link href="/resumes" className="flex items-center gap-2">
          <Image
            src={logo}
            alt="JobFlashAI Logo"
            width={45}
            height={45}
            className="rounded-full"
          />
          <span className="text-xl font-bold tracking-tight">
            JobFlashAI
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ClientThemeWrapper>
            <ThemeToggle />
          </ClientThemeWrapper>
          <ClientThemeWrapper>
            <ThemedUserButton />
          </ClientThemeWrapper>
        </div>
      </div>
    </header>
  );
}
