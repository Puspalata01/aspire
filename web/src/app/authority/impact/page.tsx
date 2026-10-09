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
    <div className="w-full min-h-screen bg-[#05070D] text-[#F5F7FB] flex flex-col select-none">
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
              <span className="w-3 h-3 rounded-full bg-[#FF4D5E] animate-pulse" />
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-[#F5F7FB]">
                Structural Loss Assessment
              </h2>
            </div>
            <p className="text-xs text-[#9AA3B8] leading-snug">
              Satellite multispectral SAR change detection, agricultural flood inundation loss, and public infrastructure rehabilitation modeling.
            </p>
          </div>

          {/* Right: 4 Visual KPI Cards */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: Estimated Economic Loss */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#FF4D5E]/20 border border-[#FF4D5E]/40 flex items-center justify-center text-[#FF4D5E] shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Economic Loss</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#FF4D5E]">₹42 Cr</span>
                  <span className="text-[10px] font-mono text-[#FF4D5E]">Estimated</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Crops & bridges</span>
              </div>
            </div>

            {/* KPI 2: Homes Damaged */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#FF8A3D]/20 border border-[#FF8A3D]/40 flex items-center justify-center text-[#FF8A3D] shrink-0">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Kutcha Homes</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">4,820</span>
                  <span className="text-[10px] font-mono text-[#FF8A3D]">Damaged</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Coastal thatch roofs</span>
              </div>
            </div>

            {/* KPI 3: Crops Submerged */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#F5C542]/20 border border-[#F5C542]/40 flex items-center justify-center text-[#F5C542] shrink-0">
                <Wheat className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Crops Inundated</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">18,400</span>
                  <span className="text-[10px] font-mono text-[#F5C542]">Hectares</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Paddy & betel vine</span>
              </div>
            </div>

            {/* KPI 4: Transmission Poles Down */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#3B6CFF]/20 border border-[#3B6CFF]/40 flex items-center justify-center text-[#3B6CFF] shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Power Poles Down</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">1,240</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">Squads On</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Restoration squads</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. MAIN BENTO GRID (Damage Breakdown & Recovery Modeling)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Rapid Damage Classification (col-span-8) */}
          <div className="lg:col-span-8 p-5 rounded-[18px] bg-[#101624]/75 border border-white/10 backdrop-blur-xl shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-[#F5F7FB] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#FF4D5E]" />
                <span>Rapid Damage Classification (NDMA Protocol Assessment)</span>
              </h3>
              <span className="text-xs font-mono text-[#6B7488]">ISRO Sentinel-1 SAR</span>
            </div>

            <p className="text-xs text-[#9AA3B8] leading-relaxed">
              Satellite multispectral analysis reveals <strong>82% of structural damage</strong> concentrated in unpaved habitations within 5km of the Puri-Konark shoreline. 18 disaster recovery teams have been pre-positioned with emergency electrical gensets and water purification equipment.
            </p>

            {/* Visual Damage Allocation Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#161D2E]/80 border border-white/5 space-y-2">
                <span className="text-[11px] text-[#9AA3B8] block">Shoreline Zone (&lt;5km)</span>
                <span className="text-xl font-mono font-bold text-[#FF4D5E]">82% Severe</span>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF4D5E] w-[82%]" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161D2E]/80 border border-white/5 space-y-2">
                <span className="text-[11px] text-[#9AA3B8] block">Midland Zone (5-15km)</span>
                <span className="text-xl font-mono font-bold text-[#FF8A3D]">44% Moderate</span>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF8A3D] w-[44%]" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161D2E]/80 border border-white/5 space-y-2">
                <span className="text-[11px] text-[#9AA3B8] block">Inland Zone (&gt;15km)</span>
                <span className="text-xl font-mono font-bold text-[#2FD07F]">12% Minor</span>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2FD07F] w-[12%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Recovery Progress (col-span-4) */}
          <div className="lg:col-span-4 p-5 rounded-[18px] bg-[#101624]/75 border border-white/10 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-[#F5F7FB]">Rehabilitation Pipeline</h3>
              <span className="text-xs font-mono text-[#2FD07F] font-bold">Phase 1</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#161D2E]/80 border border-white/5">
                <span className="text-[#9AA3B8]">Emergency Tarpaulins:</span>
                <span className="font-mono font-bold text-[#2FD07F]">12,500 Dispatched</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#161D2E]/80 border border-white/5">
                <span className="text-[#9AA3B8]">Mobile Water Filters:</span>
                <span className="font-mono font-bold text-[#3B6CFF]">18 Units Running</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#161D2E]/80 border border-white/5">
                <span className="text-[#9AA3B8]">Electrical Restoration:</span>
                <span className="font-mono font-bold text-[#F5C542]">420 of 1,240 Poles (34%)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-[#6B7488] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2FD07F] shrink-0" />
              <span>National Disaster Response Fund (NDRF) grant sanction approved.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
