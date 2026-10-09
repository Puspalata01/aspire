"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Bell,
  Radio,
  ChevronDown,
  Moon,
  Sun,
  Globe2,
  Layers,
  Grid3X3,
  Flame,
  Shield,
  Activity,
  ArrowUpRight,
  TrendingDown,
} from "lucide-react";
import { useDisasterStore } from "@/stores/useDisasterStore";
import { useAuthStore } from "@/stores/useAuthStore";

interface DarkGlobeTopBarProps {
  is3D: boolean;
  setIs3D: (val: boolean) => void;
  showLayers: boolean;
  setShowLayers: (val: boolean) => void;
  showGrid: boolean;
  setShowGrid: (val: boolean) => void;
}

export function DarkGlobeTopBar({
  is3D,
  setIs3D,
  showLayers,
  setShowLayers,
  showGrid,
  setShowGrid,
}: DarkGlobeTopBarProps) {
  const { kpis, disaster } = useDisasterStore();
  const { user } = useAuthStore();
  const [selectedDistrict, setSelectedDistrict] = useState("puri");

  return (
    <header className="w-full px-6 py-4 flex flex-col gap-3 z-20 pointer-events-auto select-none">
      {/* Primary Top Row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Back Button + Title & Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link
            href="/authority/dashboard"
            className="w-10 h-10 rounded-xl bg-[#161D2E] hover:bg-[#3B6CFF] text-[#9AA3B8] hover:text-white border border-white/10 flex items-center justify-center transition-all shadow-sm"
            title="Back to Headquarters"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#F5F7FB] tracking-tight">
                Departments
              </h1>
              <div className="relative">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="appearance-none bg-[#161D2E]/80 border border-white/10 text-xs font-semibold text-[#F5F7FB] rounded-full pl-3 pr-7 py-1 outline-none cursor-pointer hover:border-white/20 transition-all"
                >
                  <option value="puri">Puri District Sector</option>
                  <option value="cuttack">Cuttack Mahanadi Basin</option>
                  <option value="khurda">Khurda Coastal Zone</option>
                  <option value="jagatsinghpur">Jagatsinghpur Delta</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9AA3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#9AA3B8] mt-0.5">
              <span>Map</span>
              <span>/</span>
              <span>Departments</span>
              <span>/</span>
              <span className="text-[#3B6CFF] font-medium">Status & Command</span>
            </div>
          </div>
        </div>

        {/* Center: Search Field with Shortcut Chip */}
        <div className="hidden lg:flex items-center relative min-w-[280px]">
          <Search className="w-4 h-4 text-[#6B7488] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search zones, shelters, or units..."
            className="w-full bg-[#161D2E]/70 border border-white/10 rounded-full pl-9 pr-12 py-1.5 text-xs text-[#F5F7FB] placeholder-[#6B7488] focus:border-[#3B6CFF] focus:outline-none focus:ring-1 focus:ring-[#3B6CFF] transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-[#9AA3B8] border border-white/5">
            ⌘K
          </span>
        </div>

        {/* Right: Stat Chips, Status Pill, Avatar */}
        <div className="flex items-center gap-3">
          {/* Stat Chip 1: Pending SOS */}
          <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#101624]/80 border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#FF4D5E] animate-ping" />
            <span className="text-xs text-[#9AA3B8]">SOS Active</span>
            <span className="font-mono text-xs font-bold text-[#F5F7FB]">
              {kpis.activeSOSCount}
            </span>
          </div>

          {/* Stat Chip 2: Field Teams Deployed */}
          <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#101624]/80 border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#2FD07F]" />
            <span className="text-xs text-[#9AA3B8]">Teams</span>
            <span className="font-mono text-xs font-bold text-[#2FD07F]">
              {kpis.deployedNDRFTeams}
            </span>
          </div>

          {/* Status Pill: LIVE */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2FD07F]/15 border border-[#2FD07F]/30 text-[#2FD07F] text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#2FD07F] animate-pulse" />
            <span>LIVE</span>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3B6CFF] to-[#6C63FF] flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/20">
              SP
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#F5F7FB] leading-none">
                {user?.name || "Timur K."}
              </span>
              <span className="text-[10px] text-[#6B7488] leading-tight">
                Crisis Commander
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7488]" />
          </div>
        </div>
      </div>

      {/* Secondary Controls Bar (Right Toggles as in Reference Image) */}
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center bg-[#101624]/80 border border-white/10 rounded-xl p-1 backdrop-blur-md">
          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-[#3B6CFF] text-white flex items-center justify-center shadow-sm"
            title="Night Mode Active"
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="w-8 h-8 rounded-lg text-[#6B7488] hover:text-[#9AA3B8] flex items-center justify-center transition-colors"
            title="Day Mode"
          >
            <Sun className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center bg-[#101624]/80 border border-white/10 rounded-xl p-1 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setIs3D(true)}
            className={`px-3 h-8 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              is3D
                ? "bg-[#3B6CFF] text-white shadow-[0_0_12px_rgba(59,108,255,0.4)]"
                : "text-[#9AA3B8] hover:text-white"
            }`}
            title="Switch to 3D Globe"
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>3D</span>
          </button>
          <button
            type="button"
            onClick={() => setIs3D(false)}
            className={`px-3 h-8 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              !is3D
                ? "bg-[#3B6CFF] text-white shadow-[0_0_12px_rgba(59,108,255,0.4)]"
                : "text-[#9AA3B8] hover:text-white"
            }`}
            title="Switch to 2D Regional Grid"
          >
            <span>2D</span>
          </button>
          <button
            type="button"
            onClick={() => setShowLayers(!showLayers)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              showLayers
                ? "bg-white/15 text-white"
                : "text-[#6B7488] hover:text-[#9AA3B8]"
            }`}
            title="Toggle Hazard Layers"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              showGrid
                ? "bg-white/15 text-white"
                : "text-[#6B7488] hover:text-[#9AA3B8]"
            }`}
            title="Toggle Coordinate Grid"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
