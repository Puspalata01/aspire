"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wind,
  Waves,
  Flame,
  Mountain,
  Activity,
  AlertTriangle,
  X,
  ExternalLink,
  Shield,
  Layers,
  MapPin,
  Clock,
  Compass,
  Radio,
  Sparkles,
  Maximize2,
} from "lucide-react";
import { Disaster } from "@/types";

export interface StateNode {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  status: "normal" | "warning" | "critical";
  activeHazardsCount: number;
}

export const INDIAN_STATES: StateNode[] = [
  { id: "OD", name: "Odisha", code: "OD", lat: 20.29, lng: 85.82, status: "critical", activeHazardsCount: 3 },
  { id: "WB", name: "West Bengal", code: "WB", lat: 22.57, lng: 88.36, status: "warning", activeHazardsCount: 1 },
  { id: "AP", name: "Andhra Pradesh", code: "AP", lat: 16.50, lng: 80.64, status: "warning", activeHazardsCount: 1 },
  { id: "TN", name: "Tamil Nadu", code: "TN", lat: 13.08, lng: 80.27, status: "normal", activeHazardsCount: 0 },
  { id: "KL", name: "Kerala", code: "KL", lat: 9.93, lng: 76.26, status: "normal", activeHazardsCount: 0 },
  { id: "KA", name: "Karnataka", code: "KA", lat: 12.97, lng: 77.59, status: "normal", activeHazardsCount: 0 },
  { id: "MH", name: "Maharashtra", code: "MH", lat: 19.07, lng: 72.87, status: "normal", activeHazardsCount: 0 },
  { id: "GJ", name: "Gujarat", code: "GJ", lat: 23.02, lng: 72.57, status: "normal", activeHazardsCount: 0 },
  { id: "TG", name: "Telangana", code: "TG", lat: 17.38, lng: 78.48, status: "normal", activeHazardsCount: 0 },
  { id: "MP", name: "Madhya Pradesh", code: "MP", lat: 23.25, lng: 77.41, status: "normal", activeHazardsCount: 0 },
  { id: "RJ", name: "Rajasthan", code: "RJ", lat: 26.91, lng: 75.78, status: "normal", activeHazardsCount: 0 },
  { id: "UP", name: "Uttar Pradesh", code: "UP", lat: 26.84, lng: 80.94, status: "normal", activeHazardsCount: 0 },
  { id: "BR", name: "Bihar", code: "BR", lat: 25.59, lng: 85.13, status: "warning", activeHazardsCount: 1 },
  { id: "AS", name: "Assam", code: "AS", lat: 26.14, lng: 91.73, status: "warning", activeHazardsCount: 1 },
  { id: "PB", name: "Punjab", code: "PB", lat: 30.73, lng: 76.77, status: "normal", activeHazardsCount: 0 },
  { id: "DL", name: "Delhi", code: "DL", lat: 28.61, lng: 77.20, status: "normal", activeHazardsCount: 0 },
  { id: "JK", name: "Jammu & Kashmir", code: "JK", lat: 34.08, lng: 74.79, status: "normal", activeHazardsCount: 0 },
  { id: "UK", name: "Uttarakhand", code: "UK", lat: 30.31, lng: 78.03, status: "normal", activeHazardsCount: 0 },
];

function latLngToSvg(lat: number, lng: number) {
  // Bounding box for India: lng 68..98, lat 8..37
  const x = ((lng - 68) / (98 - 68)) * 520 + 40;
  const y = ((37 - lat) / (37 - 8)) * 580 + 35;
  return { x, y };
}

interface IndiaDisasterSimulationProps {
  disasters: Disaster[];
  selectedDisasterId?: string;
  onSelectDisaster?: (disaster: Disaster) => void;
}

export function IndiaDisasterSimulation({
  disasters,
  selectedDisasterId,
  onSelectDisaster,
}: IndiaDisasterSimulationProps) {
  const [selectedState, setSelectedState] = useState<string>("OD");
  const [activeHazardPreview, setActiveHazardPreview] = useState<Disaster | null>(null);
  const [viewMode, setViewMode] = useState<"simulation" | "sat" | "mesh">("simulation");

  // Filter or augment disasters for the selected state
  const stateDisasters = disasters.filter((d) => {
    if (selectedState === "OD") return true;
    if (selectedState === "WB") return d.type === "cyclone" || d.name.toLowerCase().includes("bengal");
    if (selectedState === "AP") return d.type === "cyclone" || d.name.toLowerCase().includes("andhra");
    if (selectedState === "BR") return d.type === "flood";
    if (selectedState === "AS") return d.type === "flood";
    return false;
  });

  const activeStateNode = INDIAN_STATES.find((s) => s.id === selectedState) || INDIAN_STATES[0];

  return (
    <div className="relative w-full rounded-[24px] bg-[#0A0E1A]/90 border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl flex flex-col">
      {/* ─────────────────────────────────────────────────────────────
          TOP CONTROL BAR: TITLE & STATE QUICK TABS
         ───────────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#0E1524]/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#3B6CFF]/20 border border-[#3B6CFF]/40 flex items-center justify-center text-[#4FB3FF]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs tracking-wide text-[#F5F7FB]">
                NATIONAL DISASTER DIGITAL TWIN
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#3B6CFF]/20 text-[#4FB3FF] border border-[#3B6CFF]/40">
                INDIA SIMULATION
              </span>
            </div>
            <p className="text-[10px] text-[#8E99AF]">
              Live model telemetry across 28 states & union territories
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Fullscreen GIS Link */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#161D2E] p-0.5 rounded-xl border border-white/5 text-[10px]">
            <button
              type="button"
              onClick={() => setViewMode("simulation")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                viewMode === "simulation" ? "bg-[#3B6CFF] text-white shadow-sm" : "text-[#8E99AF] hover:text-white"
              }`}
            >
              Simulation
            </button>
            <button
              type="button"
              onClick={() => setViewMode("sat")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                viewMode === "sat" ? "bg-[#3B6CFF] text-white shadow-sm" : "text-[#8E99AF] hover:text-white"
              }`}
            >
              Radar Overlay
            </button>
          </div>

          <Link
            href="/authority/map"
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#8E99AF] hover:text-white transition-all flex items-center gap-1 text-[11px]"
            title="Open Full 3D Map"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* State Quick-Selector Pill Strip */}
      <div className="px-4 py-2 border-b border-white/5 bg-[#080D19]/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
        <span className="text-[10px] uppercase font-mono text-[#6B7488] shrink-0 mr-1">
          Select State:
        </span>
        {INDIAN_STATES.map((st) => {
          const isSelected = selectedState === st.id;
          const isCritical = st.status === "critical";
          const isWarning = st.status === "warning";
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => {
                setSelectedState(st.id);
                setActiveHazardPreview(null);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? "bg-[#3B6CFF] text-white shadow-[0_0_12px_rgba(59,108,255,0.5)] border border-[#4FB3FF]/50"
                  : isCritical
                  ? "bg-[#FF4D5E]/15 text-[#FF4D5E] border border-[#FF4D5E]/30 hover:bg-[#FF4D5E]/25"
                  : isWarning
                  ? "bg-[#FF8A3D]/15 text-[#FF8A3D] border border-[#FF8A3D]/30 hover:bg-[#FF8A3D]/25"
                  : "bg-white/5 text-[#8E99AF] hover:text-white hover:bg-white/10"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCritical ? "bg-[#FF4D5E] animate-ping" : isWarning ? "bg-[#FF8A3D]" : "bg-[#2FD07F]"
                }`}
              />
              <span>{st.name}</span>
              {st.activeHazardsCount > 0 && (
                <span className="font-mono text-[9px] px-1 rounded-full bg-white/20">
                  {st.activeHazardsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MAIN SIMULATION STAGE: INTERACTIVE SVG MAP OF INDIA
         ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full h-[460px] bg-[#05070D] flex items-center justify-center overflow-hidden">
        {/* Radar concentric pulse grid for background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[500px] h-[500px] rounded-full border border-[#3B6CFF]/30" />
          <div className="w-[360px] h-[360px] rounded-full border border-[#3B6CFF]/20" />
          <div className="w-[200px] h-[200px] rounded-full border border-[#3B6CFF]/15" />
        </div>

        {/* The SVG Canvas of India */}
        <svg
          viewBox="0 0 600 650"
          className="w-full h-full max-h-[460px] select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="cycloneVortexGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF4D5E" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#FF8A3D" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FF4D5E" stopOpacity="0.0" />
            </radialGradient>
            <radialGradient id="stateGlowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3B6CFF" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#3B6CFF" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="coastlineGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3B6CFF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#2FD07F" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Precision Coastline & Land Boundary Path for India */}
          <path
            d="
              M 155 75
              C 185 70, 215 95, 230 115
              C 250 140, 280 150, 310 160
              C 340 170, 380 165, 410 180
              C 440 195, 470 215, 490 240
              C 480 270, 450 280, 430 285
              C 410 290, 380 300, 370 320
              C 365 345, 385 365, 360 390
              C 340 415, 320 440, 290 480
              C 260 520, 230 560, 215 580
              C 200 560, 180 520, 175 480
              C 170 440, 160 410, 150 375
              C 135 340, 110 330, 95 330
              C 80 330, 75 350, 70 340
              C 65 310, 80 280, 95 250
              C 110 220, 125 180, 135 150
              Z
            "
            fill="#0E1628"
            stroke="url(#coastlineGrad)"
            strokeWidth="1.8"
            className="transition-colors hover:fill-[#121D34]"
          />

          {/* Bay of Bengal & Arabian Sea Vector Coordinate Guides */}
          <text x="420" y="460" fill="#293952" fontSize="11" fontFamily="monospace" fontWeight="bold">
            BAY OF BENGAL
          </text>
          <text x="50" y="490" fill="#293952" fontSize="11" fontFamily="monospace" fontWeight="bold">
            ARABIAN SEA
          </text>
          <text x="210" y="630" fill="#293952" fontSize="10" fontFamily="monospace" fontWeight="bold">
            INDIAN OCEAN
          </text>

          {/* Coordinate Lat/Lng Grid Markings */}
          <line x1="40" y1="200" x2="560" y2="200" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
          <line x1="40" y1="360" x2="560" y2="360" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
          <line x1="40" y1="520" x2="560" y2="520" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
          <line x1="200" y1="40" x2="200" y2="600" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
          <line x1="360" y1="40" x2="360" y2="600" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />

          {/* State Connection Network Lines (Subtle telemetry mesh) */}
          {INDIAN_STATES.map((st, i) => {
            const next = INDIAN_STATES[(i + 1) % INDIAN_STATES.length];
            const p1 = latLngToSvg(st.lat, st.lng);
            const p2 = latLngToSvg(next.lat, next.lng);
            return (
              <line
                key={`mesh-${st.id}-${next.id}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="rgba(59,108,255,0.06)"
                strokeWidth="1"
              />
            );
          })}

          {/* ── ALL INDIAN STATE NODES (DOT MARKED) ── */}
          {INDIAN_STATES.map((st) => {
            const { x, y } = latLngToSvg(st.lat, st.lng);
            const isSelected = selectedState === st.id;
            const isCritical = st.status === "critical";
            const isWarning = st.status === "warning";

            return (
              <g
                key={`node-${st.id}`}
                className="cursor-pointer group"
                onClick={() => {
                  setSelectedState(st.id);
                  setActiveHazardPreview(null);
                }}
              >
                {/* Active selection pulse ripple */}
                {isSelected && (
                  <circle
                    cx={x}
                    y={y}
                    r={24}
                    fill="url(#stateGlowGrad)"
                    className="animate-pulse"
                  />
                )}

                {/* Warning/Critical Outer Ring */}
                {(isCritical || isWarning) && (
                  <circle
                    cx={x}
                    y={y}
                    r={isSelected ? 14 : 9}
                    fill="none"
                    stroke={isCritical ? "#FF4D5E" : "#FF8A3D"}
                    strokeWidth="1.5"
                    className="animate-ping"
                    style={{ animationDuration: isCritical ? "2.5s" : "4s" }}
                  />
                )}

                {/* State Center Dot */}
                <circle
                  cx={x}
                  y={y}
                  r={isSelected ? 7 : 4.5}
                  fill={
                    isSelected
                      ? "#3B6CFF"
                      : isCritical
                      ? "#FF4D5E"
                      : isWarning
                      ? "#FF8A3D"
                      : "#6B7488"
                  }
                  stroke={isSelected ? "#FFFFFF" : "rgba(255,255,255,0.3)"}
                  strokeWidth={isSelected ? "2" : "1"}
                  className="transition-transform group-hover:scale-125"
                />

                {/* State Label Text */}
                <text
                  x={x}
                  y={y - (isSelected ? 12 : 8)}
                  textAnchor="middle"
                  fill={isSelected ? "#F5F7FB" : "#8E99AF"}
                  fontSize={isSelected ? "11" : "8"}
                  fontWeight={isSelected ? "bold" : "normal"}
                  fontFamily="sans-serif"
                  className="pointer-events-none drop-shadow"
                >
                  {st.code}
                </text>
              </g>
            );
          })}

          {/* ─────────────────────────────────────────────────────────
              REAL HAZARD SYMBOLS DETECTED BY ML MODEL
             ───────────────────────────────────────────────────────── */}
          {stateDisasters.map((disaster) => {
            const lat = disaster.center?.lat || (disaster as any).center_point?.lat || 20.29;
            const lng = disaster.center?.lng || (disaster as any).center_point?.lng || 85.82;
            const { x, y } = latLngToSvg(lat, lng);
            const isCyclone = disaster.type === "cyclone";
            const isFlood = disaster.type === "flood";
            const isHeat = disaster.type === "heatwave";

            return (
              <g
                key={`hazard-icon-${disaster.id}`}
                className="cursor-pointer group"
                onClick={() => {
                  setActiveHazardPreview(disaster);
                  onSelectDisaster?.(disaster);
                }}
              >
                {/* Outer Danger Vortex Gradient */}
                {isCyclone && (
                  <circle
                    cx={x}
                    y={y}
                    r={36}
                    fill="url(#cycloneVortexGrad)"
                    className="animate-pulse"
                  />
                )}

                {/* Rotating Cyclone Swirl Arms or Wave Crests */}
                {isCyclone ? (
                  <g className="animate-spin" style={{ transformOrigin: `${x}px ${y}px`, animationDuration: "5s" }}>
                    <circle cx={x} cy={y} r={16} fill="none" stroke="#FF4D5E" strokeWidth="2.5" strokeDasharray="18 10" />
                    <circle cx={x} cy={y} r={10} fill="none" stroke="#FF8A3D" strokeWidth="2" strokeDasharray="12 6" />
                    <circle cx={x} cy={y} r={4} fill="#FF4D5E" />
                  </g>
                ) : isFlood ? (
                  <g>
                    <circle cx={x} cy={y} r={14} fill="#3B6CFF" fillOpacity="0.3" stroke="#3B6CFF" strokeWidth="2" />
                    <path
                      d={`M ${x - 8} ${y} Q ${x - 4} ${y - 6}, ${x} ${y} T ${x + 8} ${y}`}
                      fill="none"
                      stroke="#4FB3FF"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </g>
                ) : (
                  <g>
                    <circle cx={x} cy={y} r={14} fill="#F5C542" fillOpacity="0.3" stroke="#F5C542" strokeWidth="2" />
                    <circle cx={x} cy={y} r={5} fill="#FF8A3D" className="animate-ping" />
                  </g>
                )}

                {/* Floating Hazard Badge Label */}
                <g transform={`translate(${x + 18}, ${y - 14})`}>
                  <rect
                    x="0"
                    y="0"
                    width={isCyclone ? "130" : "110"}
                    height="24"
                    rx="12"
                    fill="#0E1628"
                    stroke={isCyclone ? "#FF4D5E" : isFlood ? "#3B6CFF" : "#F5C542"}
                    strokeWidth="1.2"
                    className="drop-shadow-lg"
                  />
                  <text
                    x="10"
                    y="15"
                    fill="#F5F7FB"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {isCyclone ? "Cyclone Landfall" : isFlood ? "Flood Crest" : "Heatwave"}
                  </text>
                  <text
                    x={isCyclone ? "116" : "96"}
                    y="15"
                    fill="#4FB3FF"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    View →
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* ─────────────────────────────────────────────────────────────
            DETAILED HAZARD PREVIEW MODAL / DRAWER (WHEN CLICKED)
           ───────────────────────────────────────────────────────────── */}
        {activeHazardPreview && (
          <div className="absolute bottom-4 right-4 z-30 w-[320px] rounded-[18px] bg-[#0E1524]/95 border border-[#FF4D5E]/40 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FF4D5E]/20 text-[#FF4D5E] flex items-center justify-center">
                  {activeHazardPreview.type === "cyclone" ? (
                    <Wind className="w-4 h-4 animate-spin" style={{ animationDuration: "6s" }} />
                  ) : activeHazardPreview.type === "flood" ? (
                    <Waves className="w-4 h-4" />
                  ) : (
                    <Flame className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#F5F7FB] block leading-tight truncate max-w-[200px]">
                    {activeHazardPreview.name}
                  </span>
                  <span className="text-[10px] text-[#FF4D5E] font-semibold uppercase tracking-wider">
                    {activeHazardPreview.severity} • {activeHazardPreview.status}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveHazardPreview(null)}
                className="text-[#8E99AF] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-[#CBD5E1] leading-relaxed line-clamp-2">
              {activeHazardPreview.description || "Active high-stakes disaster footprint projected by AI impact models."}
            </p>

            {/* Model Physical Telemetry Metrics */}
            <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-[#080D19]/80 border border-white/5 text-center">
              <div>
                <span className="text-[9px] text-[#6B7488] block">Intensity</span>
                <span className="font-mono text-xs font-bold text-[#F5F7FB]">
                  {(activeHazardPreview as any).metadata?.wind_speed_kmh
                    ? `${(activeHazardPreview as any).metadata.wind_speed_kmh} km/h`
                    : (activeHazardPreview as any).metadata?.water_level_m
                    ? `${(activeHazardPreview as any).metadata.water_level_m} m`
                    : "Severe"}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-[#6B7488] block">At Risk</span>
                <span className="font-mono text-xs font-bold text-[#F5F7FB]">
                  {activeHazardPreview.affectedPopulation
                    ? `${Math.round(activeHazardPreview.affectedPopulation / 1000)}k`
                    : "342k"}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-[#6B7488] block">Model Source</span>
                <span className="font-mono text-[9px] font-semibold text-[#4FB3FF] truncate block">
                  {(activeHazardPreview as any).source || "ASPIRE AI / IMD"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <Link
                href="/authority/map"
                className="flex-1 py-2 rounded-xl bg-[#3B6CFF] hover:bg-[#2F5DD8] text-white font-semibold text-[11px] text-center shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                <span>3D Spatial Map</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                href="/authority/evacuation"
                className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#CBD5E1] hover:text-white font-semibold text-[11px] text-center transition-all"
              >
                Evacuate
              </Link>
            </div>
          </div>
        )}

        {/* Bottom Legend Overlay */}
        <div className="absolute bottom-3 left-4 z-20 flex items-center gap-3 bg-[#0E1524]/80 px-3 py-1.5 rounded-full border border-white/10 text-[10px] text-[#8E99AF] backdrop-blur-xl">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF4D5E] animate-ping" />
            <span className="text-[#F5F7FB] font-medium">Critical (Cyclone/Surge)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF8A3D]" />
            <span>High Flood Alert</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2FD07F]" />
            <span>Normal Telemetry</span>
          </div>
        </div>
      </div>
    </div>
  );
}
