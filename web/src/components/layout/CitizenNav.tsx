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
      <nav className="hidden md:flex items-center justify-center gap-2 border-b border-[#D4D4D1] bg-[#E9E9E7] shadow-raise-1 px-4 py-2.5 sticky top-16 z-20">
        {CITIZEN_NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon] || Home;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-160",
                item.highlight
                  ? "bg-[#F1F1EF] text-[#D64545] border border-[#D64545]/40 shadow-raise-2 hover:shadow-raise-3 active:shadow-sink-1 font-bold"
                  : isActive
                  ? "bg-[#8E8E93] text-[#1D1D1F] shadow-raise-2"
                  : "text-[#4A4A4F] hover:bg-[#F1F1EF] hover:shadow-raise-1 active:shadow-sink-1"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#E9E9E7] border-t border-[#D4D4D1] shadow-raise-3 px-3 py-2 flex items-center justify-around">
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
                  ? "text-[#D64545] font-bold"
                  : isActive
                  ? "text-[#1D1D1F]"
                  : "text-[#8A8A90] hover:text-[#4A4A4F]"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-full transition-all duration-160",
                  item.highlight
                    ? "bg-[#F1F1EF] text-[#D64545] shadow-raise-1 border border-[#D64545]/30"
                    : isActive
                    ? "bg-[#8E8E93] text-[#1D1D1F] shadow-raise-2"
                    : "bg-[#F1F1EF] text-[#8A8A90] shadow-raise-1"
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
