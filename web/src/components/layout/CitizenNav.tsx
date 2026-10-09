"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CITIZEN_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Home,
  Map,
  Shield,
  Navigation,
  LifeBuoy,
  FileText,
  Bell,
  BookOpen,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Home,
  Map,
  Shield,
  Navigation,
  LifeBuoy,
  FileText,
  Bell,
  BookOpen,
};

export function CitizenNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Top Sub-Nav */}
      <nav className="hidden md:flex items-center justify-center gap-2 border-b border-[#E7E2DA] bg-white/90 backdrop-blur-xl px-4 py-2.5 sticky top-16 z-20 shadow-xs">
        {CITIZEN_NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon] || Home;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-160 cursor-pointer",
                item.highlight
                  ? "bg-red-50 text-[#DC2626] border border-red-200 shadow-[0_0_12px_rgba(220,38,38,0.2)] font-bold animate-pulse"
                  : isActive
                  ? "bg-[#7C3AED] text-white shadow-[0_4px_14px_rgba(124,58,237,0.3)] font-bold"
                  : "text-[#5D5775] hover:text-[#1C1929] hover:bg-[#F3E8FF]/60"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-[#E7E2DA] backdrop-blur-2xl px-3 py-2 flex items-center justify-around shadow-lg">
        {CITIZEN_NAV_ITEMS.slice(0, 5).map((item) => {
          const Icon = ICON_MAP[item.icon] || Home;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[10px] font-semibold transition-all duration-160 relative",
                item.highlight
                  ? "text-[#DC2626] font-bold"
                  : isActive
                  ? "text-[#7C3AED] font-bold"
                  : "text-[#5D5775] hover:text-[#1C1929]"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-xl transition-all duration-160",
                  item.highlight
                    ? "bg-red-50 text-[#DC2626] border border-red-200"
                    : isActive
                    ? "bg-[#7C3AED] text-white shadow-md"
                    : "bg-[#F8F7F4] text-[#5D5775]"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
