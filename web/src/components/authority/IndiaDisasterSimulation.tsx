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
  Globe,
} from "lucide-react";
import { Disaster } from "@/types";
import { RealEarthMap, INDIAN_STATE_COORDINATES } from "@/components/map/RealEarthMap";

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
  { id: "AP", name: "Andhra Pradesh", code: "AP", lat: 16.5, lng: 80.64, status: "warning", activeHazardsCount: 1 },
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
];

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

  // Active state data
  const activeStateNode = INDIAN_STATES.find((s) => s.id === selectedState) || INDIAN_STATES[0];

  return (
    <div className="relative w-full rounded-[24px] bg-[#0A0E1A]/90 border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl flex flex-col">
      {/* ─────────────────────────────────────────────────────────────
          TOP CONTROL BAR: TITLE & STATE QUICK TABS
         ───────────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#0E1524]/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#3B6CFF]/20 border border-[#3B6CFF]/40 flex items-center justify-center text-[#4FB3FF]">
            <Globe className="w-4 h-4 animate-spin" style={{ animationDuration: "20s" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs tracking-wide text-[#F5F7FB]">
                NATIONAL DISASTER DIGITAL TWIN
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#3B6CFF]/20 text-[#4FB3FF] border border-[#3B6CFF]/40">
                REAL EARTH 3D
              </span>
            </div>
            <p className="text-[10px] text-[#8E99AF]">
              Live model telemetry across 28 states & union territories • WebGL Hardware Accelerated
            </p>
          </div>
        </div>

        {/* Fullscreen Map Link */}
        <div className="flex items-center gap-2">
          <Link
            href="/authority/map"
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#8E99AF] hover:text-white transition-all flex items-center gap-1.5 text-[11px] font-semibold"
            title="Open Full 3D Map Center"
          >
            <span>Full GIS Map</span>
            <Maximize2 className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* State Quick-Selector Pill Strip */}
      <div className="px-4 py-2 border-b border-white/5 bg-[#080D19]/70 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
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
          MAIN REAL EARTH 3D WEBGL MAP SURFACE
         ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full h-[480px] bg-[#05070D]">
        <RealEarthMap
          height="100%"
          initialMode="globe"
          initialTheme="satellite"
          initialCenter={[85.82, 20.29]} // Centered on Bay of Bengal / Odisha
          initialZoom={4.8}
          initialPitch={35}
          disasters={disasters}
          selectedStateCode={selectedState}
          onSelectState={(code) => setSelectedState(code)}
          onSelectEntity={(entity) => {
            if (entity?.type || entity?.status) {
              setActiveHazardPreview(entity);
              if (onSelectDisaster) onSelectDisaster(entity);
            }
          }}
          showTopBar={true}
          showTelemetryBar={true}
          showCameraControls={true}
        />

        {/* ─────────────────────────────────────────────────────────────
            ACTIVE HAZARD DETAIL FLOATING PREVIEW CARD
           ───────────────────────────────────────────────────────────── */}
        {activeHazardPreview && (
          <div className="absolute bottom-5 left-5 z-30 max-w-sm rounded-[20px] bg-[#101624]/95 border border-white/15 p-4 backdrop-blur-2xl text-[#F5F7FB] shadow-[0_25px_50px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-3 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    activeHazardPreview.severity === "critical"
                      ? "bg-[#FF4D5E]/20 text-[#FF4D5E]"
                      : "bg-[#FF8A3D]/20 text-[#FF8A3D]"
                  }`}
                >
                  {activeHazardPreview.type === "cyclone" ? (
                    <Wind className="w-4 h-4 animate-spin" style={{ animationDuration: "5s" }} />
                  ) : activeHazardPreview.type === "flood" ? (
                    <Waves className="w-4 h-4" />
                  ) : (
                    <Flame className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{activeHazardPreview.name}</h4>
                  <span className="text-[10px] font-mono text-[#8E99AF] uppercase">
                    {(activeHazardPreview as any).metadata?.category || "Tier 1 Hazard"} •{" "}
                    {activeHazardPreview.severity.toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveHazardPreview(null)}
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-[#8E99AF] hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2 text-[11px] font-mono">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[#8E99AF] block text-[9px]">WIND / DISCHARGE</span>
                <span className="text-white font-bold">
                  {(activeHazardPreview as any).metadata?.wind_speed_kmh
                    ? `${(activeHazardPreview as any).metadata?.wind_speed_kmh} km/h`
                    : (activeHazardPreview as any).metadata?.water_level_m
                    ? `${(activeHazardPreview as any).metadata?.water_level_m}m crest`
                    : "Severe Anomaly"}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[#8E99AF] block text-[9px]">AFFECTED POP</span>
                <span className="text-[#FF4D5E] font-bold">
                  {activeHazardPreview.affectedPopulation
                    ? activeHazardPreview.affectedPopulation.toLocaleString()
                    : (activeHazardPreview as any).affected_population
                    ? Number((activeHazardPreview as any).affected_population).toLocaleString()
                    : "1.42M at risk"}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-[#9AA3B8] leading-tight line-clamp-2">
              {activeHazardPreview.description || "Active spatial telemetry streamed from IMD/OSDMA radar network."}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <Link
                href="/authority/map"
                className="flex-1 py-1.5 px-3 rounded-xl bg-[#3B6CFF] hover:bg-[#2F6FE0] text-white text-[10px] font-bold text-center flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <span>Full GIS Trajectory</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                href="/authority/simulation"
                className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[10px] font-bold flex items-center gap-1 transition-colors"
              >
                <span>Physics Sim</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
