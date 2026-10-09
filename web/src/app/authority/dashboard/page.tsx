"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CycloneGlobeVisual } from "@/components/dark-globe/CycloneGlobeVisual";
import {
  Menu,
  Search,
  Bell,
  ShieldCheck,
  MapPin,
  Calendar,
  AlertTriangle,
  Users,
  Home,
  Truck,
  Wind,
  Waves,
  Flame,
  Mountain,
  Activity,
  ArrowUpRight,
  Shield,
  LifeBuoy,
  HeartPulse,
} from "lucide-react";

export default function AuthorityDashboardPage() {
  const [selectedForecastHazard, setSelectedForecastHazard] = useState("cyclone");

  return (
    <div className="w-full min-h-screen bg-[#05070D] text-[#F5F7FB] px-5 py-3.5 select-none flex flex-col gap-4">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION HEADER (Matching Reference Screenshot)
         ───────────────────────────────────────────────────────────── */}
      <header className="w-full flex items-center justify-between gap-4 pb-1">
        {/* Left: Menu Toggle + ASPIRE Brand Identity */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#9AA3B8] hover:text-white transition-colors cursor-pointer"
            title="Toggle Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#3B6CFF] flex items-center justify-center text-white shadow-[0_0_16px_rgba(59,108,255,0.4)]">
              <Shield className="w-4 h-4 fill-white text-[#3B6CFF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-[#F5F7FB]">
                  ASPIRE
                </span>
              </div>
              <p className="text-[10px] text-[#6B7488] font-medium leading-none hidden sm:block">
                AI-Powered Disaster Intelligence & Autonomous Decision-Support Platform
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search Field with Shortcut Chip */}
        <div className="hidden md:flex items-center relative flex-1 max-w-md mx-4">
          <Search className="w-3.5 h-3.5 text-[#6B7488] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search location, district, hazard, or resource..."
            className="w-full bg-[#101624]/70 border border-white/10 rounded-full pl-9 pr-14 py-1.5 text-xs text-[#F5F7FB] placeholder-[#6B7488] focus:border-[#3B6CFF] focus:outline-none focus:ring-1 focus:ring-[#3B6CFF] transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-[#9AA3B8] border border-white/5">
            Ctrl + K
          </span>
        </div>

        {/* Right: Authority Pill, Bell, Profile */}
        <div className="flex items-center gap-3">
          {/* Authority Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2FD07F]/15 border border-[#2FD07F]/30 text-[#2FD07F] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#2FD07F] animate-pulse" />
            <span>Authority</span>
          </div>

          {/* Bell Icon with Red Dot */}
          <button
            type="button"
            className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#9AA3B8] hover:text-white transition-colors cursor-pointer"
            title="Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF4D5E] ring-2 ring-[#05070D]" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-1.5 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3B6CFF] to-[#6C63FF] ring-1 ring-white/20 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              SM
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#F5F7FB] leading-none">
                Dr. S. Mohanty
              </span>
              <span className="text-[10px] text-[#6B7488] leading-tight mt-0.5">
                Disaster Management Authority
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. GREETING & TOP 4 KPI CARDS ROW
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left: Greeting & Date/Location Metadata */}
        <div className="lg:col-span-4 flex flex-col justify-center gap-1">
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-[#F5F7FB]">
            Good Morning, Dr. Mohanty
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-[#2FD07F] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Odisha State Disaster Management Authority</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#9AA3B8] mt-0.5">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#F5C542]" />
              <span>Odisha, India</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#6B7488]" />
              <span>12 Oct 2026 | 10:24 AM</span>
            </div>
          </div>
        </div>

        {/* Right: 4 Horizontal KPI Cards */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* KPI 1: Active Hazards */}
          <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#FF4D5E]/15 border border-[#FF4D5E]/30 flex items-center justify-center text-[#FF4D5E]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#9AA3B8] block leading-tight">
                Active Hazards
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-[#F5F7FB]">3</span>
                <span className="text-[10px] font-mono text-[#FF4D5E]">↑ 2</span>
              </div>
              <span className="text-[9px] text-[#6B7488] leading-none block">
                (vs. last 24h)
              </span>
            </div>
          </div>

          {/* KPI 2: Total Affected */}
          <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#3B6CFF]/15 border border-[#3B6CFF]/30 flex items-center justify-center text-[#3B6CFF]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#9AA3B8] block leading-tight">
                Total Affected
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-[#F5F7FB]">48,723</span>
                <span className="text-[10px] font-mono text-[#2FD07F]">↓ 12%</span>
              </div>
              <span className="text-[9px] text-[#6B7488] leading-none block">
                (vs. last 24h)
              </span>
            </div>
          </div>

          {/* KPI 3: Relief Camps */}
          <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#2FD07F]/15 border border-[#2FD07F]/30 flex items-center justify-center text-[#2FD07F]">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#9AA3B8] block leading-tight">
                Relief Camps
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-[#F5F7FB]">86</span>
                <span className="text-[10px] font-mono text-[#2FD07F]">↑ 5</span>
              </div>
              <span className="text-[9px] text-[#6B7488] leading-none block">
                (vs. last 24h)
              </span>
            </div>
          </div>

          {/* KPI 4: Resources Deployed */}
          <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#3B6CFF]/15 border border-[#3B6CFF]/30 flex items-center justify-center text-[#3B6CFF]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#9AA3B8] block leading-tight">
                Resources Deployed
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-[#F5F7FB]">142</span>
                <span className="text-[10px] font-mono text-[#2FD07F]">↑ 8</span>
              </div>
              <span className="text-[9px] text-[#6B7488] leading-none block">
                (vs. last 24h)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN THREE-COLUMN DASHBOARD GRID
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ═══════════════════════════════════════════════════════════
            LEFT COLUMN (Current Situation, 72h Forecast, Key Metrics)
           ═══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-3 flex flex-col gap-3.5">
          {/* Card 1: Current Situation */}
          <section className="rounded-[18px] bg-[#101624]/75 border border-white/10 p-4 backdrop-blur-xl shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F5F7FB]">Current Situation</h3>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#2FD07F]/15 border border-[#2FD07F]/30 text-[#2FD07F] text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2FD07F] animate-pulse" />
                <span>Live</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Item 1: Cyclone Alert */}
              <div className="flex items-start gap-3 p-2 rounded-xl bg-[#161D2E]/50 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-[#FF4D5E]/20 flex items-center justify-center text-[#FF4D5E] shrink-0 mt-0.5">
                  <Wind className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F7FB]">Cyclone Alert</span>
                    <span className="text-[11px] font-bold text-[#FF4D5E]">Very High Risk</span>
                  </div>
                  <p className="text-[11px] text-[#9AA3B8] leading-snug mt-0.5">
                    Landfall expected in 18 hrs (Puri - Jagatsinghpur coast)
                  </p>
                </div>
              </div>

              {/* Item 2: Flooding */}
              <div className="flex items-start gap-3 p-2 rounded-xl bg-[#161D2E]/50 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-[#3B6CFF]/20 flex items-center justify-center text-[#3B6CFF] shrink-0 mt-0.5">
                  <Waves className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F7FB]">Flooding</span>
                    <span className="text-[11px] font-bold text-[#F5C542]">Moderate Risk</span>
                  </div>
                  <p className="text-[11px] text-[#9AA3B8] leading-snug mt-0.5">
                    Rivers in spate - Mahanadi, Baitarani (2 districts affected)
                  </p>
                </div>
              </div>

              {/* Item 3: Heatwave */}
              <div className="flex items-start gap-3 p-2 rounded-xl bg-[#161D2E]/50 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-[#F5C542]/20 flex items-center justify-center text-[#F5C542] shrink-0 mt-0.5">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F7FB]">Heatwave</span>
                    <span className="text-[11px] font-bold text-[#2FD07F]">Low Risk</span>
                  </div>
                  <p className="text-[11px] text-[#9AA3B8] leading-snug mt-0.5">
                    Sundargarh, Jharsuguda (temp. 42°C+)
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Card 2: Hazard Forecast (Next 72 hrs) */}
          <section className="rounded-[18px] bg-[#101624]/75 border border-white/10 p-4 backdrop-blur-xl shadow-lg flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#F5F7FB]">
              Hazard Forecast <span className="text-[11px] text-[#6B7488] font-normal">(Next 72 hrs)</span>
            </h3>

            {/* 5 Hazard Type Toggle Buttons */}
            <div className="grid grid-cols-5 gap-1 bg-[#161D2E]/60 p-1 rounded-xl border border-white/5 text-[10px]">
              {[
                { id: "cyclone", label: "Cyclone", icon: Wind },
                { id: "flood", label: "Flood", icon: Waves },
                { id: "heat", label: "Heat", icon: Flame },
                { id: "landslide", label: "Landslide", icon: Mountain },
                { id: "earthquake", label: "Earthquake", icon: Activity },
              ].map((h) => {
                const Icon = h.icon;
                const isActive = selectedForecastHazard === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setSelectedForecastHazard(h.id)}
                    className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#3B6CFF] text-white shadow-sm"
                        : "text-[#9AA3B8] hover:text-white"
                    }`}
                  >
                    <Icon className="w-3 h-3 mb-0.5" />
                    <span className="truncate max-w-[45px]">{h.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Area Forecast Chart */}
            <div className="relative w-full h-32 pt-2">
              <svg viewBox="0 0 280 100" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="forecastRedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF4D5E" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#FF4D5E" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="30" y1="15" x2="280" y2="15" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="30" y1="40" x2="280" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="30" y1="65" x2="280" y2="65" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="30" y1="90" x2="280" y2="90" stroke="rgba(255,255,255,0.12)" />

                {/* Y-axis labels */}
                <text x="5" y="18" fill="#6B7488" fontSize="9" fontFamily="monospace">200</text>
                <text x="5" y="43" fill="#6B7488" fontSize="9" fontFamily="monospace">150</text>
                <text x="5" y="68" fill="#6B7488" fontSize="9" fontFamily="monospace">100</text>
                <text x="12" y="93" fill="#6B7488" fontSize="9" fontFamily="monospace">0</text>

                {/* Area Gradient */}
                <polygon
                  points="35,88 80,78 130,68 180,52 230,34 275,22 275,90 35,90"
                  fill="url(#forecastRedGrad)"
                />

                {/* Rising Red Trajectory Line */}
                <polyline
                  points="35,88 80,78 130,68 180,52 230,34 275,22"
                  fill="none"
                  stroke="#FF4D5E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* End Point Dot */}
                <circle cx="275" cy="22" r="3.5" fill="#FFFFFF" stroke="#FF4D5E" strokeWidth="2" />
              </svg>

              {/* X-axis time labels */}
              <div className="flex justify-between pl-7 pr-1 text-[9px] font-mono text-[#6B7488] -mt-1">
                <span>Now</span>
                <span>12h</span>
                <span>24h</span>
                <span>36h</span>
                <span>48h</span>
                <span>72h</span>
              </div>
            </div>
          </section>

          {/* Card 3: Key Metrics (4 Circular Progress Rings) */}
          <section className="rounded-[18px] bg-[#101624]/75 border border-white/10 p-3.5 backdrop-blur-xl shadow-lg flex flex-col gap-2">
            <h3 className="text-sm font-bold text-[#F5F7FB]">Key Metrics</h3>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {/* Ring 1: Population Coverage */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 44 44" className="w-12 h-12 transform -rotate-90">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3.5" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="none"
                      stroke="#4FB3FF"
                      strokeWidth="3.5"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - 0.75)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-[#F5F7FB]">
                    75%
                  </span>
                </div>
                <span className="text-[9px] text-[#9AA3B8] leading-tight mt-1.5">
                  Population Coverage
                </span>
                <span className="text-[8px] text-[#6B7488] leading-none">
                  (early warning)
                </span>
              </div>

              {/* Ring 2: Shelter Readiness */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 44 44" className="w-12 h-12 transform -rotate-90">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3.5" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="none"
                      stroke="#3B6CFF"
                      strokeWidth="3.5"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - 0.62)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-[#F5F7FB]">
                    62%
                  </span>
                </div>
                <span className="text-[9px] text-[#9AA3B8] leading-tight mt-1.5">
                  Shelter Readiness
                </span>
                <span className="text-[8px] text-[#6B7488] leading-none">
                  (to capacity)
                </span>
              </div>

              {/* Ring 3: Communication Network */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 44 44" className="w-12 h-12 transform -rotate-90">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3.5" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="none"
                      stroke="#4FB3FF"
                      strokeWidth="3.5"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - 0.89)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-[#F5F7FB]">
                    89%
                  </span>
                </div>
                <span className="text-[9px] text-[#9AA3B8] leading-tight mt-1.5">
                  Communication Network
                </span>
              </div>

              {/* Ring 4: Critical Assets */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 44 44" className="w-12 h-12 transform -rotate-90">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3.5" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="none"
                      stroke="#2FD07F"
                      strokeWidth="3.5"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-[#F5F7FB]">
                    100%
                  </span>
                </div>
                <span className="text-[9px] text-[#9AA3B8] leading-tight mt-1.5">
                  Critical Assets
                </span>
                <span className="text-[8px] text-[#6B7488] leading-none">
                  (operational)
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            MIDDLE COLUMN (3D Earth Globe Hero + Recent Activity)
           ═══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-6 flex flex-col gap-3.5">
          {/* The Hero 3D Globe Canvas with Cyclone Vortex */}
          <CycloneGlobeVisual />

          {/* Recent Activity Card (Below Globe) */}
          <section className="rounded-[18px] bg-[#101624]/75 border border-white/10 p-4 backdrop-blur-xl shadow-lg flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F5F7FB]">Recent Activity</h3>
              <Link
                href="/authority/analytics"
                className="text-[11px] font-semibold text-[#3B6CFF] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <span>→</span>
              </Link>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              {/* Item 1 */}
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#2FD07F]" />
                  <span className="text-[#F5F7FB] font-medium">
                    Evacuation order issued for coastal blocks
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#9AA3B8]">10:12 AM</span>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF8A3D]" />
                  <span className="text-[#F5F7FB] font-medium">
                    NDRF team dispatched to Jagatsinghpur
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#9AA3B8]">09:47 AM</span>
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF4D5E]" />
                  <span className="text-[#F5F7FB] font-medium">
                    Medical camp activated (Puri)
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#9AA3B8]">08:30 AM</span>
              </div>

              {/* Item 4 */}
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#4FB3FF]" />
                  <span className="text-[#F5F7FB] font-medium">
                    Satellite imagery updated
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#9AA3B8]">07:15 AM</span>
              </div>

              {/* Item 5 */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#3B6CFF]" />
                  <span className="text-[#F5F7FB] font-medium">
                    Weather forecast refreshed
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#9AA3B8]">06:00 AM</span>
              </div>
            </div>
          </section>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            RIGHT COLUMN (District Risk, Resource Utilization, Recent Alerts)
           ═══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-3 flex flex-col gap-3.5">
          {/* Card 1: District Risk Overview */}
          <section className="rounded-[18px] bg-[#101624]/75 border border-white/10 p-4 backdrop-blur-xl shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F5F7FB]">District Risk Overview</h3>
              <Link
                href="/authority/risk"
                className="text-[11px] font-semibold text-[#3B6CFF] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <span>→</span>
              </Link>
            </div>

            {/* Table */}
            <div className="flex flex-col text-xs">
              <div className="grid grid-cols-12 text-[#6B7488] font-medium pb-2 border-b border-white/10 text-[11px]">
                <span className="col-span-4">District</span>
                <span className="col-span-4">Hazard(s)</span>
                <span className="col-span-4 text-right">Risk Level</span>
              </div>

              {/* Row 1: Puri */}
              <div className="grid grid-cols-12 items-center py-2 border-b border-white/5">
                <span className="col-span-4 font-semibold text-[#F5F7FB]">Puri</span>
                <div className="col-span-4 flex items-center gap-1.5 text-[#FF4D5E]">
                  <Wind className="w-3.5 h-3.5" />
                  <Waves className="w-3.5 h-3.5" />
                </div>
                <div className="col-span-4 text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF4D5E]/20 text-[#FF4D5E] border border-[#FF4D5E]/30">
                    Very High
                  </span>
                </div>
              </div>

              {/* Row 2: Jagatsinghpur */}
              <div className="grid grid-cols-12 items-center py-2 border-b border-white/5">
                <span className="col-span-4 font-semibold text-[#F5F7FB]">Jagatsinghpur</span>
                <div className="col-span-4 flex items-center gap-1.5 text-[#FF4D5E]">
                  <Wind className="w-3.5 h-3.5" />
                  <Waves className="w-3.5 h-3.5" />
                </div>
                <div className="col-span-4 text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF4D5E]/20 text-[#FF4D5E] border border-[#FF4D5E]/30">
                    Very High
                  </span>
                </div>
              </div>

              {/* Row 3: Kendrapara */}
              <div className="grid grid-cols-12 items-center py-2 border-b border-white/5">
                <span className="col-span-4 font-semibold text-[#F5F7FB]">Kendrapara</span>
                <div className="col-span-4 flex items-center gap-1.5 text-[#FF4D5E]">
                  <Wind className="w-3.5 h-3.5" />
                </div>
                <div className="col-span-4 text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF8A3D]/20 text-[#FF8A3D] border border-[#FF8A3D]/30">
                    High
                  </span>
                </div>
              </div>

              {/* Row 4: Cuttack */}
              <div className="grid grid-cols-12 items-center py-2 border-b border-white/5">
                <span className="col-span-4 font-semibold text-[#F5F7FB]">Cuttack</span>
                <div className="col-span-4 flex items-center gap-1.5 text-[#3B6CFF]">
                  <Waves className="w-3.5 h-3.5" />
                </div>
                <div className="col-span-4 text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5C542]/20 text-[#F5C542] border border-[#F5C542]/30">
                    Medium
                  </span>
                </div>
              </div>

              {/* Row 5: Ganjam */}
              <div className="grid grid-cols-12 items-center py-2">
                <span className="col-span-4 font-semibold text-[#F5F7FB]">Ganjam</span>
                <div className="col-span-4 flex items-center gap-1.5 text-[#3B6CFF]">
                  <Waves className="w-3.5 h-3.5" />
                  <Mountain className="w-3.5 h-3.5 text-[#F5C542]" />
                </div>
                <div className="col-span-4 text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5C542]/20 text-[#F5C542] border border-[#F5C542]/30">
                    Medium
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Card 2: Resource Utilization */}
          <section className="rounded-[18px] bg-[#101624]/75 border border-white/10 p-4 backdrop-blur-xl shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F5F7FB]">Resource Utilization</h3>
              <Link
                href="/authority/resources"
                className="text-[11px] font-semibold text-[#3B6CFF] hover:underline flex items-center gap-1"
              >
                <span>View Details</span>
                <span>→</span>
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-1">
              {/* Left Ring Chart */}
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg viewBox="0 0 56 56" className="w-16 h-16 transform -rotate-90">
                    <circle cx="28" cy="28" r="23" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                    <circle
                      cx="28"
                      cy="28"
                      r="23"
                      fill="none"
                      stroke="#4FB3FF"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 23}`}
                      strokeDashoffset={`${2 * Math.PI * 23 * (1 - 0.68)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-[#F5F7FB]">
                    68%
                  </span>
                </div>
                <span className="text-[10px] text-[#9AA3B8] mt-1 text-center whitespace-nowrap">
                  Overall Utilization
                </span>
              </div>

              {/* Right Metric Rows */}
              <div className="flex-1 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#9AA3B8]">
                    <Users className="w-3.5 h-3.5 text-[#3B6CFF]" />
                    <span>NDRF Teams</span>
                  </div>
                  <span className="font-mono font-bold text-[#F5F7FB]">18 / 24</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#9AA3B8]">
                    <LifeBuoy className="w-3.5 h-3.5 text-[#3B6CFF]" />
                    <span>Boats</span>
                  </div>
                  <span className="font-mono font-bold text-[#F5F7FB]">32 / 48</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#9AA3B8]">
                    <HeartPulse className="w-3.5 h-3.5 text-[#3B6CFF]" />
                    <span>Medical Units</span>
                  </div>
                  <span className="font-mono font-bold text-[#F5F7FB]">12 / 16</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#9AA3B8]">
                    <Home className="w-3.5 h-3.5 text-[#3B6CFF]" />
                    <span>Shelters</span>
                  </div>
                  <span className="font-mono font-bold text-[#F5F7FB]">86 / 120</span>
                </div>
              </div>
            </div>
          </section>

          {/* Card 3: Recent Alerts & Updates */}
          <section className="rounded-[18px] bg-[#101624]/75 border border-white/10 p-4 backdrop-blur-xl shadow-lg flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F5F7FB]">Recent Alerts & Updates</h3>
              <Link
                href="/authority/sos"
                className="text-[11px] font-semibold text-[#3B6CFF] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <span>→</span>
              </Link>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              {/* Alert 1 */}
              <div className="flex items-start gap-2.5 py-1 border-b border-white/5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#FF4D5E] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[#F5F7FB] font-medium leading-tight">
                    IMD Update: Cyclone intensified to Very Severe
                  </p>
                  <span className="text-[10px] text-[#6B7488]">2 hrs ago</span>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="flex items-start gap-2.5 py-1 border-b border-white/5">
                <Users className="w-3.5 h-3.5 text-[#3B6CFF] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[#F5F7FB] font-medium leading-tight">
                    2 villages isolated in Kendrapara (rescue ongoing)
                  </p>
                  <span className="text-[10px] text-[#6B7488]">3 hrs ago</span>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="flex items-start gap-2.5 py-1 border-b border-white/5">
                <Truck className="w-3.5 h-3.5 text-[#2FD07F] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[#F5F7FB] font-medium leading-tight">
                    Relief supplies dispatched to Puri
                  </p>
                  <span className="text-[10px] text-[#6B7488]">4 hrs ago</span>
                </div>
              </div>

              {/* Alert 4 */}
              <div className="flex items-start gap-2.5 py-1 border-b border-white/5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#FF8A3D] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[#F5F7FB] font-medium leading-tight">
                    Road blocked: NH-316 (Baleswar)
                  </p>
                  <span className="text-[10px] text-[#6B7488]">6 hrs ago</span>
                </div>
              </div>

              {/* Alert 5 */}
              <div className="flex items-start gap-2.5 py-1">
                <Flame className="w-3.5 h-3.5 text-[#F5C542] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[#F5F7FB] font-medium leading-tight">
                    Heatwave alert for Sundargarh district
                  </p>
                  <span className="text-[10px] text-[#6B7488]">8 hrs ago</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
