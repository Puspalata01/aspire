"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AuthorityDock } from "@/components/layout/AuthorityDock";
import { cn } from "@/lib/utils";

export default function AuthorityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMapPage = pathname === "/authority/map";

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1C1929] font-sans flex flex-col relative select-none selection:bg-[#7C3AED] selection:text-white overflow-x-hidden">
      {/* Main Content Area */}
      <main className={cn("flex-1 w-full", isMapPage ? "h-screen flex flex-col overflow-hidden p-0" : "pb-24 overflow-y-auto")}>
        {children}
      </main>

      {/* macOS Liquid Glass Navigation Dock (Consistent on all authority views) */}
      <AuthorityDock />
    </div>
  );
}
