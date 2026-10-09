"use client";

import React, { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { Shelter } from "@/types";
import {
  Home,
  MapPin,
  Phone,
  Search,
  Navigation,
  LocateFixed,
  Filter,
  CheckCircle2,
  Clock,
  Compass,
} from "lucide-react";
import { CapacityBar } from "@/components/shared/CapacityBar";
import { extractLatLng } from "@/components/map/RealEarthMap";
import {
  useCitizenLocationStore,
  CITIZEN_SECTORS,
  calculateDistanceKm,
} from "@/stores/useCitizenLocationStore";

export default function CitizenSheltersPage() {
  const [search, setSearch] = useState("");
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "open">("all");

  const {
    lat: citizenLat,
    lng: citizenLng,
    locationName,
    sectorId,
    isGPS,
    isLocating,
    maxDistanceFilterKm,
    setSector,
    setMaxDistanceFilterKm,
    detectGPS,
  } = useCitizenLocationStore();

  useEffect(() => {
    api.getShelters().then((data) => {
      if (data && data.length > 0) {
        setShelters(data);
      }
    });
  }, []);

  // Compute calculated distance & walking time for every shelter
  const enrichedShelters = useMemo(() => {
    return shelters.map((sh) => {
      const pos = extractLatLng(sh) || { lat: 19.8, lng: 85.83 };
      const dist = calculateDistanceKm(citizenLat, citizenLng, pos.lat, pos.lng);
      return {
        ...sh,
        calculatedLat: pos.lat,
        calculatedLng: pos.lng,
        calculatedDistanceKm: dist,
        estimatedWalkMinutes: Math.round(dist * 13),
      };
    });
  }, [shelters, citizenLat, citizenLng]);

  // Filter & sort shelters: nearest first, filtered by max distance and search query
  const filtered = useMemo(() => {
    return enrichedShelters
      .filter((s) => {
        // Distance filter
        if (maxDistanceFilterKm < 900 && s.calculatedDistanceKm > maxDistanceFilterKm) {
          return false;
        }
        // Status filter
        if (statusFilter === "open" && s.status !== "open") {
          return false;
        }
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesName = s.name.toLowerCase().includes(q);
          const matchesAddr = s.address && s.address.toLowerCase().includes(q);
          return matchesName || matchesAddr;
        }
        return true;
      })
      .sort((a, b) => a.calculatedDistanceKm - b.calculatedDistanceKm);
  }, [enrichedShelters, maxDistanceFilterKm, statusFilter, search]);

  return (
    <div className="space-y-6 pb-28 text-[#1C1929] font-sans select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & INTRO
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1929] tracking-tight">
              Designated Disaster Shelters
            </h1>
          </div>
          <p className="text-xs text-[#5D5775] mt-1 max-w-xl">
            Multi-purpose cyclone & flood relief centers equipped with generators, RO water, emergency medical supplies, and food stocks.
          </p>
        </div>

        {/* Proximity Stats Pill */}
        <div className="px-4 py-2.5 rounded-2xl bg-white/95 border border-[#E7E2DA] shadow-sm backdrop-blur-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold font-mono text-sm border border-emerald-200">
            {filtered.length}
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#767092] uppercase block">
              Shelters in Radius
            </span>
            <span className="text-xs font-bold text-[#1C1929] font-mono">
              Closest: {filtered[0]?.calculatedDistanceKm ?? 0} km away
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CITIZEN AREA & GPS ACQUISITION CONTROL BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-[22px] bg-white/95 border border-[#E7E2DA] backdrop-blur-2xl shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE] flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: "25s" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1C1929]">CALCULATING PROXIMITY FROM:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE]">
                {isGPS ? "REAL-TIME GPS" : "DESIGNATED SECTOR"}
              </span>
            </div>
            <p className="font-mono text-[11px] text-[#5D5775]">
              {locationName} ({citizenLat.toFixed(4)}°N, {citizenLng.toFixed(4)}°E)
            </p>
          </div>
        </div>

        {/* GPS Button + Preset Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={sectorId}
            onChange={(e) => setSector(e.target.value)}
            className="bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl px-3 py-1.5 text-xs text-[#1C1929] focus:outline-none focus:border-[#7C3AED] cursor-pointer shadow-sm"
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
            className="px-3 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Auto-detect current GPS coordinates"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>{isLocating ? "Acquiring..." : "Detect GPS"}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SEARCH & RADIUS FILTERS BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white/95 border border-[#E7E2DA] shadow-sm backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#767092]" />
          <input
            type="text"
            placeholder="Search by shelter name or street address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl text-xs text-[#1C1929] placeholder-[#767092] focus:outline-none focus:border-[#7C3AED] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-bold text-[#767092] uppercase shrink-0">Radius:</span>
          {[
            { label: "≤ 5 km", val: 5 },
            { label: "≤ 15 km", val: 15 },
            { label: "≤ 30 km", val: 30 },
            { label: "All (State)", val: 999 },
          ].map((r) => (
            <button
              key={r.val}
              type="button"
              onClick={() => setMaxDistanceFilterKm(r.val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                maxDistanceFilterKm === r.val
                  ? "bg-[#7C3AED] text-white shadow-sm border border-[#7C3AED]"
                  : "bg-[#FAF8F5] border border-[#E7E2DA] text-[#5D5775] hover:text-[#1C1929]"
              }`}
            >
              {r.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === "all" ? "open" : "all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
              statusFilter === "open"
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-[#FAF8F5] border border-[#E7E2DA] text-[#5D5775] hover:text-[#1C1929]"
            }`}
          >
            {statusFilter === "open" ? "✓ Open Only" : "All Status"}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. SHELTER CARDS (SORTED BY PROXIMITY)
         ───────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-[24px] bg-white/95 border border-[#E7E2DA] shadow-sm text-center space-y-3">
          <Home className="w-10 h-10 text-[#767092] mx-auto opacity-40" />
          <h4 className="text-base font-bold text-[#1C1929]">No Shelters Found within Selected Radius</h4>
          <p className="text-xs text-[#5D5775] max-w-sm mx-auto">
            Try broadening the distance filter to 30 km or All Districts to locate regional shelters.
          </p>
          <button
            type="button"
            onClick={() => {
              setMaxDistanceFilterKm(999);
              setSearch("");
            }}
            className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs cursor-pointer shadow-sm"
          >
            Show All Shelters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((sh) => (
            <div
              key={sh.id}
              className="p-5 rounded-[22px] border border-[#E7E2DA] bg-white/95 hover:border-[#7C3AED]/40 shadow-sm space-y-3.5 backdrop-blur-xl transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
                    <Home className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-[#1C1929] leading-snug">{sh.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border ${
                          sh.status === "open"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-rose-50 text-rose-700 border-rose-300"
                        }`}
                      >
                        {sh.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#5D5775] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{sh.address}</span>
                    </p>
                  </div>
                </div>

                {/* Distance Badge */}
                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-bold text-[#7C3AED] bg-[#F3E8FF] px-2.5 py-1 rounded-full border border-[#DDD6FE] block whitespace-nowrap">
                    📍 {sh.calculatedDistanceKm} km
                  </span>
                  <span className="text-[10px] text-[#767092] mt-0.5 block flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3 text-[#767092]" /> ~{sh.estimatedWalkMinutes} min walk
                  </span>
                </div>
              </div>

              {/* Occupancy Bar */}
              <CapacityBar
                current={sh.currentOccupancy ?? sh.current_occupancy ?? 0}
                total={sh.capacity}
                label="Capacity Status"
                unit="persons"
              />

              {/* Facilities Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(sh.facilities || []).map((f) => (
                  <span
                    key={f}
                    className="px-2.5 py-0.5 rounded-lg text-[10px] bg-[#FAF8F5] border border-[#E7E2DA] text-[#5D5775]"
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E7E2DA] text-xs">
                <a
                  href={`tel:${sh.contactPhone || sh.contact_phone || "1077"}`}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#1C1929] border border-[#E7E2DA] flex items-center gap-1.5 font-medium transition-all cursor-pointer shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{sh.contactPhone || sh.contact_phone || "1077 (Helpline)"}</span>
                </a>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${sh.calculatedLat},${sh.calculatedLng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold flex items-center gap-1.5 shadow-sm text-xs transition-all cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate GPS</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
