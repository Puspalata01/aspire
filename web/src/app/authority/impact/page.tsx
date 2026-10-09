"use client";

import React from "react";
import { AuthorityHeader } from "@/components/layout/AuthorityHeader";
import {
  DollarSign,
  Home,
  TrendingUp,
  Building,
  Zap,
  Wheat,
  ShieldAlert,
  Layers,
  MapPin,
  CheckCircle2,
} from "lucide-react";

export default function AuthorityImpactPage() {
  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] text-[#1C1929] flex flex-col select-none">
      {/* Top Standard Authority Header */}
      <AuthorityHeader pageTitle="Disaster Impact & Loss Assessment" />

      {/* Main Workspace Area */}
      <div className="flex-1 p-4 lg:p-6 flex flex-col gap-4 max-w-[1600px] w-full mx-auto">
        {/* ─────────────────────────────────────────────────────────────
            1. TITLE & TOP 4 VISUAL KPI CARDS ROW (Universal Visual Comprehension)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Left: Title & Subtitle */}
          <div className="lg:col-span-4 flex flex-col justify-center gap-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#EF4444] animate-pulse" />
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-[#1C1929]">
                Structural Loss Assessment
              </h2>
            </div>
            <p className="text-xs text-[#5D5775] leading-snug">
              Satellite multispectral SAR change detection, agricultural flood inundation loss, and public infrastructure rehabilitation modeling.
            </p>
          </div>

          {/* Right: 4 Visual KPI Cards */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: Estimated Economic Loss */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Economic Loss</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#EF4444]">₹42 Cr</span>
                  <span className="text-[10px] font-mono text-[#EF4444]">Estimated</span>
                </div>
                <span className="text-[9px] text-[#767092]">Crops & bridges</span>
              </div>
            </div>

            {/* KPI 2: Homes Damaged */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#F97316]/15 border border-[#F97316]/30 flex items-center justify-center text-[#F97316] shrink-0">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Kutcha Homes</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">4,820</span>
                  <span className="text-[10px] font-mono text-[#F97316]">Damaged</span>
                </div>
                <span className="text-[9px] text-[#767092]">Coastal thatch roofs</span>
              </div>
            </div>

            {/* KPI 3: Crops Submerged */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#D97706]/15 border border-[#D97706]/30 flex items-center justify-center text-[#D97706] shrink-0">
                <Wheat className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Crops Inundated</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">18,400</span>
                  <span className="text-[10px] font-mono text-[#D97706]">Hectares</span>
                </div>
                <span className="text-[9px] text-[#767092]">Paddy & betel vine</span>
              </div>
            </div>

            {/* KPI 4: Transmission Poles Down */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/15 border border-[#7C3AED]/30 flex items-center justify-center text-[#7C3AED] shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Power Poles Down</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">1,240</span>
                  <span className="text-[10px] font-mono text-[#16A34A]">Squads On</span>
                </div>
                <span className="text-[9px] text-[#767092]">Restoration squads</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. MAIN BENTO GRID (Damage Breakdown & Recovery Modeling)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Rapid Damage Classification (col-span-8) */}
          <div className="lg:col-span-8 p-5 rounded-[18px] bg-white/95 border border-[#E7E2DA] backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA]">
              <h3 className="text-sm font-bold text-[#1C1929] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
                <span>Rapid Damage Classification (NDMA Protocol Assessment)</span>
              </h3>
              <span className="text-xs font-mono text-[#767092]">ISRO Sentinel-1 SAR</span>
            </div>

            <p className="text-xs text-[#5D5775] leading-relaxed">
              Satellite multispectral analysis reveals <strong>82% of structural damage</strong> concentrated in unpaved habitations within 5km of the Puri-Konark shoreline. 18 disaster recovery teams have been pre-positioned with emergency electrical gensets and water purification equipment.
            </p>

            {/* Visual Damage Allocation Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] space-y-2">
                <span className="text-[11px] text-[#5D5775] block font-medium">Shoreline Zone (&lt;5km)</span>
                <span className="text-xl font-mono font-bold text-[#EF4444]">82% Severe</span>
                <div className="h-1.5 w-full bg-[#E7E2DA] rounded-full overflow-hidden">
                  <div className="h-full bg-[#EF4444] w-[82%]" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] space-y-2">
                <span className="text-[11px] text-[#5D5775] block font-medium">Midland Zone (5-15km)</span>
                <span className="text-xl font-mono font-bold text-[#F97316]">44% Moderate</span>
                <div className="h-1.5 w-full bg-[#E7E2DA] rounded-full overflow-hidden">
                  <div className="h-full bg-[#F97316] w-[44%]" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] space-y-2">
                <span className="text-[11px] text-[#5D5775] block font-medium">Inland Zone (&gt;15km)</span>
                <span className="text-xl font-mono font-bold text-[#16A34A]">12% Minor</span>
                <div className="h-1.5 w-full bg-[#E7E2DA] rounded-full overflow-hidden">
                  <div className="h-full bg-[#16A34A] w-[12%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Recovery Progress (col-span-4) */}
          <div className="lg:col-span-4 p-5 rounded-[18px] bg-white/95 border border-[#E7E2DA] backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)] flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA]">
              <h3 className="text-sm font-bold text-[#1C1929]">Rehabilitation Pipeline</h3>
              <span className="text-xs font-mono text-[#16A34A] font-bold">Phase 1</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA]">
                <span className="text-[#5D5775]">Emergency Tarpaulins:</span>
                <span className="font-mono font-bold text-[#16A34A]">12,500 Dispatched</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA]">
                <span className="text-[#5D5775]">Mobile Water Filters:</span>
                <span className="font-mono font-bold text-[#7C3AED]">18 Units Running</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA]">
                <span className="text-[#5D5775]">Electrical Restoration:</span>
                <span className="font-mono font-bold text-[#D97706]">420 of 1,240 Poles (34%)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] text-[11px] text-[#767092] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>National Disaster Response Fund (NDRF) grant sanction approved.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
