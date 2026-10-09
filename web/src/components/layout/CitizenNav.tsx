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
      <nav className="hidden md:flex items-center justify-center gap-2 border-b border-white/10 bg-[#0A101D]/80 backdrop-blur-xl px-4 py-2.5 sticky top-16 z-20">
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
                  ? "bg-[#FF4D5E]/20 text-[#FF4D5E] border border-[#FF4D5E]/40 shadow-[0_0_12px_rgba(255,77,94,0.3)] font-bold animate-pulse"
                  : isActive
                  ? "bg-[#3B6CFF] text-white shadow-[0_0_15px_rgba(59,108,255,0.45)]"
                  : "text-[#8E99AF] hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060A13]/90 border-t border-white/10 backdrop-blur-2xl px-3 py-2 flex items-center justify-around">
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
                  ? "text-[#FF4D5E] font-bold"
                  : isActive
                  ? "text-white"
                  : "text-[#8E99AF] hover:text-white"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-xl transition-all duration-160",
                  item.highlight
                    ? "bg-[#FF4D5E]/20 text-[#FF4D5E] border border-[#FF4D5E]/40"
                    : isActive
                    ? "bg-[#3B6CFF] text-white shadow-md"
                    : "bg-white/5 text-[#8E99AF]"
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
