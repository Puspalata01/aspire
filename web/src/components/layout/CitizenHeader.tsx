"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";
import { ShieldAlert, ArrowRightLeft, MapPin } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function CitizenHeader() {
  const { toggleDemoRole } = useAuthStore();

  return (
    <header className="h-16 border-b border-white/10 bg-[#060A13]/85 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 select-none">
      <Link href="/citizen" className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#3B6CFF] flex items-center justify-center text-white shadow-[0_0_16px_rgba(59,108,255,0.4)]">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-base text-[#F5F7FB] tracking-tight">
            {APP_CONFIG.name}
          </span>
          <span className="text-[10px] text-[#4FB3FF] font-bold ml-2 px-2.5 py-0.5 rounded-full bg-[#3B6CFF]/20 border border-[#3B6CFF]/40">
            CITIZEN SAFETY
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#8E99AF] bg-[#101624] px-3.5 py-1.5 rounded-full border border-white/10">
          <MapPin className="w-3.5 h-3.5 text-[#FF4D5E]" />
          <span>Puri Coastal Ward 4, Odisha</span>
        </div>

        <button
          onClick={toggleDemoRole}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-[#101624] hover:bg-[#161D2E] text-[#F5F7FB] border border-white/10 hover:border-[#3B6CFF]/40 shadow-sm transition-all cursor-pointer"
          title="Switch view to Authority Command Center"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-[#3B6CFF]" />
          <span className="hidden sm:inline">Switch to Command HQ</span>
        </button>
      </div>
    </header>
  );
}
