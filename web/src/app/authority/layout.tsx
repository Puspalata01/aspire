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
    <div className="min-h-screen bg-[#05070D] text-[#F5F7FB] font-sans flex flex-col relative select-none selection:bg-[#3B6CFF] selection:text-white overflow-x-hidden">
      {/* Main Content Area */}
      <main className={cn("flex-1 w-full", isMapPage ? "h-screen flex flex-col overflow-hidden p-0 pb-16" : "pb-24 overflow-y-auto")}>
        {children}
      </main>

      {/* macOS Liquid Glass Navigation Dock (Consistent on all authority views) */}
      <AuthorityDock />
    </div>
  );
}
