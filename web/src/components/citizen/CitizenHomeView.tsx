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

  // Global Citizen Location Store (synchronized across all citizen views)
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
      <div className="p-4 rounded-[22px] bg-[#101624]/90 border border-white/10 backdrop-blur-2xl shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3B6CFF]/20 text-[#4FB3FF] border border-[#3B6CFF]/40 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: "25s" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">YOUR ACTIVE SECTOR:</span>
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
          2. DYNAMIC LOCATION-BASED DANGER ALERT HERO BANNER
         ───────────────────────────────────────────────────────────── */}
      <div
        className={`rounded-[24px] border p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-2xl transition-all ${
          dangerLevel === 4
            ? "border-[#FF4D5E]/40 bg-gradient-to-br from-[#1A0B12] via-[#101424] to-[#0A0F1D]"
            : dangerLevel === 3
            ? "border-[#FF8A3D]/40 bg-gradient-to-br from-[#1C120C] via-[#101624] to-[#0A0F1D]"
            : "border-[#3B6CFF]/30 bg-gradient-to-br from-[#0E1524] via-[#0A0F1D] to-[#05070D]"
        }`}
      >
        <div
          className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
            dangerLevel === 4 ? "bg-[#FF4D5E]/15" : "bg-[#FF8A3D]/15"
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FB] tracking-tight">
              {dangerLevel === 4
                ? "Immediate Shoreline Evacuation Mandated"
                : "Active Hazard Trajectory Monitored"}
            </h1>
            <p className="text-xs sm:text-sm text-[#8E99AF] max-w-xl leading-relaxed">
              {dangerLevel === 4
                ? `You are within ${distanceToHazardKm} km of Cyclone Dana's primary landfall cone. High storm surge (1.8m-2.4m) and gale winds of 145 km/h expected in ${locationName}. Move to nearest designated cyclone hub immediately.`
                : dangerLevel === 3
                ? `Hazard center is ${distanceToHazardKm} km from your position. Heavy rainfall and 90 km/h wind gusts forecast. Keep emergency rations and avoid coastal or canal roads.`
                : `Hazard center is ${distanceToHazardKm} km away. Your sector is currently stable under precautionary advisory.`}
            </p>

            <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-[#4FB3FF]">
              <span>LANDFALL DISTANCE: {distanceToHazardKm} KM</span>
              <span>•</span>
              <span className="text-[#2FD07F]">NEAREST SHELTER: {localizedShelters[0]?.calculatedDistanceKm ?? 1.2} KM</span>
            </div>
          </div>

          {/* Action Dual Buttons: 1-Tap SOS + Report Hazard */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Giant 1-Tap SOS Button */}
            <button
              onClick={() => setIsSOSOpen(true)}
              className="flex items-center justify-center gap-3 bg-[#FF4D5E] hover:bg-[#E03A4B] text-white font-extrabold px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(255,77,94,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            >
              <LifeBuoy className="w-7 h-7 animate-spin text-white" style={{ animationDuration: "10s" }} />
              <div className="text-left">
                <span className="block text-lg font-black tracking-wider uppercase leading-none">
                  PRESS SOS
                </span>
                <span className="text-[10px] text-white/80 font-normal leading-tight mt-0.5 block">
                  Rescue Uplink
                </span>
              </div>
            </button>

            {/* Geotagged Photo Hazard Report Button */}
            <button
              onClick={() => setIsReportOpen(true)}
              className="flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold px-5 py-4 rounded-2xl shadow-lg transition-all cursor-pointer"
            >
              <Camera className="w-5 h-5 text-[#4FB3FF]" />
              <div className="text-left">
                <span className="block text-xs font-bold leading-tight">
                  Report Hazard
                </span>
                <span className="text-[10px] text-[#8E99AF] leading-none mt-0.5 block">
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
          className="p-4 rounded-[18px] border border-white/10 bg-[#101624]/80 hover:bg-[#161D2E] hover:border-[#2FD07F]/40 shadow-lg transition-all text-center space-y-2 group cursor-pointer"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-[#2FD07F]/15 text-[#2FD07F] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Home className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#F5F7FB]">Find Shelter</h4>
          <p className="text-[10px] text-[#8E99AF]">Closest within your area</p>
        </Link>

        <Link
          href="/citizen/safe-routes"
          className="p-4 rounded-[18px] border border-white/10 bg-[#101624]/80 hover:bg-[#161D2E] hover:border-[#3B6CFF]/40 shadow-lg transition-all text-center space-y-2 group cursor-pointer"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-[#3B6CFF]/15 text-[#4FB3FF] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Navigation className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#F5F7FB]">Safe Route</h4>
          <p className="text-[10px] text-[#8E99AF]">Unflooded high-ground</p>
        </Link>

        <Link
          href="/citizen/alerts"
          className="p-4 rounded-[18px] border border-white/10 bg-[#101624]/80 hover:bg-[#161D2E] hover:border-[#F5C542]/40 shadow-lg transition-all text-center space-y-2 group cursor-pointer"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-[#F5C542]/15 text-[#F5C542] flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#F5F7FB]">Live Warnings</h4>
          <p className="text-[10px] text-[#8E99AF]">Official IMD alerts</p>
        </Link>

        <Link
          href="/citizen/reports"
          className="p-4 rounded-[18px] border border-white/10 bg-[#101624]/80 hover:bg-[#161D2E] hover:border-[#4FB3FF]/40 shadow-lg transition-all text-center space-y-2 group cursor-pointer"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-[#3B6CFF]/15 text-[#4FB3FF] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#F5F7FB]">Submit Report</h4>
          <p className="text-[10px] text-[#8E99AF]">Upload photos of damage</p>
        </Link>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. LOCALIZED SHELTERS NEAR CITIZEN'S AREA ONLY
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-[24px] border border-white/10 bg-[#0E1524]/90 p-6 backdrop-blur-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-[#2FD07F]" />
            <div>
              <h3 className="text-sm font-bold text-[#F5F7FB]">
                Designated Shelters Near Your Area
              </h3>
              <p className="text-[10px] text-[#8E99AF]">
                Filtered for <span className="text-white font-semibold">{locationName}</span> • Sorted by closest distance
              </p>
            </div>
          </div>
          <Link
            href="/citizen/shelters"
            className="text-xs text-[#4FB3FF] hover:underline flex items-center gap-1 font-semibold"
          >
            All Shelters ({shelters.length}) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {localizedShelters.slice(0, 4).map((sh) => (
            <div
              key={sh.id}
              className="p-4 rounded-2xl border border-white/5 bg-[#080D19]/90 hover:border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#F5F7FB] truncate">{sh.name}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border ${
                      sh.status === "open"
                        ? "bg-[#2FD07F]/20 text-[#2FD07F] border-[#2FD07F]/40"
                        : "bg-[#FF4D5E]/20 text-[#FF4D5E] border-[#FF4D5E]/40"
                    }`}
                  >
                    {sh.status}
                  </span>
                </div>

                <p className="text-[11px] text-[#8E99AF] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF4D5E] shrink-0" />
                  <span className="truncate">{sh.address}</span>
                </p>

                {/* Distance & Walk time pill */}
                <div className="flex items-center gap-2 text-[10px] pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-[#3B6CFF]/20 text-[#4FB3FF] font-bold font-mono border border-[#3B6CFF]/30">
                    📍 {sh.calculatedDistanceKm} km away
                  </span>
                  <span className="text-[#8E99AF]">
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
                  className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F7FB] text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer"
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
      <div className="rounded-[24px] border border-white/10 bg-[#0E1524]/80 p-5 backdrop-blur-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#3B6CFF]/20 text-[#4FB3FF] border border-[#3B6CFF]/30">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-[#F5F7FB]">State & District Emergency Helplines</h4>
            <p className="text-[11px] text-[#8E99AF]">24x7 Toll-free disaster response center</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href="tel:112"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F7FB] font-mono font-bold border border-white/10 shadow-sm transition-all"
          >
            National: 112
          </a>
          <a
            href="tel:1070"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F7FB] font-mono font-bold border border-white/10 shadow-sm transition-all"
          >
            State OSDMA: 1070
          </a>
          <a
            href="tel:1077"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F7FB] font-mono font-bold border border-white/10 shadow-sm transition-all"
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
