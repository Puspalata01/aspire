"use client";

import React, { useState } from "react";
import { useDisasterStore } from "@/stores/useDisasterStore";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { DangerLevelIndicator } from "@/components/shared/DangerLevelIndicator";
import {
  Flame,
  BrainCircuit,
  Info,
  TrendingUp,
  AlertTriangle,
  Sliders,
  CheckCircle,
  Play,
  RotateCcw,
  Waves,
  CloudRain,
  ShieldAlert,
} from "lucide-react";

export function RiskMatrixView() {
  const {
    disaster,
    simulationRainfallMm,
    simulationTideHeightM,
    setSimulationParam,
    runSimulation,
    isSimulating,
  } = useDisasterStore();

  const riskFactors = [
    { name: "Precipitation Accumulation (24h)", weight: 35, score: 92, status: "Severe", color: "#FF4D5E" },
    { name: "River Daya Crest Height Above Danger", weight: 25, score: 88, status: "Critical", color: "#FF4D5E" },
    { name: "Storm Surge Inundation Probability", weight: 20, score: 84, status: "High", color: "#FF8A3D" },
    { name: "Population Density in Low-Lying Delta", weight: 12, score: 76, status: "Elevated", color: "#F5C542" },
    { name: "Structural Vulnerability (Kutcha Houses)", weight: 8, score: 89, status: "Severe", color: "#FF4D5E" },
  ];

  return (
    <div className="space-y-5 select-none">
      {/* ── Top AI Risk Score Banner (Visual Big Metric + Traffic Light Threat Indicator) ── */}
      <div className="rounded-[20px] border border-white/10 bg-[#101624]/75 p-5 lg:p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[#FF4D5E]/15 border border-[#FF4D5E]/30 text-[#FF4D5E]">
                <BrainCircuit className="w-5 h-5 animate-pulse" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF4D5E]">
                Composite Disaster Risk Index (CDRI)
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#F5F7FB]">
              Category 4 Surge Risk: <span className="font-mono text-[#FF4D5E]">89.4</span> / 100
            </h2>
            <p className="text-xs text-[#9AA3B8] max-w-2xl leading-relaxed">
              Multi-hazard neural ensemble combining Sentinel-1 SAR inundation imagery, IMD Doppler radar velocities, and CWC hydrological river telemetry.
            </p>
          </div>

          {/* Quick Telemetry Chips (Large Numbers & Visual Threat Level) */}
          <div className="flex items-center gap-4 bg-[#05070D]/90 p-3 sm:p-4 px-5 rounded-[18px] border border-white/10 shadow-inner shrink-0 flex-wrap sm:flex-nowrap">
            <div className="text-center">
              <p className="text-[10px] text-[#6B7488] uppercase font-mono">Confidence</p>
              <p className="text-xl sm:text-2xl font-mono font-bold text-[#2FD07F]">94.2%</p>
            </div>
            <div className="h-8 w-px bg-white/10 hidden sm:block" />
            <div className="text-center">
              <p className="text-[10px] text-[#6B7488] uppercase font-mono">Lead Time</p>
              <p className="text-xl sm:text-2xl font-mono font-bold text-[#3B6CFF]">+6.5 hrs</p>
            </div>
            <div className="h-8 w-px bg-white/10 hidden sm:block" />
            <div className="text-center">
              <p className="text-[10px] text-[#6B7488] uppercase font-mono mb-1">Threat Level</p>
              <DangerLevelIndicator level={4} label="CRITICAL 4" showBar={true} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Two Column Bento Layout (Zonal Risk vs Factor Attribution) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Vulnerable Sector Zones */}
        <div className="rounded-[20px] border border-white/10 bg-[#101624]/75 p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-[#F5F7FB] flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#FF8A3D]" />
              Zonal Risk Assessment
            </h3>
            <span className="text-xs text-[#6B7488] font-mono">Puri District Coastal Sector</span>
          </div>

          <div className="space-y-3">
            {(disaster.zones || []).map((zone) => {
              const evacPct = zone.population > 0 ? Math.round((zone.evacuatedCount / zone.population) * 100) : 0;
              return (
                <div
                  key={zone.id}
                  className="p-3.5 rounded-[16px] border border-white/10 bg-[#161D2E]/50 hover:border-white/20 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#F5F7FB]">{zone.name}</h4>
                      <p className="text-[11px] text-[#9AA3B8] mt-0.5 font-mono">
                        Population: <span className="text-[#F5F7FB] font-bold">{zone.population.toLocaleString()}</span> | Evacuated:{" "}
                        <span className="text-[#2FD07F] font-bold">{zone.evacuatedCount.toLocaleString()} ({evacPct}%)</span>
                      </p>
                    </div>
                    <SeverityBadge severity={zone.severity as any} />
                  </div>

                  {/* Evacuation Visual Progress Bar (Color-Coded) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-[#6B7488]">
                      <span>Relocation Progress</span>
                      <span className="text-[#2FD07F] font-bold">{evacPct}% Complete</span>
                    </div>
                    <div className="w-full bg-[#05070D] h-2.5 rounded-full overflow-hidden border border-white/10 flex">
                      <div
                        className="h-full bg-[#2FD07F] transition-all duration-700"
                        style={{ width: `${evacPct}%` }}
                      />
                      <div
                        className="h-full bg-[#FF4D5E] opacity-60"
                        style={{ width: `${100 - evacPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Attribution Weights (SHAP Factor Importance) */}
        <div className="rounded-[20px] border border-white/10 bg-[#101624]/75 p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-[#F5F7FB] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#3B6CFF]" />
              Neural Feature Attribution (SHAP)
            </h3>
            <span className="text-xs text-[#6B7488] font-mono">Weight Impact %</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {riskFactors.map((f, i) => (
              <div key={i} className="space-y-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#F5F7FB] font-medium">{f.name}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-mono px-2 py-0.2 rounded-full font-bold"
                      style={{
                        backgroundColor: `${f.color}20`,
                        color: f.color,
                        border: `1px solid ${f.color}40`,
                      }}
                    >
                      {f.status}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#F5F7FB]">{f.weight}%</span>
                  </div>
                </div>

                {/* Visual Fill Track */}
                <div className="w-full bg-[#05070D] h-2 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${f.score}%`,
                      backgroundColor: f.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Interactive What-If Scenario Stress Testing ── */}
      <div className="rounded-[20px] border border-white/10 bg-[#101624]/75 p-5 lg:p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#3B6CFF]" />
            <h3 className="text-sm font-bold text-[#F5F7FB]">
              Interactive Scenario Stress Simulator
            </h3>
          </div>
          <span className="text-xs text-[#2FD07F] font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2FD07F] animate-pulse" />
            AI SIMULATOR ONLINE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* Slider 1: Simulated Rainfall */}
          <div className="space-y-2.5 p-3.5 rounded-xl bg-[#161D2E]/50 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F5F7FB] flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-[#4FB3FF]" />
                Rainfall Accumulation (24h)
              </span>
              <span className="font-mono text-xs font-bold text-[#4FB3FF] px-2 py-0.5 rounded-full bg-[#4FB3FF]/15 border border-[#4FB3FF]/30">
                {simulationRainfallMm} mm
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="400"
              step="5"
              value={simulationRainfallMm}
              onChange={(e) => setSimulationParam("simulationRainfallMm", Number(e.target.value))}
              className="w-full accent-[#3B6CFF] h-2 bg-[#05070D] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#6B7488]">
              <span>0 mm (Normal)</span>
              <span>200 mm (Severe)</span>
              <span>400 mm (Extreme Flood)</span>
            </div>
          </div>

          {/* Slider 2: Storm Surge Tide Height */}
          <div className="space-y-2.5 p-3.5 rounded-xl bg-[#161D2E]/50 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F5F7FB] flex items-center gap-2">
                <Waves className="w-4 h-4 text-[#3B6CFF]" />
                Tidal Surge Crest Height
              </span>
              <span className="font-mono text-xs font-bold text-[#3B6CFF] px-2 py-0.5 rounded-full bg-[#3B6CFF]/15 border border-[#3B6CFF]/30">
                {simulationTideHeightM.toFixed(1)} m
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="0.2"
              value={simulationTideHeightM}
              onChange={(e) => setSimulationParam("simulationTideHeightM", Number(e.target.value))}
              className="w-full accent-[#3B6CFF] h-2 bg-[#05070D] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#6B7488]">
              <span>0.0 m (Baseline)</span>
              <span>4.0 m (Embankment Top)</span>
              <span>8.0 m (Catastrophic Breach)</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={runSimulation}
            disabled={isSimulating}
            className="px-5 py-2.5 rounded-xl bg-[#3B6CFF] hover:bg-[#2F5BD8] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_16px_rgba(59,108,255,0.4)] cursor-pointer disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Computing Inundation Vectors...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Execute Scenario Stress Test</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
