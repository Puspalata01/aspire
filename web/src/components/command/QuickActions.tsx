"use client";

import React from "react";
import {
  Megaphone,
  Radio,
  Navigation,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

export function QuickActions() {
  const handleBroadcast = () => {
    toast.success("Broadcast dispatched to 284,500 registered mobile devices via CAP/Cell Broadcast.");
  };

  const handleSiren = () => {
    toast.error("Emergency Siren Activated in Ward 4 & Marine Drive Sector.");
  };

  const handleNDRFDivert = () => {
    toast.info("NDRF Bravo-3 boat team redirected to Daya embankment breach.");
  };

  return (
    <div className="rounded-[24px] bg-[#F1F1EF] p-5 shadow-raise-2 border border-[#D4D4D1]/40 select-none">
      <div className="flex items-center justify-between pb-3 border-b border-[#D4D4D1]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-[#2F6FE0]" />
          Tactical Command Dispatch Actions
        </h3>
        <span className="text-[10px] text-[#8A8A90] font-mono">1-TAP RESPONSE</span>
      </div>

      {/* ── Big Raised Action Buttons (Only Siren is Red) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        {/* Action 1: Standard Raised Button with Round Icon + Short Label */}
        <button
          type="button"
          onClick={handleBroadcast}
          className="h-28 rounded-[20px] bg-[#F1F1EF] shadow-raise-2 hover:shadow-raise-3 active:shadow-sink-1 transition-all duration-160 flex flex-col items-center justify-center gap-2.5 cursor-pointer border border-[#D4D4D1]/50 group"
        >
          <div className="w-12 h-12 rounded-full bg-[#E2E2E0] shadow-sink-1 flex items-center justify-center text-[#2F6FE0] group-hover:scale-105 transition-transform">
            <Megaphone className="w-5 h-5 text-[#2F6FE0]" />
          </div>
          <span className="text-xs font-bold text-[#1D1D1F] tracking-tight">
            CAP Broadcast
          </span>
        </button>

        {/* Action 2: Red Raised Button (ONLY Siren is Red) */}
        <button
          type="button"
          onClick={handleSiren}
          className="h-28 rounded-[20px] bg-[#D64545] text-white shadow-raise-2 hover:shadow-raise-3 active:shadow-sink-1 transition-all duration-160 flex flex-col items-center justify-center gap-2.5 cursor-pointer border border-[#C53030] group"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 shadow-inner flex items-center justify-center text-white group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-bold text-white tracking-tight">
            Sound Sirens
          </span>
        </button>

        {/* Action 3: Standard Raised Button with Round Icon + Short Label */}
        <button
          type="button"
          onClick={handleNDRFDivert}
          className="h-28 rounded-[20px] bg-[#F1F1EF] shadow-raise-2 hover:shadow-raise-3 active:shadow-sink-1 transition-all duration-160 flex flex-col items-center justify-center gap-2.5 cursor-pointer border border-[#D4D4D1]/50 group"
        >
          <div className="w-12 h-12 rounded-full bg-[#E2E2E0] shadow-sink-1 flex items-center justify-center text-[#2F6FE0] group-hover:scale-105 transition-transform">
            <Navigation className="w-5 h-5 text-[#2F6FE0]" />
          </div>
          <span className="text-xs font-bold text-[#1D1D1F] tracking-tight">
            Divert Boat
          </span>
        </button>
      </div>
    </div>
  );
}
