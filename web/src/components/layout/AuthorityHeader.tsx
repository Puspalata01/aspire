"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDisasterStore } from "@/stores/useDisasterStore";
import { Menu, Search, Bell, Shield, ShieldCheck } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function AuthorityHeader({ pageTitle }: { pageTitle?: string }) {
  const { user } = useAuthStore();
  const { kpis, disaster } = useDisasterStore();

  return (
    <header className="w-full flex items-center justify-between gap-4 px-5 py-3 border-b border-white/10 bg-[#05070D]/90 backdrop-blur-xl sticky top-0 z-30 select-none">
      {/* Left: Menu Toggle + ASPIRE Brand Identity */}
      <div className="flex items-center gap-3">
        <Link
          href="/authority/dashboard"
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#9AA3B8] hover:text-white transition-colors"
          title="Command Dashboard"
        >
          <Menu className="w-4 h-4" />
        </Link>

        <Link href="/authority/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#3B6CFF] flex items-center justify-center text-white shadow-[0_0_16px_rgba(59,108,255,0.4)]">
            <Shield className="w-4 h-4 fill-white text-[#3B6CFF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-[#F5F7FB]">
                {APP_CONFIG.name}
              </span>
              {pageTitle && (
                <>
                  <span className="text-[#6B7488] text-xs">/</span>
                  <span className="text-xs font-semibold text-[#3B6CFF]">{pageTitle}</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-[#6B7488] font-medium leading-none hidden sm:block">
              AI-Powered Disaster Intelligence & Autonomous Decision-Support Platform
            </p>
          </div>
        </Link>
      </div>

      {/* Center: Search Field with Shortcut Chip */}
      <div className="hidden md:flex items-center relative flex-1 max-w-md mx-4">
        <Search className="w-3.5 h-3.5 text-[#6B7488] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search location, district, hazard, or resource..."
          className="w-full bg-[#101624]/70 border border-white/10 rounded-full pl-9 pr-14 py-1.5 text-xs text-[#F5F7FB] placeholder-[#6B7488] focus:border-[#3B6CFF] focus:outline-none focus:ring-1 focus:ring-[#3B6CFF] transition-all"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-[#9AA3B8] border border-white/5">
          Ctrl + K
        </span>
      </div>

      {/* Right: Authority Pill, Bell, Profile */}
      <div className="flex items-center gap-3">
        {/* Authority Status Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2FD07F]/15 border border-[#2FD07F]/30 text-[#2FD07F] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#2FD07F] animate-pulse" />
          <span>Authority</span>
        </div>

        {/* Bell Icon with Red Dot */}
        <Link
          href="/authority/sos"
          className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#9AA3B8] hover:text-white transition-colors"
          title="SOS Alerts"
        >
          <Bell className="w-4 h-4" />
          {kpis.activeSOSCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF4D5E] ring-2 ring-[#05070D]" />
          )}
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-1.5 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3B6CFF] to-[#6C63FF] ring-1 ring-white/20 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            SM
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-[#F5F7FB] leading-none">
              {user?.name || "Dr. S. Mohanty"}
            </span>
            <span className="text-[10px] text-[#6B7488] leading-tight mt-0.5">
              Disaster Management Authority
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
