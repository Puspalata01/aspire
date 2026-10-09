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
      {/* Main Content Area (Full viewport without dock on dedicated map page) */}
      <main className={cn("flex-1 w-full", isMapPage ? "h-screen overflow-hidden p-0" : "pb-20 overflow-y-auto")}>
        {children}
      </main>

      {/* macOS Liquid Glass Navigation Dock (Hidden on Map page to display reference sidebar layout) */}
      {!isMapPage && <AuthorityDock />}
    </div>
  );
}
