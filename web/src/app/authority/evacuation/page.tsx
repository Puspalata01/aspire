"use client";

import React, { useState } from "react";
import { AuthorityHeader } from "@/components/layout/AuthorityHeader";
import { MOCK_ROADS } from "@/lib/mock-data";
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

  const filteredRoads = MOCK_ROADS.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  return (
    <div className="w-full min-h-screen bg-[#05070D] text-[#F5F7FB] flex flex-col select-none">
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
              <span className="w-3 h-3 rounded-full bg-[#2FD07F] animate-pulse" />
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-[#F5F7FB]">
                Dynamic Evacuation Corridors
              </h2>
            </div>
            <p className="text-xs text-[#9AA3B8] leading-snug">
              Autonomous bottleneck dissipation, submerged asphalt detection, and real-time civilian bus routing away from flood crests.
            </p>
          </div>

          {/* Right: 4 Visual KPI Cards */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: Monitored Corridors */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#3B6CFF]/20 border border-[#3B6CFF]/40 flex items-center justify-center text-[#3B6CFF] shrink-0">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Total Corridors</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">14</span>
                  <span className="text-[10px] font-mono text-[#3B6CFF]">Monitored</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">State & NH Arterials</span>
              </div>
            </div>

            {/* KPI 2: Passable Routes */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#2FD07F]/20 border border-[#2FD07F]/40 flex items-center justify-center text-[#2FD07F] shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Clear / Open</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#2FD07F]">10</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">Passable</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Zero standing water</span>
              </div>
            </div>

            {/* KPI 3: Submerged / Blocked */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#FF4D5E]/20 border border-[#FF4D5E]/40 flex items-center justify-center text-[#FF4D5E] shrink-0">
                <Ban className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Blocked / Flooded</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#FF4D5E]">4</span>
                  <span className="text-[10px] font-bold text-[#FF4D5E]">Danger</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Marine Dr & SH-13</span>
              </div>
            </div>

            {/* KPI 4: Evacuation Velocity */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#F5C542]/20 border border-[#F5C542]/40 flex items-center justify-center text-[#F5C542] shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Convoys Cleared</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">2,450</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">Veh/hr</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Speed: 42 km/h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between bg-[#101624]/75 p-3 rounded-[16px] border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9AA3B8]">Filter Road Viability:</span>
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
                    ? "bg-[#3B6CFF] text-white shadow-[0_0_12px_rgba(59,108,255,0.4)]"
                    : "bg-[#161D2E] text-[#9AA3B8] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-[#6B7488] font-mono">
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
                className="p-5 rounded-[18px] bg-[#101624]/75 border border-white/10 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-4 hover:border-white/20 transition-all"
              >
                {/* Header: Road Title & Viability Sign */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isOpen
                        ? "bg-[#2FD07F]/20 border-[#2FD07F]/40 text-[#2FD07F]"
                        : isBlocked
                        ? "bg-[#FF4D5E]/20 border-[#FF4D5E]/40 text-[#FF4D5E]"
                        : "bg-[#3B6CFF]/20 border-[#3B6CFF]/40 text-[#3B6CFF]"
                    }`}>
                      {isOpen ? <CheckCircle2 className="w-5 h-5" /> : isBlocked ? <Ban className="w-5 h-5" /> : <Waves className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#F5F7FB] leading-tight">
                        {road.name}
                      </h4>
                      <p className="text-[10px] text-[#6B7488] font-mono mt-0.5">
                        ID: {road.id.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Visual Status Pill */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border shrink-0 ${
                      isOpen
                        ? "bg-[#2FD07F]/20 text-[#2FD07F] border-[#2FD07F]/40"
                        : isBlocked
                        ? "bg-[#FF4D5E]/20 text-[#FF4D5E] border-[#FF4D5E]/40"
                        : "bg-[#3B6CFF]/20 text-[#3B6CFF] border-[#3B6CFF]/40"
                    }`}
                  >
                    {isOpen ? "PASSABLE" : isBlocked ? "BLOCKED" : "SUBMERGED"}
                  </span>
                </div>

                {/* Visual Route Viability Track (Show Don't Tell) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#9AA3B8]">Viability Track:</span>
                    <span className={`font-mono font-bold ${
                      isOpen ? "text-[#2FD07F]" : isBlocked ? "text-[#FF4D5E]" : "text-[#4FB3FF]"
                    }`}>
                      {isOpen ? "100% Passable" : isBlocked ? "0% Impassable" : "40% 4WD Only"}
                    </span>
                  </div>

                  {/* Segmented Track Bar */}
                  <div className="h-2.5 w-full bg-[#161D2E] rounded-full overflow-hidden p-0.5 border border-white/5 flex gap-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-full flex-1 rounded-sm ${
                          isOpen
                            ? "bg-[#2FD07F]"
                            : isBlocked
                            ? i < 2 ? "bg-[#FF8A3D]" : "bg-[#FF4D5E]"
                            : i < 3 ? "bg-[#4FB3FF]" : "bg-[#FF4D5E]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Notes box */}
                <div className="bg-[#161D2E]/80 p-3 rounded-[14px] border border-white/5 text-xs text-[#9AA3B8] leading-relaxed">
                  <p className="italic">&ldquo;{road.notes}&rdquo;</p>
                  <div className="flex items-center justify-between text-[10px] text-[#6B7488] pt-2 mt-2 border-t border-white/5">
                    <span>{road.coordinates.length} Radar Waypoints</span>
                    <span className="font-mono text-[#4FB3FF]">Live Telemetry</span>
                  </div>
                </div>

                {/* Action CTA */}
                <button
                  type="button"
                  onClick={() => toast.success(`Traffic diversion orders transmitted for ${road.name}`)}
                  className="w-full py-2 rounded-xl bg-white/5 hover:bg-[#3B6CFF] text-[#F5F7FB] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10 hover:border-transparent"
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
