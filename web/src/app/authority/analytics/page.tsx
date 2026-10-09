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
    <div className="w-full min-h-screen bg-[#05070D] text-[#F5F7FB] flex flex-col select-none">
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
              <span className="w-3 h-3 rounded-full bg-[#2FD07F] animate-pulse" />
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-[#F5F7FB]">
                Performance Telemetry
              </h2>
            </div>
            <p className="text-xs text-[#9AA3B8] leading-snug">
              Historical benchmark comparisons, mean-time-to-rescue (MTTR), civilian evacuation velocity, and AI precision.
            </p>
          </div>

          {/* Right: 4 Visual KPI Cards */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: Mean Time To Rescue */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#2FD07F]/20 border border-[#2FD07F]/40 flex items-center justify-center text-[#2FD07F] shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Mean Response Time</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">18.4m</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">↓ 42%</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">vs. Fani 2019 baseline</span>
              </div>
            </div>

            {/* KPI 2: Total Evacuees Sheltered */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#3B6CFF]/20 border border-[#3B6CFF]/40 flex items-center justify-center text-[#3B6CFF] shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Evacuees Housed</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">137k</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">99.4% Safe</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Zero casualty target</span>
              </div>
            </div>

            {/* KPI 3: SOS Clearance Rate */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#4FB3FF]/20 border border-[#4FB3FF]/40 flex items-center justify-center text-[#4FB3FF] shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">SOS Clearance</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">85.4%</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">82 of 96</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">High triage speed</span>
              </div>
            </div>

            {/* KPI 4: AI Model Forecast Accuracy */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#F5C542]/20 border border-[#F5C542]/40 flex items-center justify-center text-[#F5C542] shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">AI Precision</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#2FD07F]">94.2%</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">Optimal</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Hydrodynamic breach</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. MAIN BENTO GRID (Throughput Curve + Key Sector Rings)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Evacuation Hourly Throughput Chart (col-span-8) */}
          <div className="lg:col-span-8 p-5 rounded-[18px] bg-[#101624]/75 border border-white/10 backdrop-blur-xl shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-[#F5F7FB] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#3B6CFF]" />
                <span>Hourly Evacuation Velocity vs AI Prediction Curve</span>
              </h3>
              <span className="text-xs font-mono text-[#2FD07F] font-bold">Peak at 09:00 AM</span>
            </div>

            <p className="text-xs text-[#9AA3B8]">
              Autonomous early-warning sirens triggered at 06:00 enabled <strong>68,000 citizens</strong> to reach designated shelters 3 hours prior to maximum tidal surge.
            </p>

            {/* SVG Evacuation Curve Chart */}
            <div className="w-full h-48 pt-2">
              <svg viewBox="0 0 500 140" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="evacGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B6CFF" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3B6CFF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="40" y1="20" x2="490" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="40" y1="60" x2="490" y2="60" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="40" y1="100" x2="490" y2="100" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="40" y1="130" x2="490" y2="130" stroke="rgba(255,255,255,0.12)" />

                {/* Labels */}
                <text x="5" y="24" fill="#6B7488" fontSize="10" fontFamily="monospace">30k</text>
                <text x="5" y="64" fill="#6B7488" fontSize="10" fontFamily="monospace">20k</text>
                <text x="5" y="104" fill="#6B7488" fontSize="10" fontFamily="monospace">10k</text>
                <text x="12" y="133" fill="#6B7488" fontSize="10" fontFamily="monospace">0</text>

                {/* Area Gradient */}
                <polygon
                  points="50,130 110,110 180,70 250,25 320,40 390,75 460,115 480,128 480,130 50,130"
                  fill="url(#evacGrad)"
                />

                {/* Main Blue Actual Curve */}
                <polyline
                  points="50,130 110,110 180,70 250,25 320,40 390,75 460,115 480,128"
                  fill="none"
                  stroke="#3B6CFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Target AI Prediction Dashed Line */}
                <polyline
                  points="50,128 110,105 180,65 250,30 320,45 390,80 460,118 480,130"
                  fill="none"
                  stroke="#2FD07F"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />

                <circle cx="250" cy="25" r="4" fill="#FFFFFF" stroke="#3B6CFF" strokeWidth="2" />
              </svg>

              <div className="flex justify-between pl-10 pr-2 text-[10px] font-mono text-[#6B7488] -mt-1">
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
          <div className="lg:col-span-4 p-5 rounded-[18px] bg-[#101624]/75 border border-white/10 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-[#F5F7FB]">System Reliability Rings</h3>
              <span className="text-xs text-[#2FD07F] font-mono font-bold">100% SLA</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              {/* Ring 1 */}
              <div className="p-3 rounded-xl bg-[#161D2E]/80 border border-white/5 flex flex-col items-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      stroke="#2FD07F"
                      strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 18}
                      strokeDashoffset={2 * Math.PI * 18 * (1 - 0.98)}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-[#F5F7FB]">
                    98%
                  </span>
                </div>
                <span className="text-[10px] text-[#9AA3B8] mt-1.5 font-bold">Siren Coverage</span>
                <span className="text-[8px] text-[#6B7488]">Early audible</span>
              </div>

              {/* Ring 2 */}
              <div className="p-3 rounded-xl bg-[#161D2E]/80 border border-white/5 flex flex-col items-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      stroke="#3B6CFF"
                      strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 18}
                      strokeDashoffset={2 * Math.PI * 18 * (1 - 0.94)}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-[#F5F7FB]">
                    94%
                  </span>
                </div>
                <span className="text-[10px] text-[#9AA3B8] mt-1.5 font-bold">Water Coverage</span>
                <span className="text-[8px] text-[#6B7488]">Potable RO supply</span>
              </div>

              {/* Ring 3 */}
              <div className="p-3 rounded-xl bg-[#161D2E]/80 border border-white/5 flex flex-col items-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      stroke="#4FB3FF"
                      strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 18}
                      strokeDashoffset={2 * Math.PI * 18 * (1 - 0.91)}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-[#F5F7FB]">
                    91%
                  </span>
                </div>
                <span className="text-[10px] text-[#9AA3B8] mt-1.5 font-bold">Route Passability</span>
                <span className="text-[8px] text-[#6B7488]">Highway clear</span>
              </div>

              {/* Ring 4 */}
              <div className="p-3 rounded-xl bg-[#161D2E]/80 border border-white/5 flex flex-col items-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      stroke="#2FD07F"
                      strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 18}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-[#F5F7FB]">
                    100%
                  </span>
                </div>
                <span className="text-[10px] text-[#9AA3B8] mt-1.5 font-bold">Hospital Power</span>
                <span className="text-[8px] text-[#6B7488]">Genset active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
