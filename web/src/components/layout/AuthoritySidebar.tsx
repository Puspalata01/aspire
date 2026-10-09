"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AUTHORITY_NAV_ITEMS, APP_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  LayoutDashboard,
  Map,
  Flame,
  TrendingUp,
  Truck,
  Home,
  HeartPulse,
  AlertTriangle,
  Cpu,
  Workflow,
  Navigation,
  BarChart3,
  Settings,
  ShieldAlert,
  ArrowRightLeft,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Map,
  Flame,
  TrendingUp,
  Truck,
  Home,
  HeartPulse,
  AlertTriangle,
  Cpu,
  Workflow,
  Navigation,
  BarChart3,
  Settings,
};

export function AuthoritySidebar() {
  const pathname = usePathname();
  const { user, toggleDemoRole } = useAuthStore();

  return (
    <aside className="w-64 shrink-0 bg-[#FBF9F5] border-r border-[#E7E2DA] flex flex-col h-screen sticky top-0 z-30 select-none shadow-[2px_0_12px_rgba(124,58,237,0.03)]">
      {/* Brand & Incident Header */}
      <div className="p-5 border-b border-[#E7E2DA]">
        <Link href="/authority/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7C3AED] shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center justify-center text-white">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-[#1C1929] tracking-tight">
                {APP_CONFIG.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE]">
                HQ
              </span>
            </div>
            <p className="text-[11px] text-[#5D5775] font-medium truncate">
              {APP_CONFIG.tagline}
            </p>
          </div>
        </Link>

        {/* Live Incident Status Pill */}
        <div className="mt-4 p-2.5 rounded-xl bg-white shadow-xs border border-[#E7E2DA] flex items-center justify-between">
          <div className="flex items-center gap-2 pl-1">
            <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
            <span className="text-[11px] font-bold text-[#1C1929] uppercase tracking-wide">
              Cyclone VARUN
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#DC2626] bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
            LEVEL-4
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#767092] px-3 py-1.5">
          Command Operations
        </div>
        {AUTHORITY_NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon] || LayoutDashboard;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-160 group",
                isActive
                  ? "bg-[#7C3AED] text-white shadow-[0_4px_14px_rgba(124,58,237,0.3)] font-bold"
                  : "text-[#5D5775] hover:bg-white hover:text-[#1C1929] hover:shadow-xs"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-white" : "text-[#767092] group-hover:text-[#7C3AED]"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full font-mono",
                    isActive
                      ? "bg-white/20 text-white"
                      : item.badge === "LIVE"
                      ? "bg-emerald-50 text-[#059669] border border-emerald-200"
                      : item.badge === "AI"
                      ? "bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE]"
                      : "bg-red-50 text-[#DC2626] border border-red-200"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / Switch View & Profile */}
      <div className="p-4 border-t border-[#E7E2DA] bg-[#FBF9F5] space-y-3">
        <button
          onClick={toggleDemoRole}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-[#1C1929] border border-[#E7E2DA] shadow-xs hover:border-[#7C3AED]/30 hover:text-[#7C3AED] transition-all cursor-pointer"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>Switch to Citizen Portal</span>
        </button>

        <div className="flex items-center gap-3 p-1.5 rounded-xl bg-white border border-[#E7E2DA] shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center text-xs font-bold text-white shadow-xs">
            AP
          </div>
          <div className="overflow-hidden pr-2">
            <p className="text-xs font-bold text-[#1C1929] truncate">
              {user?.name || "Command Center"}
            </p>
            <p className="text-[10px] text-[#5D5775] truncate">
              {user?.badge || "Relief Commissioner"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
