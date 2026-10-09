"use client";

import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { MapboxView } from "@/components/map/MapboxView";
import { MapPin, Navigation, ShieldCheck } from "lucide-react";

export default function CitizenMapPage() {
  return (
    <div className="space-y-4 h-[calc(100vh-160px)] flex flex-col pb-16 md:pb-0 text-[#1C1929] select-none">
      <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-[#1C1929] tracking-tight">Safe Zones & Live Hazards</h1>
          <p className="text-xs text-[#5D5775]">Green hubs indicate open shelters with emergency power and medical rations.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#7C3AED] bg-[#F3E8FF] px-3.5 py-1.5 rounded-full border border-[#DDD6FE] shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>You are 1.4 km from Safety</span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 rounded-[24px] overflow-hidden border border-[#E7E2DA] shadow-sm bg-[#FAF8F5]">
        <MapboxView height="100%" />
      </div>
    </div>
  );
}
