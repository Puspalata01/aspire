"use client";

import React, { useEffect, useState } from "react";
import { AuthorityHeader } from "@/components/layout/AuthorityHeader";
import { api } from "@/lib/api";
import { Shelter } from "@/types";
import { CapacityBar } from "@/components/shared/CapacityBar";
import {
  Home,
  MapPin,
  Phone,
  Users,
  ShieldCheck,
  AlertTriangle,
  Droplets,
  Zap,
  Utensils,
  HeartPulse,
  Navigation,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function AuthoritySheltersPage() {
  const [filter, setFilter] = useState<"all" | "open" | "full">("all");
  const [shelters, setShelters] = useState<Shelter[]>([]);

  useEffect(() => {
    api.getShelters().then((data) => {
      if (data && data.length > 0) {
        setShelters(data);
      }
    });
  }, []);

  const totalCap = shelters.reduce((acc, s) => acc + s.capacity, 0) || 5150;
  const totalOcc = shelters.reduce((acc, s) => acc + (s.currentOccupancy ?? s.current_occupancy ?? 0), 0) || 3080;
  const overallPct = Math.round((totalOcc / (totalCap || 1)) * 100);

  const filteredShelters = shelters.filter((s) => {
    if (filter === "open") return s.status === "open";
    if (filter === "full") return s.status === "full";
    return true;
  });


  return (
    <div className="w-full min-h-screen bg-[#05070D] text-[#F5F7FB] flex flex-col select-none">
      {/* Top Standard Authority Header */}
      <AuthorityHeader pageTitle="Cyclone & Flood Shelter Network" />

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
                Shelter Command Network
              </h2>
            </div>
            <p className="text-xs text-[#9AA3B8] leading-snug">
              Real-time evacuee intake capacity, generator power reserves, potable water purifiers, and ration supplies.
            </p>
          </div>

          {/* Right: 4 Visual KPI Cards */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: Active Shelters */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#2FD07F]/20 border border-[#2FD07F]/40 flex items-center justify-center text-[#2FD07F] shrink-0">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Active Shelters</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">86</span>
                  <span className="text-[10px] font-bold text-[#2FD07F]">/ 120 Total</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">34 Pre-staged</span>
              </div>
            </div>

            {/* KPI 2: Total Sheltered Citizens */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#3B6CFF]/20 border border-[#3B6CFF]/40 flex items-center justify-center text-[#3B6CFF] shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Total Sheltered</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">32,450</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">Safe</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Zero casualties</span>
              </div>
            </div>

            {/* KPI 3: Network Capacity Dial */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="#F5C542"
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 16}
                    strokeDashoffset={2 * Math.PI * 16 * (1 - overallPct / 100)}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-[#F5F7FB]">
                  {overallPct}%
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Network Load</span>
                <span className="text-xs font-bold text-[#F5C542] block">
                  {totalOcc.toLocaleString()} / {totalCap.toLocaleString()}
                </span>
                <span className="text-[9px] text-[#6B7488]">Beds available</span>
              </div>
            </div>

            {/* KPI 4: Ration & Water Reserves */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#4FB3FF]/20 border border-[#4FB3FF]/40 flex items-center justify-center text-[#4FB3FF] shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Ration Reserve</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">4.5d</span>
                  <span className="text-[10px] font-bold text-[#2FD07F]">Stocked</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">RO Purified & Dry food</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between bg-[#101624]/75 p-3 rounded-[16px] border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9AA3B8]">Filter Capacity:</span>
            <div className="flex gap-1.5">
              {(["all", "open", "full"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    filter === tab
                      ? "bg-[#3B6CFF] text-white shadow-[0_0_12px_rgba(59,108,255,0.4)]"
                      : "bg-[#161D2E] text-[#9AA3B8] hover:text-white"
                  }`}
                >
                  {tab === "all" ? "All Shelters (4)" : tab === "open" ? "Open & Available" : "Full / At Capacity"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#6B7488] font-mono">
            <span>🟢 Normal (&lt;70%)</span>
            <span>🟡 High (70-85%)</span>
            <span>🔴 Full (&gt;85%)</span>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. SHELTER CARDS GRID (Show Don't Tell - Visual Rings & Amenities)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredShelters.map((sh) => {
            const occ = sh.currentOccupancy ?? 0;
            const pct = Math.min(Math.round((occ / sh.capacity) * 100), 100);
            const isFull = pct >= 95 || sh.status === "full";
            const isWarning = pct >= 75 && !isFull;

            return (
              <div
                key={sh.id}
                className="p-5 rounded-[18px] bg-[#101624]/75 border border-white/10 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-4 hover:border-white/20 transition-all"
              >
                {/* Header: Shelter Title & Capacity Ring */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#2FD07F] shrink-0 mt-0.5">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F5F7FB] leading-snug">
                        {sh.name}
                      </h3>
                      <p className="text-xs text-[#9AA3B8] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#FF4D5E] shrink-0" />
                        <span>{sh.address}</span>
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-[#6B7488] mt-1">
                        <span className="flex items-center gap-1">
                          <Compass className="w-3 h-3 text-[#3B6CFF]" />
                          <span>{sh.distanceKm} km away</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-[#2FD07F]" />
                          <span>{sh.contactPhone}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Circular Occupancy Dial (Show Don't Tell) */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 52 52">
                        <circle
                          cx="26"
                          cy="26"
                          r="22"
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth="4.5"
                          fill="none"
                        />
                        <circle
                          cx="26"
                          cy="26"
                          r="22"
                          stroke={isFull ? "#FF4D5E" : isWarning ? "#FF8A3D" : "#2FD07F"}
                          strokeWidth="4.5"
                          strokeDasharray={2 * Math.PI * 22}
                          strokeDashoffset={2 * Math.PI * 22 * (1 - pct / 100)}
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-[#F5F7FB]">
                        {pct}%
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase mt-1 px-2 py-0.2 rounded-full border ${
                        isFull
                          ? "bg-[#FF4D5E]/20 text-[#FF4D5E] border-[#FF4D5E]/40"
                          : isWarning
                          ? "bg-[#FF8A3D]/20 text-[#FF8A3D] border-[#FF8A3D]/40"
                          : "bg-[#2FD07F]/20 text-[#2FD07F] border-[#2FD07F]/40"
                      }`}
                    >
                      {isFull ? "FULL" : "OPEN"}
                    </span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <CapacityBar
                  current={occ}
                  total={sh.capacity}
                  label="Evacuee Inflow Status"
                  unit="people"
                />

                {/* Visual Amenity Inventory Badges (Show Don't Tell) */}
                <div className="bg-[#161D2E]/80 p-3 rounded-[14px] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#9AA3B8]">
                    <span className="font-semibold">Facility Operational Readiness:</span>
                    <span className="text-[#2FD07F] font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100% Operational
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-white/5 flex items-center gap-2 border border-white/5">
                      <Droplets className="w-4 h-4 text-[#4FB3FF] shrink-0" />
                      <div>
                        <span className="text-[10px] text-[#6B7488] block">RO Water</span>
                        <span className="font-bold text-[#F5F7FB] text-[11px]">88% Full</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white/5 flex items-center gap-2 border border-white/5">
                      <Utensils className="w-4 h-4 text-[#F5C542] shrink-0" />
                      <div>
                        <span className="text-[10px] text-[#6B7488] block">Rations</span>
                        <span className="font-bold text-[#F5F7FB] text-[11px]">5 Days</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white/5 flex items-center gap-2 border border-white/5">
                      <Zap className="w-4 h-4 text-[#2FD07F] shrink-0" />
                      <div>
                        <span className="text-[10px] text-[#6B7488] block">Genset</span>
                        <span className="font-bold text-[#F5F7FB] text-[11px]">Active</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white/5 flex items-center gap-2 border border-white/5">
                      <HeartPulse className="w-4 h-4 text-[#FF4D5E] shrink-0" />
                      <div>
                        <span className="text-[10px] text-[#6B7488] block">Medic</span>
                        <span className="font-bold text-[#F5F7FB] text-[11px]">On Duty</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5">
                  <div className="text-[11px] text-[#6B7488]">
                    <span>Remaining capacity: </span>
                    <strong className="text-[#F5F7FB]">{Math.max(sh.capacity - occ, 0)} slots</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => toast.success(`Evacuation convoy route generated for ${sh.name}!`)}
                    className="px-4 py-1.5 rounded-xl bg-[#3B6CFF] hover:bg-[#325bd4] text-xs font-bold text-white shadow-[0_0_12px_rgba(59,108,255,0.3)] flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Route Convoys</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
