"use client";

import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("./Navbar"), { ssr: false });

export default function ClientNavbar({
  isAdmin,
  userPlan,
  periodEnd
}: {
  isAdmin?: boolean;
  userPlan?: string;
  periodEnd?: string | null;
}) {
  return <Navbar isAdmin={isAdmin} userPlan={userPlan} periodEnd={periodEnd} />;
}