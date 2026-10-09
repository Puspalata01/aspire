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
    <aside className="w-64 shrink-0 bg-[#E9E9E7] border-r border-[#D4D4D1] shadow-raise-1 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand & Incident Header */}
      <div className="p-5 border-b border-[#D4D4D1]">
        <Link href="/authority/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F1F1EF] shadow-raise-2 flex items-center justify-center text-[#2F6FE0]">
            <ShieldAlert className="w-5 h-5 text-[#2F6FE0]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-[#1D1D1F] tracking-tight">
                {APP_CONFIG.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F1F1EF] shadow-raise-1 text-[#2F6FE0] border border-[#2F6FE0]/30">
                HQ
              </span>
            </div>
            <p className="text-[11px] text-[#8A8A90] font-medium truncate">
              {APP_CONFIG.tagline}
            </p>
          </div>
        </Link>

        {/* Live Incident Status Pill */}
        <div className="mt-4 p-2.5 rounded-full bg-[#F1F1EF] shadow-raise-1 border border-[#D4D4D1] flex items-center justify-between">
          <div className="flex items-center gap-2 pl-1">
            <span className="w-2 h-2 rounded-full bg-[#D64545]" />
            <span className="text-[11px] font-bold text-[#1D1D1F] uppercase tracking-wide">
              Cyclone VARUN
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#D64545] bg-[#E2E2E0] px-2 py-0.5 rounded-full shadow-sink-1">
            LEVEL-4
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A90] px-3 py-1.5">
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
                "flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-medium transition-all duration-160 group",
                isActive
                  ? "bg-[#8E8E93] text-[#1D1D1F] shadow-raise-2 font-bold"
                  : "text-[#4A4A4F] hover:bg-[#F1F1EF] hover:shadow-raise-1 active:shadow-sink-1"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-[#1D1D1F]" : "text-[#8A8A90] group-hover:text-[#4A4A4F]"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full font-mono shadow-raise-1",
                    item.badge === "LIVE"
                      ? "bg-[#F1F1EF] text-[#2E9E6B] border border-[#2E9E6B]/40"
                      : item.badge === "AI"
                      ? "bg-[#F1F1EF] text-[#2F6FE0] border border-[#2F6FE0]/40"
                      : "bg-[#F1F1EF] text-[#D64545] border border-[#D64545]/40"
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
      <div className="p-4 border-t border-[#D4D4D1] bg-[#E9E9E7] space-y-3">
        <button
          onClick={toggleDemoRole}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold bg-[#F1F1EF] text-[#1D1D1F] shadow-raise-1 hover:shadow-raise-2 active:shadow-sink-1 transition-all cursor-pointer"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-[#2F6FE0]" />
          <span>Switch to Citizen Portal</span>
        </button>

        <div className="flex items-center gap-3 p-1.5 rounded-full bg-[#F1F1EF] shadow-raise-1">
          <div className="w-8 h-8 rounded-full bg-[#E2E2E0] shadow-sink-1 flex items-center justify-center text-xs font-bold text-[#2F6FE0]">
            AP
          </div>
          <div className="overflow-hidden pr-2">
            <p className="text-xs font-bold text-[#1D1D1F] truncate">
              {user?.name || "Command Center"}
            </p>
            <p className="text-[10px] text-[#8A8A90] truncate">
              {user?.badge || "Relief Commissioner"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
