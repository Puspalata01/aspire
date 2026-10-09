"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDisasterStore } from "@/stores/useDisasterStore";
import { Menu, Search, Bell, Shield } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function AuthorityHeader({ pageTitle }: { pageTitle?: string }) {
  const { user } = useAuthStore();
  const { kpis } = useDisasterStore();

  return (
    <header className="w-full flex items-center justify-between gap-4 px-5 py-3 border-b border-[#E7E2DA] bg-white/95 backdrop-blur-xl sticky top-0 z-30 select-none shadow-[0_4px_20px_rgba(124,58,237,0.03)]">
      {/* Left: Menu Toggle + ASPIRE Brand Identity */}
      <div className="flex items-center gap-3">
        <Link
          href="/authority/dashboard"
          className="w-9 h-9 rounded-xl bg-[#F8F7F4] hover:bg-[#F3E8FF] border border-[#E7E2DA] flex items-center justify-center text-[#5D5775] hover:text-[#7C3AED] transition-colors"
          title="Command Dashboard"
        >
          <Menu className="w-4 h-4" />
        </Link>

        <Link href="/authority/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white shadow-[0_0_16px_rgba(124,58,237,0.35)]">
            <Shield className="w-4 h-4 fill-white text-[#7C3AED]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-[#1C1929]">
                {APP_CONFIG.name}
              </span>
              {pageTitle && (
                <>
                  <span className="text-[#A39EB5] text-xs">/</span>
                  <span className="text-xs font-semibold text-[#7C3AED]">{pageTitle}</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-[#5D5775] font-medium leading-none hidden sm:block">
              AI-Powered Disaster Intelligence & Autonomous Decision-Support Platform
            </p>
          </div>
        </Link>
      </div>

      {/* Center: Search Field with Shortcut Chip */}
      <div className="hidden md:flex items-center relative flex-1 max-w-md mx-4">
        <Search className="w-3.5 h-3.5 text-[#767092] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search location, district, hazard, or resource..."
          className="w-full bg-[#F8F7F4] border border-[#E7E2DA] rounded-full pl-9 pr-14 py-1.5 text-xs text-[#1C1929] placeholder-[#767092] focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] transition-all"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-[#5D5775] border border-[#E7E2DA] shadow-xs">
          Ctrl + K
        </span>
      </div>

      {/* Right: Authority Pill, Bell, Profile */}
      <div className="flex items-center gap-3">
        {/* Authority Status Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#059669]/10 border border-[#059669]/30 text-[#059669] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
          <span>Authority</span>
        </div>

        {/* Bell Icon with Red Dot */}
        <Link
          href="/authority/sos"
          className="relative w-9 h-9 rounded-xl bg-[#F8F7F4] hover:bg-[#F3E8FF] border border-[#E7E2DA] flex items-center justify-center text-[#5D5775] hover:text-[#7C3AED] transition-colors"
          title="SOS Alerts"
        >
          <Bell className="w-4 h-4" />
          {kpis.activeSOSCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#DC2626] ring-2 ring-white" />
          )}
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-1.5 border-l border-[#E7E2DA]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] ring-1 ring-purple-200 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            SM
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-[#1C1929] leading-none">
              {user?.name || "Dr. S. Mohanty"}
            </span>
            <span className="text-[10px] text-[#5D5775] leading-tight mt-0.5">
              Disaster Management Authority
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
