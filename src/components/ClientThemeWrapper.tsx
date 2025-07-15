"use client";

import { useEffect, useState } from "react";

interface ClientThemeWrapperProps {
  children: React.ReactNode;
}

export default function ClientThemeWrapper({ children }: ClientThemeWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}