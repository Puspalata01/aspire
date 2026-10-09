"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoadSegment } from "@/types";
import {
  Navigation,
  AlertTriangle,
  CheckCircle,
  Ban,
  ArrowRight,
  ShieldCheck,
  Compass,
  LocateFixed,
  MapPin,
} from "lucide-react";
import {
  useCitizenLocationStore,
  CITIZEN_SECTORS,
} from "@/stores/useCitizenLocationStore";

export default function CitizenSafeRoutesPage() {
  const [roads, setRoads] = useState<RoadSegment[]>([]);

  const {
    lat: citizenLat,
    lng: citizenLng,
    locationName,
    sectorId,
    isGPS,
    isLocating,
    setSector,
    detectGPS,
  } = useCitizenLocationStore();

  useEffect(() => {
    api.getRoads().then((data) => {
      if (data && data.length > 0) {
        setRoads(data);
      }
    });
  }, []);

  return (
    <div className="space-y-6 pb-28 text-[#F5F7FB] font-sans select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER
         ───────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B6CFF] animate-ping" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Safe Evacuation Route Planner
          </h1>
        </div>
        <p className="text-xs text-[#8E99AF] mt-1 max-w-xl">
          Real-time highway viability avoiding flooded canal breaches, storm surge inundation, and downed electrical lines.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CITIZEN AREA & GPS ACQUISITION CONTROL BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-[22px] bg-[#101624]/90 border border-white/10 backdrop-blur-2xl shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3B6CFF]/20 text-[#4FB3FF] border border-[#3B6CFF]/40 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: "25s" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">ROUTING ORIGIN:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#3B6CFF]/20 text-[#4FB3FF] border border-[#3B6CFF]/30">
                {isGPS ? "REAL-TIME GPS" : "DESIGNATED SECTOR"}
              </span>
            </div>
            <p className="font-mono text-[11px] text-[#8E99AF]">
              {locationName} ({citizenLat.toFixed(4)}°N, {citizenLng.toFixed(4)}°E)
            </p>
          </div>
        </div>

        {/* GPS Button + Preset Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={sectorId}
            onChange={(e) => setSector(e.target.value)}
            className="bg-[#161D2E] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#3B6CFF] cursor-pointer"
          >
            {CITIZEN_SECTORS.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name} ({sec.zone})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => detectGPS()}
            disabled={isLocating}
            className="px-3 py-1.5 rounded-xl bg-[#3B6CFF] hover:bg-[#2F6FE0] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
            title="Auto-detect current GPS coordinates"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>{isLocating ? "Acquiring..." : "Detect GPS"}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. RECOMMENDED PRIMARY EVACUATION ARTERY
         ───────────────────────────────────────────────────────────── */}
      <div className="p-6 rounded-[24px] bg-gradient-to-r from-[#101F18] via-[#101624] to-[#0A0F1D] border border-[#2FD07F]/40 shadow-2xl text-xs space-y-2 backdrop-blur-2xl">
        <div className="flex items-center gap-2 text-[#2FD07F]">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span className="font-mono font-bold uppercase tracking-wider text-[11px]">
            RECOMMENDED HIGH-GROUND CORRIDOR FROM {locationName.toUpperCase()}
          </span>
        </div>
        <h3 className="text-base font-extrabold text-white">
          NH-316 Northbound Expressway (Bhubaneswar Inland Artery)
        </h3>
        <p className="text-xs text-[#CBD5E1] leading-relaxed">
          Take Grand Road to the Pipili elevated bypass northward toward Bhubaneswar. Road remains dry with active police traffic marshals, designated fueling pumps, and emergency towing cranes.
        </p>
        <div className="pt-2 flex items-center gap-3 font-mono text-[11px] text-[#2FD07F]">
          <span>STATUS: CLEAR & PATROLLED</span>
          <span>•</span>
          <span>SPEED: 45 KM/H RECOMMENDED</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. CORRIDOR & ROAD NETWORK STATUS
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E99AF]">
          Regional Highway & Coastal Road Status
        </h3>

        <div className="space-y-3">
          {roads.map((road) => (
            <div
              key={road.id}
              className="p-5 rounded-[22px] border border-white/10 bg-[#101624]/90 hover:border-white/20 shadow-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      road.status === "open"
                        ? "bg-[#2FD07F] shadow-[0_0_8px_#2FD07F]"
                        : road.status === "blocked"
                        ? "bg-[#FF4D5E] shadow-[0_0_8px_#FF4D5E]"
                        : "bg-[#3B6CFF] shadow-[0_0_8px_#3B6CFF]"
                    }`}
                  />
                  <h4 className="text-xs font-bold text-white">{road.name}</h4>
                </div>
                <p className="text-xs text-[#8E99AF] leading-relaxed">{road.notes}</p>
              </div>

              <span
                className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase font-mono border self-start sm:self-auto ${
                  road.status === "open"
                    ? "bg-[#2FD07F]/20 text-[#2FD07F] border-[#2FD07F]/40"
                    : road.status === "blocked"
                    ? "bg-[#FF4D5E]/20 text-[#FF4D5E] border-[#FF4D5E]/40"
                    : "bg-[#3B6CFF]/20 text-[#4FB3FF] border-[#3B6CFF]/40"
                }`}
              >
                {road.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
