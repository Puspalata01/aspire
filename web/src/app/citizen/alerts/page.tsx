"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useDisasterStore } from "@/stores/useDisasterStore";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { formatDateTime } from "@/lib/utils";
import {
  Bell,
  Radio,
  ExternalLink,
  ShieldAlert,
  MapPin,
  LocateFixed,
  Compass,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Waves,
  Wind,
  BellRing,
} from "lucide-react";
import {
  useCitizenLocationStore,
  CITIZEN_SECTORS,
  calculateDistanceKm,
} from "@/stores/useCitizenLocationStore";
import { extractLatLng } from "@/components/map/RealEarthMap";
import { toast } from "sonner";

export default function CitizenAlertsPage() {
  const { alerts, disaster } = useDisasterStore();
  const [soundEnabled, setSoundEnabled] = useState(false);

  const {
    lat: citizenLat,
    lng: citizenLng,
    locationName,
    sectorId,
    isGPS,
    isLocating,
    notificationsEnabled,
    setSector,
    setNotificationsEnabled,
    detectGPS,
  } = useCitizenLocationStore();

  // Distance from citizen to active hazard
  const hazardCoords = useMemo(() => {
    return extractLatLng(disaster) || { lat: 19.82, lng: 86.1 };
  }, [disaster]);

  const distanceToHazardKm = useMemo(() => {
    return calculateDistanceKm(
      citizenLat,
      citizenLng,
      hazardCoords.lat,
      hazardCoords.lng
    );
  }, [citizenLat, citizenLng, hazardCoords]);

  // Request browser notification permission
  const handleToggleNotifications = async () => {
    if (typeof window === "undefined") return;

    if (!notificationsEnabled) {
      if ("Notification" in window) {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          setNotificationsEnabled(true);
          new Notification("ASPIRE Emergency Lifeline", {
            body: `Geo-targeted alerts active for ${locationName}. You will receive critical sirens.`,
            icon: "/favicon.ico",
          });
          toast.success(`Push alerts armed for ${locationName}!`);
        } else {
          toast.warning("Browser notifications blocked. Alerts will still display in-app.");
          setNotificationsEnabled(true);
        }
      } else {
        setNotificationsEnabled(true);
        toast.info("Push alerts enabled for this device.");
      }
    } else {
      setNotificationsEnabled(false);
      toast.info("Geo-targeted alerts disabled.");
    }
  };

  // Test emergency alert siren sound
  const playTestSiren = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
      toast.info("Emergency acoustic frequency test played.");
    } catch {
      toast.info("Audio simulator not available on this browser.");
    }
  };

  // Generate dynamic location-specific tactical advisories
  const localizedGeoAlerts = useMemo(() => {
    const list = [];

    if (distanceToHazardKm <= 35) {
      list.push({
        id: "geo-crit-1",
        title: `MANDATORY EVACUATION: ${locationName.toUpperCase()}`,
        severity: "critical" as const,
        hazardType: "cyclone",
        source: "State Emergency Operations Center (SEOC)",
        issuedAt: new Date(Date.now() - 15 * 60000).toISOString(),
        message: `Your sector is ${distanceToHazardKm} km from landfall trajectory. Expected wind gusts 145 km/h with 2.2m storm surges. Immediate evacuation to nearest concrete shelter mandated before 18:00 hrs.`,
        isSectorTargeted: true,
      });
      list.push({
        id: "geo-crit-2",
        title: `COASTAL SURGE & POWER GRID DE-ENERGIZATION`,
        severity: "high" as const,
        hazardType: "flood",
        source: "TPCODL & District Administration",
        issuedAt: new Date(Date.now() - 45 * 60000).toISOString(),
        message: `High-voltage feeders serving ${locationName} are scheduled for precautionary trip at 16:30 hrs to prevent electrocution hazards. Secure water reserves immediately.`,
        isSectorTargeted: true,
      });
    } else if (distanceToHazardKm <= 75) {
      list.push({
        id: "geo-high-1",
        title: `HIGH WIND & FLASH FLOOD WATCH: ${locationName.toUpperCase()}`,
        severity: "high" as const,
        hazardType: "cyclone",
        source: "IMD Cyclone Warning Centre",
        issuedAt: new Date(Date.now() - 30 * 60000).toISOString(),
        message: `Distance to cyclone core is ${distanceToHazardKm} km. Gale winds 85-95 km/h forecast. Residents in thatched and non-engineered structures must relocate to designated block shelters.`,
        isSectorTargeted: true,
      });
    } else {
      list.push({
        id: "geo-mod-1",
        title: `PRECAUTIONARY WEATHER ADVISORY: ${locationName.toUpperCase()}`,
        severity: "medium" as const,
        hazardType: "cyclone",
        source: "Regional Meteorological Centre",
        issuedAt: new Date(Date.now() - 60 * 60000).toISOString(),
        message: `Hazard core is ${distanceToHazardKm} km away. Heavy localized showers expected. Avoid unnecessary travel on national highways and water channels.`,
        isSectorTargeted: true,
      });
    }

    return list;
  }, [distanceToHazardKm, locationName]);

  return (
    <div className="space-y-6 pb-28 text-[#1C1929] font-sans select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & CONTROLS
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1929] tracking-tight">
              Emergency Warnings & Geo-Alerts
            </h1>
          </div>
          <p className="text-xs text-[#5D5775] mt-1 max-w-xl">
            Live satellite broadcasts from IMD, Central Water Commission, and State Disaster Management Authority tailored to your coordinates.
          </p>
        </div>

        {/* Siren Test & Push Arm Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={playTestSiren}
            className="px-3 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E7E2DA] text-xs font-semibold text-[#1C1929] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Test alert tone"
          >
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span>Test Siren</span>
          </button>

          <button
            type="button"
            onClick={handleToggleNotifications}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-sm ${
              notificationsEnabled
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-[#7C3AED] text-white border-[#7C3AED] hover:bg-[#6D28D9]"
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>{notificationsEnabled ? "✓ Push Armed" : "Arm Push Alerts"}</span>
          </button>
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
              <span className="text-xs font-bold text-[#1C1929]">RECEIVING BULLETINS FOR:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE]">
                {isGPS ? "REAL-TIME GPS" : "DESIGNATED SECTOR"}
              </span>
            </div>
            <p className="font-mono text-[11px] text-[#5D5775]">
              {locationName} ({citizenLat.toFixed(4)}°N, {citizenLng.toFixed(4)}°E) • Landfall Core: {distanceToHazardKm} km
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
          3. GEO-TARGETED LOCAL SECTOR WARNINGS (PRIORITY)
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1929]">
            Geo-Targeted Bulletins for Your Specific Coordinates
          </h3>
        </div>

        {localizedGeoAlerts.map((geo) => (
          <div
            key={geo.id}
            className={`p-6 rounded-[24px] border backdrop-blur-2xl shadow-sm space-y-3 transition-all ${
              geo.severity === "critical"
                ? "bg-rose-50/70 border-rose-300"
                : "bg-amber-50/70 border-amber-300"
            }`}
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <SeverityBadge severity={geo.severity} />
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE]">
                  📍 GEO-LOCATED ({distanceToHazardKm} KM)
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#767092]">
                {formatDateTime(geo.issuedAt)}
              </span>
            </div>

            <h3 className="text-base font-extrabold text-[#1C1929] leading-snug">{geo.title}</h3>
            <p className="text-xs text-[#5D5775] leading-relaxed">{geo.message}</p>

            <div className="pt-2 border-t border-black/5 text-[11px] text-[#767092] flex items-center justify-between">
              <span>Authority: {geo.source}</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> High-Priority Flash Broadcast
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. STATE-WIDE & NATIONAL BULLETINS
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#7C3AED]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#5D5775]">
            State & National Verified Broadcast Feed
          </h3>
        </div>

        <div className="space-y-4">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              className="p-5 rounded-[22px] border border-[#E7E2DA] bg-white/95 shadow-sm space-y-3 backdrop-blur-xl"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={alt.severity} />
                  <span className="text-[11px] font-mono text-[#767092] uppercase">
                    {(alt.hazardType || alt.type || "ALERT").toUpperCase()}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#767092]">
                  {formatDateTime(alt.issuedAt || alt.created_at || new Date().toISOString())}
                </span>
              </div>

              <h4 className="text-sm font-bold text-[#1C1929]">{alt.title}</h4>
              <p className="text-xs text-[#5D5775] leading-relaxed">{alt.message}</p>

              <div className="pt-2 border-t border-[#E7E2DA] text-[11px] text-[#767092] flex items-center justify-between">
                <span>Origin: {alt.source || "SDMA Odisha / ASPIRE Intelligence"}</span>
                <span className="text-emerald-700 font-semibold">● Verified Broadcast</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
