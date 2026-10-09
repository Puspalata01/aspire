"use client";

import React, { useEffect, useState, useMemo } from "react";
import { CitizenSOSModal } from "./CitizenSOSModal";
import { CitizenReportModal } from "./CitizenReportModal";
import { api } from "@/lib/api";
import { Shelter, Disaster } from "@/types";
import { DangerLevelIndicator } from "@/components/shared/DangerLevelIndicator";
import { CapacityBar } from "@/components/shared/CapacityBar";
import {
  LifeBuoy,
  Shield,
  Navigation,
  PhoneCall,
  BookOpen,
  MapPin,
  Clock,
  AlertTriangle,
  ChevronRight,
  Home,
  CheckCircle,
  Wind,
  Waves,
  Camera,
  LocateFixed,
  Compass,
  BellRing,
  Radio,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { extractLatLng } from "@/components/map/RealEarthMap";
import { useCitizenLocationStore, CITIZEN_SECTORS, calculateDistanceKm } from "@/stores/useCitizenLocationStore";

export function CitizenHomeView() {
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [activeDisaster, setActiveDisaster] = useState<Disaster | null>(null);

  // Global Citizen Location Store
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
    let isMounted = true;
    Promise.all([api.getShelters(), api.getActiveDisaster()]).then(([sh, d]) => {
      if (!isMounted) return;
      if (sh && sh.length > 0) setShelters(sh);
      if (d) setActiveDisaster(d);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Distance from citizen to cyclone eye
  const cycloneCoords = useMemo(() => {
    return extractLatLng(activeDisaster) || { lat: 19.82, lng: 86.1 };
  }, [activeDisaster]);

  const distanceToHazardKm = useMemo(() => {
    return calculateDistanceKm(
      citizenLat,
      citizenLng,
      cycloneCoords.lat,
      cycloneCoords.lng
    );
  }, [citizenLat, citizenLng, cycloneCoords]);

  // Determine Danger Level based on distance to hazard
  const dangerLevel = useMemo(() => {
    if (distanceToHazardKm <= 30) return 4; // Red Alert
    if (distanceToHazardKm <= 65) return 3; // Orange Alert
    if (distanceToHazardKm <= 120) return 2; // Yellow
    return 1;
  }, [distanceToHazardKm]);

  // Compute Shelters Sorted by Proximity
  const localizedShelters = useMemo(() => {
    return shelters
      .map((sh) => {
        const pos = extractLatLng(sh) || { lat: 19.8, lng: 85.83 };
        const dist = calculateDistanceKm(citizenLat, citizenLng, pos.lat, pos.lng);
        return {
          ...sh,
          calculatedDistanceKm: dist,
          walkTimeMinutes: Math.round(dist * 13), // ~4.6 km/h walking speed
        };
      })
      .sort((a, b) => a.calculatedDistanceKm - b.calculatedDistanceKm);
  }, [shelters, citizenLat, citizenLng]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28 select-none font-sans">
      {/* ─────────────────────────────────────────────────────────────
          1. CITIZEN AREA & GPS ACQUISITION CONTROL BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-[22px] bg-white/95 border border-[#E7E2DA] backdrop-blur-2xl shadow-[0_8px_24px_rgba(124,58,237,0.04)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7C3AED] border border-purple-200 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: "25s" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1C1929]">YOUR ACTIVE SECTOR:</span>
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
            className="bg-[#F8F7F4] border border-[#E7E2DA] rounded-xl px-3 py-1.5 text-xs text-[#1C1929] focus:outline-none focus:border-[#7C3AED] cursor-pointer"
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
            className="px-3 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_4px_14px_rgba(124,58,237,0.3)] transition-all cursor-pointer disabled:opacity-50"
            title="Auto-detect current GPS coordinates"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>{isLocating ? "Acquiring..." : "Detect GPS"}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DYNAMIC LOCATION-BASED DANGER ALERT HERO BANNER
         ───────────────────────────────────────────────────────────── */}
      <div
        className={`rounded-[24px] border p-6 sm:p-8 shadow-[0_12px_40px_rgba(124,58,237,0.06)] relative overflow-hidden backdrop-blur-2xl transition-all ${
          dangerLevel === 4
            ? "border-red-200 bg-gradient-to-br from-red-50/70 via-white to-purple-50/40"
            : dangerLevel === 3
            ? "border-orange-200 bg-gradient-to-br from-orange-50/70 via-white to-purple-50/40"
            : "border-[#E7E2DA] bg-gradient-to-br from-white via-[#FBF9F5] to-purple-50/30"
        }`}
      >
        <div
          className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
            dangerLevel === 4 ? "bg-red-400/10" : "bg-orange-400/10"
          }`}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <DangerLevelIndicator
              level={dangerLevel}
              label={
                dangerLevel === 4
                  ? "FLASH RED ALERT: MANDATORY EVACUATION ZONE"
                  : dangerLevel === 3
                  ? "HIGH ORANGE WATCH: SEVERE STORM SURGE ALERT"
                  : "MODERATE ADVISORY: PRECAUTIONARY MONITORING"
              }
            />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1929] tracking-tight">
              {dangerLevel === 4
                ? "Immediate Shoreline Evacuation Mandated"
                : "Active Hazard Trajectory Monitored"}
            </h1>
            <p className="text-xs sm:text-sm text-[#5D5775] max-w-xl leading-relaxed">
              {dangerLevel === 4
                ? `You are within ${distanceToHazardKm} km of Cyclone Dana's primary landfall cone. High storm surge (1.8m-2.4m) and gale winds of 145 km/h expected in ${locationName}. Move to nearest designated cyclone hub immediately.`
                : dangerLevel === 3
                ? `Hazard center is ${distanceToHazardKm} km from your position. Heavy rainfall and 90 km/h wind gusts forecast. Keep emergency rations and avoid coastal or canal roads.`
                : `Hazard center is ${distanceToHazardKm} km away. Your sector is currently stable under precautionary advisory.`}
            </p>

            <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-[#7C3AED] font-bold">
              <span>LANDFALL DISTANCE: {distanceToHazardKm} KM</span>
              <span>•</span>
              <span className="text-[#059669]">NEAREST SHELTER: {localizedShelters[0]?.calculatedDistanceKm ?? 1.2} KM</span>
            </div>
          </div>

          {/* Action Dual Buttons: 1-Tap SOS + Report Hazard */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Giant 1-Tap SOS Button */}
            <button
              onClick={() => setIsSOSOpen(true)}
              className="flex items-center justify-center gap-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-extrabold px-6 py-4 rounded-2xl shadow-[0_4px_24px_rgba(220,38,38,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            >
              <LifeBuoy className="w-7 h-7 animate-spin text-white" style={{ animationDuration: "10s" }} />
              <div className="text-left">
                <span className="block text-lg font-black tracking-wider uppercase leading-none">
                  PRESS SOS
                </span>
                <span className="text-[10px] text-white/90 font-normal leading-tight mt-0.5 block">
                  Rescue Uplink
                </span>
              </div>
            </button>

            {/* Geotagged Photo Hazard Report Button */}
            <button
              onClick={() => setIsReportOpen(true)}
              className="flex items-center justify-center gap-2.5 bg-white hover:bg-[#F3E8FF] border border-[#E7E2DA] hover:border-[#7C3AED]/40 text-[#1C1929] hover:text-[#7C3AED] font-bold px-5 py-4 rounded-2xl shadow-xs transition-all cursor-pointer"
            >
              <Camera className="w-5 h-5 text-[#7C3AED]" />
              <div className="text-left">
                <span className="block text-xs font-bold leading-tight">
                  Report Hazard
                </span>
                <span className="text-[10px] text-[#5D5775] leading-none mt-0.5 block">
                  With Photo & GPS
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. QUICK CITIZEN LIFELINE NAVIGATION CARDS
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/citizen/shelters"
          className="p-4 rounded-[18px] border border-[#E7E2DA] bg-white/95 hover:bg-[#FBF9F5] hover:border-[#059669]/40 shadow-[0_8px_20px_rgba(124,58,237,0.04)] transition-all text-center space-y-2 group cursor-pointer"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Home className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#1C1929]">Find Shelter</h4>
          <p className="text-[10px] text-[#5D5775]">Closest within your area</p>
        </Link>

        <Link
          href="/citizen/safe-routes"
          className="p-4 rounded-[18px] border border-[#E7E2DA] bg-white/95 hover:bg-[#FBF9F5] hover:border-[#7C3AED]/40 shadow-[0_8px_20px_rgba(124,58,237,0.04)] transition-all text-center space-y-2 group cursor-pointer"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Navigation className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#1C1929]">Safe Route</h4>
          <p className="text-[10px] text-[#5D5775]">Unflooded high-ground</p>
        </Link>

        <Link
          href="/citizen/alerts"
          className="p-4 rounded-[18px] border border-[#E7E2DA] bg-white/95 hover:bg-[#FBF9F5] hover:border-amber-300 shadow-[0_8px_20px_rgba(124,58,237,0.04)] transition-all text-center space-y-2 group cursor-pointer"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#1C1929]">Live Warnings</h4>
          <p className="text-[10px] text-[#5D5775]">Official IMD alerts</p>
        </Link>

        <Link
          href="/citizen/reports"
          className="p-4 rounded-[18px] border border-[#E7E2DA] bg-white/95 hover:bg-[#FBF9F5] hover:border-purple-300 shadow-[0_8px_20px_rgba(124,58,237,0.04)] transition-all text-center space-y-2 group cursor-pointer"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#1C1929]">Submit Report</h4>
          <p className="text-[10px] text-[#5D5775]">Upload photos of damage</p>
        </Link>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. LOCALIZED SHELTERS NEAR CITIZEN'S AREA ONLY
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-[24px] border border-[#E7E2DA] bg-white/95 p-6 backdrop-blur-2xl shadow-[0_10px_30px_rgba(124,58,237,0.05)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA]">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-[#059669]" />
            <div>
              <h3 className="text-sm font-bold text-[#1C1929]">
                Designated Shelters Near Your Area
              </h3>
              <p className="text-[10px] text-[#5D5775]">
                Filtered for <span className="text-[#1C1929] font-bold">{locationName}</span> • Sorted by closest distance
              </p>
            </div>
          </div>
          <Link
            href="/citizen/shelters"
            className="text-xs text-[#7C3AED] hover:underline flex items-center gap-1 font-bold"
          >
            All Shelters ({shelters.length}) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {localizedShelters.slice(0, 4).map((sh) => (
            <div
              key={sh.id}
              className="p-4 rounded-2xl border border-[#E7E2DA] bg-[#F8F7F4] hover:bg-white hover:border-[#7C3AED]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#1C1929] truncate">{sh.name}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border ${
                      sh.status === "open"
                        ? "bg-emerald-50 text-[#059669] border-emerald-200"
                        : "bg-red-50 text-[#DC2626] border-red-200"
                    }`}
                  >
                    {sh.status}
                  </span>
                </div>

                <p className="text-[11px] text-[#5D5775] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                  <span className="truncate">{sh.address}</span>
                </p>

                {/* Distance & Walk time pill */}
                <div className="flex items-center gap-2 text-[10px] pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-[#F3E8FF] text-[#7C3AED] font-bold font-mono border border-[#DDD6FE]">
                    📍 {sh.calculatedDistanceKm} km away
                  </span>
                  <span className="text-[#5D5775]">
                    (~{sh.walkTimeMinutes} min walk)
                  </span>
                </div>
              </div>

              {/* Occupancy and Call */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                <div className="w-full sm:w-44">
                  <CapacityBar
                    current={sh.currentOccupancy ?? sh.current_occupancy ?? 0}
                    total={sh.capacity}
                    label="Current Occupancy"
                    unit="ppl"
                  />
                </div>
                <a
                  href={`tel:${sh.contactPhone || sh.contact_phone || "1077"}`}
                  className="px-4 py-1.5 rounded-xl bg-white hover:bg-[#F3E8FF] text-[#1C1929] hover:text-[#7C3AED] text-xs font-semibold flex items-center gap-1.5 border border-[#E7E2DA] transition-all cursor-pointer shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call Shelter
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. 24x7 GOVERNMENT CRISIS HELPLINES
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-[24px] border border-[#E7E2DA] bg-white/95 p-5 backdrop-blur-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-[#7C3AED] border border-purple-200">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-[#1C1929]">State & District Emergency Helplines</h4>
            <p className="text-[11px] text-[#5D5775]">24x7 Toll-free disaster response center</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href="tel:112"
            className="px-4 py-2 rounded-xl bg-[#F8F7F4] hover:bg-[#F3E8FF] text-[#1C1929] hover:text-[#7C3AED] font-mono font-bold border border-[#E7E2DA] shadow-xs transition-all"
          >
            National: 112
          </a>
          <a
            href="tel:1070"
            className="px-4 py-2 rounded-xl bg-[#F8F7F4] hover:bg-[#F3E8FF] text-[#1C1929] hover:text-[#7C3AED] font-mono font-bold border border-[#E7E2DA] shadow-xs transition-all"
          >
            State OSDMA: 1070
          </a>
          <a
            href="tel:1077"
            className="px-4 py-2 rounded-xl bg-[#F8F7F4] hover:bg-[#F3E8FF] text-[#1C1929] hover:text-[#7C3AED] font-mono font-bold border border-[#E7E2DA] shadow-xs transition-all"
          >
            District: 1077
          </a>
        </div>
      </div>

      {/* Modals */}
      <CitizenSOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
      <CitizenReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        coordinates={{ lat: citizenLat, lng: citizenLng }}
        locationName={locationName}
      />
    </div>
  );
}
