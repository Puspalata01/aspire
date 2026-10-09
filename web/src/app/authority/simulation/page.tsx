"use client";

import React from "react";
import { AuthorityHeader } from "@/components/layout/AuthorityHeader";
import { useDisasterStore } from "@/stores/useDisasterStore";
import {
  Cpu,
  Play,
  RotateCcw,
  AlertOctagon,
  TrendingUp,
  Waves,
  Wind,
  Droplets,
  Users,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export default function AuthoritySimulationPage() {
  const {
    simulationRainfallMm,
    simulationWindSpeedKmh,
    simulationTideHeightM,
    setSimulationParam,
    runSimulation,
    resetSimulation,
    isSimulating,
    kpis,
  } = useDisasterStore();

  const handleRun = () => {
    runSimulation();
    toast.success("Hydrodynamic physics simulation executed successfully!");
  };

  return (
    <div className="w-full min-h-screen bg-[#05070D] text-[#F5F7FB] flex flex-col select-none">
      {/* Top Standard Authority Header */}
      <AuthorityHeader pageTitle="Predictive Physics Simulation" />

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
                What-If Simulation Engine
              </h2>
            </div>
            <p className="text-xs text-[#9AA3B8] leading-snug">
              Hydrodynamic flood propagation and storm-surge physics modeling to stress-test disaster thresholds.
            </p>
          </div>

          {/* Right: 4 Visual KPI Cards */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: Simulated Rainfall */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#3B6CFF]/20 border border-[#3B6CFF]/40 flex items-center justify-center text-[#3B6CFF] shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Rainfall Stress</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">{simulationRainfallMm}</span>
                  <span className="text-[10px] font-mono text-[#3B6CFF]">mm/24h</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">High precipitation</span>
              </div>
            </div>

            {/* KPI 2: Wind Speed */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#FF4D5E]/20 border border-[#FF4D5E]/40 flex items-center justify-center text-[#FF4D5E] shrink-0">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Wind Gusts</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">{simulationWindSpeedKmh}</span>
                  <span className="text-[10px] font-mono text-[#FF4D5E]">km/h</span>
                </div>
                <span className="text-[9px] text-[#FF4D5E]">Cat 3 Storm</span>
              </div>
            </div>

            {/* KPI 3: Tidal Surge */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#4FB3FF]/20 border border-[#4FB3FF]/40 flex items-center justify-center text-[#4FB3FF] shrink-0">
                <Waves className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Storm Surge</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">{simulationTideHeightM}</span>
                  <span className="text-[10px] font-mono text-[#4FB3FF]">meters</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Peak astronomical</span>
              </div>
            </div>

            {/* KPI 4: Embankment Breach Risk */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#FF8A3D]/20 border border-[#FF8A3D]/40 flex items-center justify-center text-[#FF8A3D] shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Breach Probability</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#FF4D5E]">98%</span>
                  <span className="text-[10px] font-bold text-[#FF4D5E]">High</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Section 14 Kanas</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. MAIN BENTO GRID (Physics Controls + Output Impact Model)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Controls Column (col-span-4) */}
          <div className="lg:col-span-4 p-5 rounded-[18px] bg-[#101624]/75 border border-white/10 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#3B6CFF]" />
                  <h3 className="text-sm font-bold text-[#F5F7FB]">Simulation Physics Parameters</h3>
                </div>
                <button
                  type="button"
                  onClick={resetSimulation}
                  className="text-[11px] text-[#9AA3B8] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Sliders */}
              <div className="space-y-4 pt-4">
                {/* Rainfall */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9AA3B8] flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-[#3B6CFF]" /> Precipitation (24h)
                    </span>
                    <span className="font-mono font-bold text-[#3B6CFF]">
                      {simulationRainfallMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="600"
                    value={simulationRainfallMm}
                    onChange={(e) => setSimulationParam("simulationRainfallMm", Number(e.target.value))}
                    className="w-full accent-[#3B6CFF] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-[#6B7488]">
                    <span>50 mm (Light)</span>
                    <span>300 mm (Heavy)</span>
                    <span>600 mm (Extreme)</span>
                  </div>
                </div>

                {/* Wind Speed */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9AA3B8] flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-[#FF4D5E]" /> Sustained Wind Speed
                    </span>
                    <span className="font-mono font-bold text-[#FF4D5E]">
                      {simulationWindSpeedKmh} km/h
                    </span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="250"
                    value={simulationWindSpeedKmh}
                    onChange={(e) => setSimulationParam("simulationWindSpeedKmh", Number(e.target.value))}
                    className="w-full accent-[#FF4D5E] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-[#6B7488]">
                    <span>60 km/h (Breeze)</span>
                    <span>150 km/h (Cyclone)</span>
                    <span>250 km/h (Super)</span>
                  </div>
                </div>

                {/* Tide Height */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#9AA3B8] flex items-center gap-1">
                      <Waves className="w-3.5 h-3.5 text-[#4FB3FF]" /> Astronomical Storm Surge
                    </span>
                    <span className="font-mono font-bold text-[#4FB3FF]">
                      {simulationTideHeightM} meters
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6"
                    step="0.1"
                    value={simulationTideHeightM}
                    onChange={(e) => setSimulationParam("simulationTideHeightM", Number(e.target.value))}
                    className="w-full accent-[#4FB3FF] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-[#6B7488]">
                    <span>0.5 m (Normal)</span>
                    <span>3.0 m (High Tide)</span>
                    <span>6.0 m (Tsunami Scale)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Run Button */}
            <button
              type="button"
              disabled={isSimulating}
              onClick={handleRun}
              className="w-full py-2.5 rounded-xl bg-[#3B6CFF] hover:bg-[#325bd4] text-xs font-bold text-white shadow-[0_0_15px_rgba(59,108,255,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{isSimulating ? "Simulating Hydrodynamics..." : "Execute Physics Simulation"}</span>
            </button>
          </div>

          {/* Forecasted Impact Output (col-span-8) */}
          <div className="lg:col-span-8 p-5 rounded-[18px] bg-[#101624]/75 border border-white/10 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-[#F5F7FB] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#3B6CFF]" />
                <span>Projected Impact Footprint Under Scenario</span>
              </h3>
              <span className="text-xs font-mono font-semibold text-[#2FD07F] px-2.5 py-0.5 rounded-full bg-[#2FD07F]/15 border border-[#2FD07F]/30">
                Confidence: 91.5%
              </span>
            </div>

            {/* Visual Projection Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#161D2E]/80 border border-white/5 space-y-1">
                <span className="text-[11px] text-[#9AA3B8] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#3B6CFF]" /> Population At Risk
                </span>
                <p className="text-2xl font-mono font-bold text-[#F5F7FB]">
                  {kpis.totalAffected.toLocaleString()}
                </p>
                <span className="text-[10px] text-[#FF4D5E] font-semibold block">
                  ↑ +38% above normal baseline
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#161D2E]/80 border border-white/5 space-y-1">
                <span className="text-[11px] text-[#9AA3B8] flex items-center gap-1">
                  <Waves className="w-3.5 h-3.5 text-[#4FB3FF]" /> Submerged Floodplain Area
                </span>
                <p className="text-2xl font-mono font-bold text-[#4FB3FF]">
                  {(simulationRainfallMm * 0.42).toFixed(1)} km²
                </p>
                <span className="text-[10px] text-[#6B7488] block">
                  Daya & Bhargavi river basins
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#161D2E]/80 border border-white/5 space-y-1">
                <span className="text-[11px] text-[#9AA3B8] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#FF4D5E]" /> Critical Distress SOS Surge
                </span>
                <p className="text-2xl font-mono font-bold text-[#FF4D5E]">
                  {kpis.criticalSOSCount}
                </p>
                <span className="text-[10px] text-[#FF4D5E] block">
                  Immediate boat squads needed
                </span>
              </div>
            </div>

            {/* High-Risk Embankment Warning Panel */}
            <div className="p-4 rounded-xl bg-[#FF4D5E]/10 border border-[#FF4D5E]/30 text-xs text-[#F5F7FB] flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF4D5E]/20 flex items-center justify-center text-[#FF4D5E] shrink-0 mt-0.5">
                <AlertOctagon className="w-4 h-4 animate-pulse" />
              </div>
              <div className="space-y-1">
                <strong className="text-sm font-bold text-[#FF4D5E] block">
                  Simulated Embankment Failure Warning:
                </strong>
                <p className="text-xs text-[#9AA3B8] leading-relaxed">
                  With rainfall exceeding {simulationRainfallMm}mm combined with {simulationTideHeightM}m tidal surge, Section 14 of the Kanas embankment suffers a <strong>98% probability of catastrophic breach</strong> within 180 minutes.
                </p>
                <div className="pt-1 flex items-center gap-3 text-[11px] text-[#F5F7FB]">
                  <span>Pre-alert sent to Collectorate</span>
                  <span>•</span>
                  <span className="text-[#2FD07F]">12 Relief Camps Pre-notified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
