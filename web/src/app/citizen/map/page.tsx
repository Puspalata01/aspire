"use client";

import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { MapboxView } from "@/components/map/MapboxView";
import { MapPin, Navigation, ShieldCheck } from "lucide-react";

export default function CitizenMapPage() {
  return (
    <div className="space-y-4 h-[calc(100vh-160px)] flex flex-col pb-16 md:pb-0">
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-xl font-bold text-[#1D1D1F]">Safe Zones & Live Hazards</h1>
          <p className="text-xs text-[#4A4A4F]">Green hubs indicate open shelters with emergency power and medical rations.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1D1D1F] bg-[#F1F1EF] px-3.5 py-1.5 rounded-full border border-[#D4D4D1] shadow-raise-1">
          <ShieldCheck className="w-4 h-4 text-[#2E9E6B]" />
          <span>You are 1.4 km from Safety</span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 rounded-[24px] overflow-hidden border border-[#D4D4D1] shadow-raise-2 bg-[#E2E2E0]">
        <MapboxView height="100%" />
      </div>
    </div>
  );
}
