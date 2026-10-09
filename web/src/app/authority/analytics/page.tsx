"use client";

import React from "react";
import { AuthorityHeader } from "@/components/layout/AuthorityHeader";
import {
  Clock,
  Users,
  ShieldAlert,
  Award,
  BarChart3,
  TrendingDown,
  TrendingUp,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default function AuthorityAnalyticsPage() {
  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] text-[#1C1929] flex flex-col select-none">
      {/* Top Standard Authority Header */}
      <AuthorityHeader pageTitle="Analytics & Performance Benchmarks" />

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
                Performance Telemetry
              </h2>
            </div>
            <p className="text-xs text-[#5D5775] leading-snug">
              Historical benchmark comparisons, mean-time-to-rescue (MTTR), civilian evacuation velocity, and AI precision.
            </p>
          </div>

          {/* Right: 4 Visual KPI Cards */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: Mean Time To Rescue */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED] shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Mean Response Time</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">18.4m</span>
                  <span className="text-[10px] font-mono text-[#16A34A] font-semibold">↓ 42%</span>
                </div>
                <span className="text-[9px] text-[#767092]">vs. Fani 2019 baseline</span>
              </div>
            </div>

            {/* KPI 2: Total Evacuees Sheltered */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED] shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Evacuees Housed</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">137k</span>
                  <span className="text-[10px] font-mono text-[#16A34A] font-semibold">99.4% Safe</span>
                </div>
                <span className="text-[9px] text-[#767092]">Zero casualty target</span>
              </div>
            </div>

            {/* KPI 3: SOS Clearance Rate */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#7C3AED] shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">SOS Clearance</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">85.4%</span>
                  <span className="text-[10px] font-mono text-[#16A34A] font-semibold">82 of 96</span>
                </div>
                <span className="text-[9px] text-[#767092]">High triage speed</span>
              </div>
            </div>

            {/* KPI 4: AI Model Forecast Accuracy */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">AI Precision</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#16A34A]">94.2%</span>
                  <span className="text-[10px] font-mono text-[#16A34A] font-semibold">Optimal</span>
                </div>
                <span className="text-[9px] text-[#767092]">Hydrodynamic breach</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. MAIN BENTO GRID (Throughput Curve + Key Sector Rings)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Evacuation Hourly Throughput Chart (col-span-8) */}
          <div className="lg:col-span-8 p-5 rounded-[18px] bg-white/95 border border-[#E7E2DA] backdrop-blur-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA]">
              <h3 className="text-sm font-bold text-[#1C1929] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#7C3AED]" />
                <span>Hourly Evacuation Velocity vs AI Prediction Curve</span>
              </h3>
              <span className="text-xs font-mono text-[#7C3AED] bg-[#F3E8FF] px-2.5 py-0.5 rounded-full font-bold">Peak at 09:00 AM</span>
            </div>

            <p className="text-xs text-[#5D5775]">
              Autonomous early-warning sirens triggered at 06:00 enabled <strong className="text-[#1C1929]">68,000 citizens</strong> to reach designated shelters 3 hours prior to maximum tidal surge.
            </p>

            {/* SVG Evacuation Curve Chart */}
            <div className="w-full h-48 pt-2">
              <svg viewBox="0 0 500 140" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="evacGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="40" y1="20" x2="490" y2="20" stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />
                <line x1="40" y1="60" x2="490" y2="60" stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />
                <line x1="40" y1="100" x2="490" y2="100" stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />
                <line x1="40" y1="130" x2="490" y2="130" stroke="rgba(0,0,0,0.12)" />

                {/* Labels */}
                <text x="5" y="24" fill="#767092" fontSize="10" fontFamily="monospace">30k</text>
                <text x="5" y="64" fill="#767092" fontSize="10" fontFamily="monospace">20k</text>
                <text x="5" y="104" fill="#767092" fontSize="10" fontFamily="monospace">10k</text>
                <text x="12" y="133" fill="#767092" fontSize="10" fontFamily="monospace">0</text>

                {/* Area Gradient */}
                <polygon
                  points="50,130 110,110 180,70 250,25 320,40 390,75 460,115 480,128 480,130 50,130"
                  fill="url(#evacGrad)"
                />

                {/* Main Purple Actual Curve */}
                <polyline
                  points="50,130 110,110 180,70 250,25 320,40 390,75 460,115 480,128"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Target AI Prediction Dashed Line */}
                <polyline
                  points="50,128 110,105 180,65 250,30 320,45 390,80 460,118 480,130"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />

                <circle cx="250" cy="25" r="4" fill="#FFFFFF" stroke="#7C3AED" strokeWidth="2" />
              </svg>

              <div className="flex justify-between pl-10 pr-2 text-[10px] font-mono text-[#767092] -mt-1">
                <span>04:00 AM</span>
                <span>06:00 AM (Siren)</span>
                <span>08:00 AM</span>
                <span>10:00 AM (Peak)</span>
                <span>12:00 PM (Landfall)</span>
                <span>02:00 PM</span>
              </div>
            </div>
          </div>

          {/* Sector Reliability Rings (col-span-4) */}
          <div className="lg:col-span-4 p-5 rounded-[18px] bg-white/95 border border-[#E7E2DA] backdrop-blur-xl shadow-sm flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA]">
              <h3 className="text-sm font-bold text-[#1C1929]">System Reliability Rings</h3>
              <span className="text-xs text-[#16A34A] font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">100% SLA</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              {/* Ring 1 */}
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] flex flex-col items-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" stroke="rgba(0,0,0,0.06)" strokeWidth="4" fill="none" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      stroke="#16A34A"
                      strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 18}
                      strokeDashoffset={2 * Math.PI * 18 * (1 - 0.98)}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-[#1C1929]">
                    98%
                  </span>
                </div>
                <span className="text-[10px] text-[#1C1929] mt-1.5 font-bold">Siren Coverage</span>
                <span className="text-[8px] text-[#767092]">Early audible</span>
              </div>

              {/* Ring 2 */}
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] flex flex-col items-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" stroke="rgba(0,0,0,0.06)" strokeWidth="4" fill="none" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      stroke="#7C3AED"
                      strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 18}
                      strokeDashoffset={2 * Math.PI * 18 * (1 - 0.94)}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-[#1C1929]">
                    94%
                  </span>
                </div>
                <span className="text-[10px] text-[#1C1929] mt-1.5 font-bold">Water Coverage</span>
                <span className="text-[8px] text-[#767092]">Potable RO supply</span>
              </div>

              {/* Ring 3 */}
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] flex flex-col items-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" stroke="rgba(0,0,0,0.06)" strokeWidth="4" fill="none" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      stroke="#9333EA"
                      strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 18}
                      strokeDashoffset={2 * Math.PI * 18 * (1 - 0.91)}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-[#1C1929]">
                    91%
                  </span>
                </div>
                <span className="text-[10px] text-[#1C1929] mt-1.5 font-bold">Route Passability</span>
                <span className="text-[8px] text-[#767092]">Highway clear</span>
              </div>

              {/* Ring 4 */}
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] flex flex-col items-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" stroke="rgba(0,0,0,0.06)" strokeWidth="4" fill="none" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      stroke="#16A34A"
                      strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 18}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-[#1C1929]">
                    100%
                  </span>
                </div>
                <span className="text-[10px] text-[#1C1929] mt-1.5 font-bold">Hospital Power</span>
                <span className="text-[8px] text-[#767092]">Genset active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
