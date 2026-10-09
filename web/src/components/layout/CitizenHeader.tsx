"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";
import { ShieldAlert, ArrowRightLeft, MapPin } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function CitizenHeader() {
  const { toggleDemoRole } = useAuthStore();

  return (
    <header className="h-16 border-b border-[#E7E2DA] bg-white/95 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 select-none shadow-[0_4px_20px_rgba(124,58,237,0.03)]">
      <Link href="/citizen" className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white shadow-[0_0_16px_rgba(124,58,237,0.35)]">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-base text-[#1C1929] tracking-tight">
            {APP_CONFIG.name}
          </span>
          <span className="text-[10px] text-[#7C3AED] font-bold ml-2 px-2.5 py-0.5 rounded-full bg-[#F3E8FF] border border-[#DDD6FE]">
            CITIZEN SAFETY
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#5D5775] bg-[#F8F7F4] px-3.5 py-1.5 rounded-full border border-[#E7E2DA]">
          <MapPin className="w-3.5 h-3.5 text-[#DC2626]" />
          <span>Puri Coastal Ward 4, Odisha</span>
        </div>

        <button
          onClick={toggleDemoRole}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-[#F8F7F4] hover:bg-[#F3E8FF] text-[#1C1929] border border-[#E7E2DA] hover:border-[#7C3AED]/40 hover:text-[#7C3AED] shadow-xs transition-all cursor-pointer"
          title="Switch view to Authority Command Center"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span className="hidden sm:inline">Switch to Command HQ</span>
        </button>
      </div>
    </header>
  );
}
