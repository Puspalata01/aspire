"use client";

import React, { useEffect, useState } from "react";
import { AuthorityHeader } from "@/components/layout/AuthorityHeader";
import { api } from "@/lib/api";
import { Hospital } from "@/types";
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
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  useEffect(() => {
    api.getHospitals().then((data) => {
      if (data && data.length > 0) {
        setHospitals(data);
      }
    });
  }, []);

  const totalBeds = hospitals.reduce((acc, h) => acc + (h.totalBeds ?? h.bed_capacity ?? 0), 0) || 530;
  const totalAvailBeds = hospitals.reduce((acc, h) => acc + (h.availableBeds ?? 0), 0) || 65;
  const totalIcu = hospitals.reduce((acc, h) => acc + (h.icuBeds ?? h.icu_capacity ?? 0), 0) || 56;
  const totalAvailIcu = hospitals.reduce((acc, h) => acc + (h.availableIcuBeds ?? 0), 0) || 10;
  const totalAmbulances = hospitals.reduce((acc, h) => acc + (h.ambulanceCount ?? 0), 0) || 14;


  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] text-[#1C1929] flex flex-col select-none">
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
              <span className="w-3 h-3 rounded-full bg-[#7C3AED] animate-pulse" />
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-[#1C1929]">
                Hospital Trauma & ICU Surge
              </h2>
            </div>
            <p className="text-xs text-[#5D5775] leading-snug">
              ICU ventilator availability, oxygen tank reserves, auxiliary diesel generators, and floodwater basement ingress.
            </p>
          </div>

          {/* Right: 4 Visual KPI Cards */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: ICU Beds Available */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] shrink-0">
                <HeartPulse className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Free ICU Beds</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">{totalAvailIcu}</span>
                  <span className="text-[10px] font-bold text-[#F97316]">/ {totalIcu} Total</span>
                </div>
                <span className="text-[9px] text-[#EF4444]">High Surge Load</span>
              </div>
            </div>

            {/* KPI 2: General Ward Beds */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/15 border border-[#7C3AED]/30 flex items-center justify-center text-[#7C3AED] shrink-0">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">General Beds</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">{totalAvailBeds}</span>
                  <span className="text-[10px] font-mono text-[#16A34A]">/ {totalBeds}</span>
                </div>
                <span className="text-[9px] text-[#767092]">Trauma ready</span>
              </div>
            </div>

            {/* KPI 3: Fleet Ambulances Staged */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A] shrink-0">
                <Ambulance className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">ALS Ambulances</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">{totalAmbulances}</span>
                  <span className="text-[10px] font-mono text-[#16A34A]">Ready</span>
                </div>
                <span className="text-[9px] text-[#767092]">Telemetry linked</span>
              </div>
            </div>

            {/* KPI 4: Flood Inundation Danger */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#D97706]/15 border border-[#D97706]/30 flex items-center justify-center text-[#D97706] shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Flood Risk</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#EF4444]">1</span>
                  <span className="text-[10px] font-bold text-[#EF4444]">Critical</span>
                </div>
                <span className="text-[9px] text-[#767092]">CHC Brahmagiri (45cm)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. HOSPITAL CARDS GRID (Medical Vital Monitor Visuals)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hospitals.map((hosp) => {
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
                className="p-5 rounded-[18px] bg-white/95 border border-[#E7E2DA] backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)] flex flex-col justify-between gap-4 hover:border-[#7C3AED]/40 hover:shadow-[0_8px_24px_rgba(124,58,237,0.08)] transition-all"
              >
                {/* Header: Hospital Title & Flood Risk Badge */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/25 flex items-center justify-center text-[#EF4444] shrink-0">
                        <HeartPulse className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-[#1C1929] leading-snug">
                          {hosp.name}
                        </h3>
                        <p className="text-[10px] text-[#5D5775] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />
                          <span>{hosp.address}</span>
                        </p>
                      </div>
                    </div>

                    {/* Flood Risk Pill */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border shrink-0 ${
                        isCriticalFlood
                          ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30 animate-pulse"
                          : isMediumFlood
                          ? "bg-[#D97706]/15 text-[#D97706] border-[#D97706]/30"
                          : "bg-[#16A34A]/15 text-[#16A34A] border-[#16A34A]/30"
                      }`}
                    >
                      Flood: {hosp.floodRiskLevel}
                    </span>
                  </div>

                  {/* Contact number */}
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#767092] mt-2">
                    <Phone className="w-3 h-3 text-[#7C3AED]" />
                    <span>Emergency line: {hosp.contactNumber || "+91 6752 222000"}</span>
                  </div>
                </div>

                {/* ICU & General Beds Visual Ring & Track (Show Don't Tell) */}
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] flex items-center justify-between gap-3">
                  {/* ICU Ring Meter */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                        <circle cx="22" cy="22" r="18" stroke="rgba(0,0,0,0.08)" strokeWidth="4" fill="none" />
                        <circle
                          cx="22"
                          cy="22"
                          r="18"
                          stroke={icuPct >= 90 ? "#EF4444" : icuPct >= 75 ? "#F97316" : "#16A34A"}
                          strokeWidth="4"
                          strokeDasharray={2 * Math.PI * 18}
                          strokeDashoffset={2 * Math.PI * 18 * (1 - icuPct / 100)}
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-[11px] text-[#1C1929]">
                        {icuPct}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#5D5775] block font-medium">ICU Occupancy</span>
                      <div className="font-mono text-xs font-bold text-[#1C1929]">
                        {availIcu} / {icuCapacity} Free
                      </div>
                      <span className={`text-[9px] font-semibold ${icuPct >= 90 ? "text-[#EF4444]" : "text-[#16A34A]"}`}>
                        {icuPct >= 90 ? "Surge Critical" : "Ventilators Ready"}
                      </span>
                    </div>
                  </div>

                  {/* General Beds Stat */}
                  <div className="border-l border-[#E7E2DA] pl-3">
                    <span className="text-[10px] text-[#5D5775] block font-medium">General Ward</span>
                    <div className="font-mono text-sm font-bold text-[#1C1929]">
                      {hosp.availableBeds ?? 0} <span className="text-[10px] text-[#767092]">/ {hosp.totalBeds ?? hosp.bed_capacity ?? 0}</span>
                    </div>
                    <span className="text-[9px] text-[#767092]">Available</span>
                  </div>
                </div>

                {/* Vital Logistics Meters (Oxygen, Power, Flood Height) */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {/* Oxygen Supply */}
                  <div className={`p-2 rounded-xl border ${
                    isLowOxygen ? "bg-[#EF4444]/10 border-[#EF4444]/30" : "bg-[#FAF8F5] border-[#E7E2DA]"
                  }`}>
                    <span className="text-[9px] text-[#767092] block">Oxygen Tank</span>
                    <span className={`font-mono font-bold text-xs ${isLowOxygen ? "text-[#EF4444]" : "text-[#16A34A]"}`}>
                      {oxygenDays}d
                    </span>
                    <span className="text-[8px] text-[#5D5775] block mt-0.5">
                      {isLowOxygen ? "Refill Urgent" : "Normal"}
                    </span>
                  </div>

                  {/* Power Grid */}
                  <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA]">
                    <span className="text-[9px] text-[#767092] block">Power Grid</span>
                    <div className="flex items-center justify-center gap-1 font-mono font-bold text-xs text-[#16A34A]">
                      <Zap className="w-3 h-3" />
                      <span>{hosp.powerStatus === "grid_operational" ? "Grid" : "Genset"}</span>
                    </div>
                    <span className="text-[8px] text-[#5D5775] block mt-0.5 font-medium">100% Online</span>
                  </div>

                  {/* Water Inundation Level */}
                  <div className={`p-2 rounded-xl border ${
                    waterMm > 200 ? "bg-[#EF4444]/10 border-[#EF4444]/30" : "bg-[#FAF8F5] border-[#E7E2DA]"
                  }`}>
                    <span className="text-[9px] text-[#767092] block">Water Depth</span>
                    <span className={`font-mono font-bold text-xs ${waterMm > 200 ? "text-[#EF4444]" : "text-[#2563EB]"}`}>
                      {waterMm} mm
                    </span>
                    <span className="text-[8px] text-[#5D5775] block mt-0.5">
                      {waterMm > 200 ? "Pumps On" : "Clear"}
                    </span>
                  </div>
                </div>

                {/* Ambulance Fleet & Dispatch Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-[#E7E2DA]">
                  <div className="flex items-center gap-1.5 text-xs text-[#5D5775]">
                    <Ambulance className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span><strong>{hosp.ambulanceCount ?? 0}</strong> ALS Ambulances</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toast.success(`Ambulance airlift dispatch redirected to ${hosp.name}`)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-xs font-bold text-white shadow-[0_4px_16px_rgba(124,58,237,0.3)] flex items-center gap-1.5 cursor-pointer transition-all"
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
