"use client";
import React, { useEffect, useState } from "react";

import { AuthorityHeader } from "@/components/layout/AuthorityHeader";
import { api } from "@/lib/api";
import { RoadSegment } from "@/types";
import {
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Ban,
  Compass,
  Waves,
  Send,
  ArrowRight,
  ShieldAlert,
  Car,
  Gauge,
} from "lucide-react";
import { toast } from "sonner";

export default function AuthorityEvacuationPage() {
  const [filter, setFilter] = useState<string>("all");
  const [roads, setRoads] = useState<RoadSegment[]>([]);

  useEffect(() => {
    api.getRoads().then((data) => {
      if (data && data.length > 0) {
        setRoads(data);
      }
    });
  }, []);

  const filteredRoads = roads.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });


  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] text-[#1C1929] flex flex-col select-none">
      {/* Top Standard Authority Header */}
      <AuthorityHeader pageTitle="Evacuation Corridors & Road Safety" />

      {/* Main Workspace Area */}
      <div className="flex-1 p-4 lg:p-6 flex flex-col gap-4 max-w-[1600px] w-full mx-auto">
        {/* ─────────────────────────────────────────────────────────────
            1. TITLE & TOP 4 VISUAL KPI CARDS ROW (Universal Visual Comprehension)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Left: Title & Subtitle */}
          <div className="lg:col-span-4 flex flex-col justify-center gap-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#16A34A] animate-pulse" />
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-[#1C1929]">
                Dynamic Evacuation Corridors
              </h2>
            </div>
            <p className="text-xs text-[#5D5775] leading-snug">
              Autonomous bottleneck dissipation, submerged asphalt detection, and real-time civilian bus routing away from flood crests.
            </p>
          </div>

          {/* Right: 4 Visual KPI Cards */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: Monitored Corridors */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/15 border border-[#7C3AED]/30 flex items-center justify-center text-[#7C3AED] shrink-0">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Total Corridors</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">14</span>
                  <span className="text-[10px] font-mono text-[#7C3AED]">Monitored</span>
                </div>
                <span className="text-[9px] text-[#767092]">State & NH Arterials</span>
              </div>
            </div>

            {/* KPI 2: Passable Routes */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A] shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Clear / Open</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#16A34A]">10</span>
                  <span className="text-[10px] font-mono text-[#16A34A]">Passable</span>
                </div>
                <span className="text-[9px] text-[#767092]">Zero standing water</span>
              </div>
            </div>

            {/* KPI 3: Submerged / Blocked */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] shrink-0">
                <Ban className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Blocked / Flooded</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#EF4444]">4</span>
                  <span className="text-[10px] font-bold text-[#EF4444]">Danger</span>
                </div>
                <span className="text-[9px] text-[#767092]">Marine Dr & SH-13</span>
              </div>
            </div>

            {/* KPI 4: Evacuation Velocity */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#D97706]/15 border border-[#D97706]/30 flex items-center justify-center text-[#D97706] shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Convoys Cleared</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">2,450</span>
                  <span className="text-[10px] font-mono text-[#16A34A]">Veh/hr</span>
                </div>
                <span className="text-[9px] text-[#767092]">Speed: 42 km/h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between bg-white/95 p-3 rounded-[16px] border border-[#E7E2DA] backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5D5775]">Filter Road Viability:</span>
            {[
              { id: "all", label: "All Routes" },
              { id: "open", label: "🟢 Open & Safe" },
              { id: "blocked", label: "🔴 Impassable / Blocked" },
              { id: "under_water", label: "🌊 Submerged" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === tab.id
                    ? "bg-[#7C3AED] text-white shadow-[0_2px_8px_rgba(124,58,237,0.3)]"
                    : "bg-[#FAF8F5] text-[#5D5775] hover:text-[#1C1929] border border-[#E7E2DA]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-[#767092] font-mono font-medium">
            <span>🟢 PASSABLE</span>
            <span>🟡 SLOW / BOGGY</span>
            <span>🔴 IMPASSABLE</span>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. EVACUATION ROUTE CARDS GRID (Show Don't Tell Visuals)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredRoads.map((road) => {
            const isOpen = road.status === "open";
            const isBlocked = road.status === "blocked";
            const isWater = road.status === "under_water";

            return (
              <div
                key={road.id}
                className="p-5 rounded-[18px] bg-white/95 border border-[#E7E2DA] backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)] flex flex-col justify-between gap-4 hover:border-[#7C3AED]/40 hover:shadow-[0_8px_24px_rgba(124,58,237,0.08)] transition-all"
              >
                {/* Header: Road Title & Viability Sign */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isOpen
                        ? "bg-[#16A34A]/15 border-[#16A34A]/30 text-[#16A34A]"
                        : isBlocked
                        ? "bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]"
                        : "bg-[#7C3AED]/15 border-[#7C3AED]/30 text-[#7C3AED]"
                    }`}>
                      {isOpen ? <CheckCircle2 className="w-5 h-5" /> : isBlocked ? <Ban className="w-5 h-5" /> : <Waves className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1C1929] leading-tight">
                        {road.name}
                      </h4>
                      <p className="text-[10px] text-[#767092] font-mono mt-0.5">
                        ID: {road.id.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Visual Status Pill */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border shrink-0 ${
                      isOpen
                        ? "bg-[#16A34A]/15 text-[#16A34A] border-[#16A34A]/30"
                        : isBlocked
                        ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30"
                        : "bg-[#7C3AED]/15 text-[#7C3AED] border-[#7C3AED]/30"
                    }`}
                  >
                    {isOpen ? "PASSABLE" : isBlocked ? "BLOCKED" : "SUBMERGED"}
                  </span>
                </div>

                {/* Visual Route Viability Track (Show Don't Tell) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#5D5775]">Viability Track:</span>
                    <span className={`font-mono font-bold ${
                      isOpen ? "text-[#16A34A]" : isBlocked ? "text-[#EF4444]" : "text-[#7C3AED]"
                    }`}>
                      {isOpen ? "100% Passable" : isBlocked ? "0% Impassable" : "40% 4WD Only"}
                    </span>
                  </div>

                  {/* Segmented Track Bar */}
                  <div className="h-2.5 w-full bg-[#FAF8F5] rounded-full overflow-hidden p-0.5 border border-[#E7E2DA] flex gap-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-full flex-1 rounded-sm ${
                          isOpen
                            ? "bg-[#16A34A]"
                            : isBlocked
                            ? i < 2 ? "bg-[#F97316]" : "bg-[#EF4444]"
                            : i < 3 ? "bg-[#7C3AED]" : "bg-[#EF4444]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Notes box */}
                <div className="bg-[#FAF8F5] p-3 rounded-[14px] border border-[#E7E2DA] text-xs text-[#5D5775] leading-relaxed">
                  <p className="italic">&ldquo;{road.notes}&rdquo;</p>
                  <div className="flex items-center justify-between text-[10px] text-[#767092] pt-2 mt-2 border-t border-[#E7E2DA]">
                    <span>{road.coordinates.length} Radar Waypoints</span>
                    <span className="font-mono text-[#7C3AED] font-semibold">Live Telemetry</span>
                  </div>
                </div>

                {/* Action CTA */}
                <button
                  type="button"
                  onClick={() => toast.success(`Traffic diversion orders transmitted for ${road.name}`)}
                  className="w-full py-2 rounded-xl bg-white hover:bg-[#7C3AED] hover:text-white text-[#7C3AED] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#E7E2DA] shadow-sm hover:border-[#7C3AED]"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>
                    {isOpen ? "Broadcast Clear Route" : "Issue Diversion Bypass"}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
