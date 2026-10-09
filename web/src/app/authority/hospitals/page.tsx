"use client";

import React from "react";
import { AuthorityHeader } from "@/components/layout/AuthorityHeader";
import { MOCK_HOSPITALS } from "@/lib/mock-data";
import {
  HeartPulse,
  Zap,
  Droplets,
  Ambulance,
  Phone,
  MapPin,
  Send,
  Bed,
} from "lucide-react";
import { toast } from "sonner";

export default function AuthorityHospitalsPage() {
  const totalBeds = MOCK_HOSPITALS.reduce((acc, h) => acc + (h.totalBeds ?? h.bed_capacity ?? 0), 0);
  const totalAvailBeds = MOCK_HOSPITALS.reduce((acc, h) => acc + (h.availableBeds ?? 0), 0);
  const totalIcu = MOCK_HOSPITALS.reduce((acc, h) => acc + (h.icuBeds ?? h.icu_capacity ?? 0), 0);
  const totalAvailIcu = MOCK_HOSPITALS.reduce((acc, h) => acc + (h.availableIcuBeds ?? 0), 0);
  const totalAmbulances = MOCK_HOSPITALS.reduce((acc, h) => acc + (h.ambulanceCount ?? 0), 0);

  return (
    <div className="w-full min-h-screen bg-[#05070D] text-[#F5F7FB] flex flex-col select-none">
      {/* Top Standard Authority Header */}
      <AuthorityHeader pageTitle="Healthcare Surge & ICU Resilience" />

      {/* Main Workspace Area */}
      <div className="flex-1 p-4 lg:p-6 flex flex-col gap-4 max-w-[1600px] w-full mx-auto">
        {/* ─────────────────────────────────────────────────────────────
            1. TITLE & TOP 4 VISUAL KPI CARDS ROW (Universal Visual Comprehension)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Left: Title & Subtitle */}
          <div className="lg:col-span-4 flex flex-col justify-center gap-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#3B6CFF] animate-pulse" />
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-[#F5F7FB]">
                Hospital Trauma & ICU Surge
              </h2>
            </div>
            <p className="text-xs text-[#9AA3B8] leading-snug">
              ICU ventilator availability, oxygen tank reserves, auxiliary diesel generators, and floodwater basement ingress.
            </p>
          </div>

          {/* Right: 4 Visual KPI Cards */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: ICU Beds Available */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#FF4D5E]/20 border border-[#FF4D5E]/40 flex items-center justify-center text-[#FF4D5E] shrink-0">
                <HeartPulse className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Free ICU Beds</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">{totalAvailIcu}</span>
                  <span className="text-[10px] font-bold text-[#FF8A3D]">/ {totalIcu} Total</span>
                </div>
                <span className="text-[9px] text-[#FF4D5E]">High Surge Load</span>
              </div>
            </div>

            {/* KPI 2: General Ward Beds */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#3B6CFF]/20 border border-[#3B6CFF]/40 flex items-center justify-center text-[#3B6CFF] shrink-0">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">General Beds</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">{totalAvailBeds}</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">/ {totalBeds}</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Trauma ready</span>
              </div>
            </div>

            {/* KPI 3: Fleet Ambulances Staged */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#2FD07F]/20 border border-[#2FD07F]/40 flex items-center justify-center text-[#2FD07F] shrink-0">
                <Ambulance className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">ALS Ambulances</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">{totalAmbulances}</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">Ready</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Telemetry linked</span>
              </div>
            </div>

            {/* KPI 4: Flood Inundation Danger */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#F5C542]/20 border border-[#F5C542]/40 flex items-center justify-center text-[#F5C542] shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Flood Risk</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#FF4D5E]">1</span>
                  <span className="text-[10px] font-bold text-[#FF4D5E]">Critical</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">CHC Brahmagiri (45cm)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. HOSPITAL CARDS GRID (Medical Vital Monitor Visuals)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_HOSPITALS.map((hosp) => {
            const icuCapacity = hosp.icuBeds ?? hosp.icu_capacity ?? 1;
            const availIcu = hosp.availableIcuBeds ?? 0;
            const icuOccupied = Math.max(icuCapacity - availIcu, 0);
            const icuPct = Math.round((icuOccupied / icuCapacity) * 100);
            const isCriticalFlood = hosp.floodRiskLevel === "critical";
            const isMediumFlood = hosp.floodRiskLevel === "medium";
            const oxygenDays = hosp.oxygenDaysRemaining ?? 5;
            const isLowOxygen = oxygenDays < 2.0;
            const waterMm = hosp.waterLevelMm ?? 0;

            return (
              <div
                key={hosp.id}
                className="p-5 rounded-[18px] bg-[#101624]/75 border border-white/10 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-4 hover:border-white/20 transition-all"
              >
                {/* Header: Hospital Title & Flood Risk Badge */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF4D5E] shrink-0">
                        <HeartPulse className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-[#F5F7FB] leading-snug">
                          {hosp.name}
                        </h3>
                        <p className="text-[10px] text-[#9AA3B8] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#FF4D5E] shrink-0" />
                          <span>{hosp.address}</span>
                        </p>
                      </div>
                    </div>

                    {/* Flood Risk Pill */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border shrink-0 ${
                        isCriticalFlood
                          ? "bg-[#FF4D5E]/20 text-[#FF4D5E] border-[#FF4D5E]/40 animate-pulse"
                          : isMediumFlood
                          ? "bg-[#F5C542]/20 text-[#F5C542] border-[#F5C542]/40"
                          : "bg-[#2FD07F]/20 text-[#2FD07F] border-[#2FD07F]/40"
                      }`}
                    >
                      Flood: {hosp.floodRiskLevel}
                    </span>
                  </div>

                  {/* Contact number */}
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#6B7488] mt-2">
                    <Phone className="w-3 h-3 text-[#3B6CFF]" />
                    <span>Emergency line: {hosp.contactNumber || "+91 6752 222000"}</span>
                  </div>
                </div>

                {/* ICU & General Beds Visual Ring & Track (Show Don't Tell) */}
                <div className="p-3.5 rounded-xl bg-[#161D2E]/80 border border-white/5 flex items-center justify-between gap-3">
                  {/* ICU Ring Meter */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                        <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
                        <circle
                          cx="22"
                          cy="22"
                          r="18"
                          stroke={icuPct >= 90 ? "#FF4D5E" : icuPct >= 75 ? "#FF8A3D" : "#2FD07F"}
                          strokeWidth="4"
                          strokeDasharray={2 * Math.PI * 18}
                          strokeDashoffset={2 * Math.PI * 18 * (1 - icuPct / 100)}
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-[11px] text-[#F5F7FB]">
                        {icuPct}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9AA3B8] block">ICU Occupancy</span>
                      <div className="font-mono text-xs font-bold text-[#F5F7FB]">
                        {availIcu} / {icuCapacity} Free
                      </div>
                      <span className={`text-[9px] font-semibold ${icuPct >= 90 ? "text-[#FF4D5E]" : "text-[#2FD07F]"}`}>
                        {icuPct >= 90 ? "Surge Critical" : "Ventilators Ready"}
                      </span>
                    </div>
                  </div>

                  {/* General Beds Stat */}
                  <div className="border-l border-white/10 pl-3">
                    <span className="text-[10px] text-[#9AA3B8] block">General Ward</span>
                    <div className="font-mono text-sm font-bold text-[#F5F7FB]">
                      {hosp.availableBeds ?? 0} <span className="text-[10px] text-[#6B7488]">/ {hosp.totalBeds ?? hosp.bed_capacity ?? 0}</span>
                    </div>
                    <span className="text-[9px] text-[#6B7488]">Available</span>
                  </div>
                </div>

                {/* Vital Logistics Meters (Oxygen, Power, Flood Height) */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {/* Oxygen Supply */}
                  <div className={`p-2 rounded-xl border ${
                    isLowOxygen ? "bg-[#FF4D5E]/10 border-[#FF4D5E]/30" : "bg-white/5 border-white/5"
                  }`}>
                    <span className="text-[9px] text-[#6B7488] block">Oxygen Tank</span>
                    <span className={`font-mono font-bold text-xs ${isLowOxygen ? "text-[#FF4D5E]" : "text-[#2FD07F]"}`}>
                      {oxygenDays}d
                    </span>
                    <span className="text-[8px] text-[#9AA3B8] block mt-0.5">
                      {isLowOxygen ? "Refill Urgent" : "Normal"}
                    </span>
                  </div>

                  {/* Power Grid */}
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[9px] text-[#6B7488] block">Power Grid</span>
                    <div className="flex items-center justify-center gap-1 font-mono font-bold text-xs text-[#2FD07F]">
                      <Zap className="w-3 h-3" />
                      <span>{hosp.powerStatus === "grid_operational" ? "Grid" : "Genset"}</span>
                    </div>
                    <span className="text-[8px] text-[#9AA3B8] block mt-0.5">100% Online</span>
                  </div>

                  {/* Water Inundation Level */}
                  <div className={`p-2 rounded-xl border ${
                    waterMm > 200 ? "bg-[#FF4D5E]/10 border-[#FF4D5E]/30" : "bg-white/5 border-white/5"
                  }`}>
                    <span className="text-[9px] text-[#6B7488] block">Water Depth</span>
                    <span className={`font-mono font-bold text-xs ${waterMm > 200 ? "text-[#FF4D5E]" : "text-[#4FB3FF]"}`}>
                      {waterMm} mm
                    </span>
                    <span className="text-[8px] text-[#9AA3B8] block mt-0.5">
                      {waterMm > 200 ? "Pumps On" : "Clear"}
                    </span>
                  </div>
                </div>

                {/* Ambulance Fleet & Dispatch Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-[#9AA3B8]">
                    <Ambulance className="w-3.5 h-3.5 text-[#3B6CFF]" />
                    <span><strong>{hosp.ambulanceCount ?? 0}</strong> ALS Ambulances</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toast.success(`Ambulance airlift dispatch redirected to ${hosp.name}`)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#3B6CFF] hover:bg-[#325bd4] text-xs font-bold text-white shadow-[0_0_12px_rgba(59,108,255,0.3)] flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Route Trauma</span>
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
