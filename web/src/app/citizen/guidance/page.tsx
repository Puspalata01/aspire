"use client";

import React from "react";
import { BookOpen, Check, X, ShieldAlert, Droplets, Wind, Zap } from "lucide-react";

export default function CitizenGuidancePage() {
  return (
    <div className="space-y-6 pb-20 md:pb-8 text-[#1C1929] select-none">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1929] tracking-tight">Disaster Survival & Offline Protocols</h1>
        <p className="text-xs text-[#5D5775] mt-1">
          Essential life-saving rules during severe cyclonic gales and flash flood inundation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cyclone protocols */}
        <div className="p-6 rounded-[24px] border border-[#E7E2DA] bg-white/95 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E7E2DA]">
            <Wind className="w-5 h-5 text-[#7C3AED]" />
            <h3 className="text-sm font-bold text-[#1C1929]">Severe Cyclone Safety (130+ km/h)</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5 text-[#5D5775]">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Turn off main electrical breaker switch and gas cylinder regulator immediately.</span>
            </div>
            <div className="flex items-start gap-2.5 text-[#5D5775]">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Stay away from glass windows; seek shelter in reinforced interior corridor or bathroom.</span>
            </div>
            <div className="flex items-start gap-2.5 text-[#5D5775]">
              <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>DO NOT step outside during the &apos;Eye of the Storm&apos; (temporary calm). Gale winds will reverse abruptly.</span>
            </div>
          </div>
        </div>

        {/* Flood protocols */}
        <div className="p-6 rounded-[24px] border border-[#E7E2DA] bg-white/95 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E7E2DA]">
            <Droplets className="w-5 h-5 text-[#7C3AED]" />
            <h3 className="text-sm font-bold text-[#1C1929]">Flash Flood & River Breach Safety</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5 text-[#5D5775]">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Move immediately to upper stories or designated high ground without waiting.</span>
            </div>
            <div className="flex items-start gap-2.5 text-[#5D5775]">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Keep essential documents sealed in double waterproof plastic pouches.</span>
            </div>
            <div className="flex items-start gap-2.5 text-[#5D5775]">
              <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>Never attempt to wade or drive across submerged roadways or culverts. Six inches of rushing water can knock down an adult.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
