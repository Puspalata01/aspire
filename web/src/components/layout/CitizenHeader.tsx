"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";
import { ShieldAlert, ArrowRightLeft, MapPin } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function CitizenHeader() {
  const { toggleDemoRole } = useAuthStore();

  return (
    <header className="h-16 border-b border-[#D4D4D1] bg-[#E9E9E7] shadow-raise-1 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      <Link href="/citizen/home" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#F1F1EF] shadow-raise-2 flex items-center justify-center text-[#2F6FE0]">
          <ShieldAlert className="w-5 h-5 text-[#2F6FE0]" />
        </div>
        <div>
          <span className="font-extrabold text-base text-[#1D1D1F] tracking-tight">
            {APP_CONFIG.name}
          </span>
          <span className="text-[10px] text-[#2F6FE0] font-bold ml-2 px-2.5 py-0.5 rounded-full bg-[#F1F1EF] shadow-raise-1 border border-[#2F6FE0]/30">
            CITIZEN SAFETY
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#4A4A4F] bg-[#F1F1EF] px-3.5 py-1.5 rounded-full shadow-raise-1 border border-[#D4D4D1]">
          <MapPin className="w-3.5 h-3.5 text-[#D64545]" />
          <span>Puri Coastal Ward 4, Odisha</span>
        </div>

        <button
          onClick={toggleDemoRole}
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-[#F1F1EF] text-[#1D1D1F] shadow-raise-1 hover:shadow-raise-2 active:shadow-sink-1 transition-all cursor-pointer"
          title="Switch view to Authority Command Center"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-[#2F6FE0]" />
          <span className="hidden sm:inline">Switch to Command HQ</span>
        </button>
      </div>
    </header>
  );
}
