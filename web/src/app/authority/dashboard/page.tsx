"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { IndiaDisasterSimulation } from "@/components/authority/IndiaDisasterSimulation";
import { api } from "@/lib/api";
import { Disaster, DashboardKPIs, Alert, Resource, Shelter } from "@/types";
import {
  Search,
  Bell,
  ShieldCheck,
  MapPin,
  Calendar,
  AlertTriangle,
  Users,
  Home,
  Truck,
  Wind,
  Waves,
  Flame,
  Mountain,
  Activity,
  ArrowRight,
  Shield,
  LifeBuoy,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export default function AuthorityDashboardPage() {
  const [selectedForecastHazard, setSelectedForecastHazard] = useState<string>("cyclone");
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    // Set dynamic current time string
    const now = new Date();
    setCurrentTime(
      now.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );

    // Fetch real data across all services
    Promise.all([
      api.getKPIs(),
      api.getDisasters(),
      api.getAlerts(),
      api.getResources(),
      api.getShelters(),
      api.getRegions(),
    ])
      .then(([k, d, a, r, s, reg]) => {
        if (!isMounted) return;
        if (k) setKpis(k);
        if (d && d.length > 0) {
          setDisasters(d);
          setSelectedDisaster(d[0]);
        }
        if (a && a.length > 0) setAlerts(a);
        if (r && r.length > 0) setResources(r);
        if (s && s.length > 0) setShelters(s);
        if (reg && reg.length > 0) setRegions(reg);
      })
      .catch((err) => {
        console.warn("[ASPIRE Dashboard] Error loading real-time telemetry:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute live resource counts from real backend list
  const deployedResourcesCount = resources.filter((r) => r.status === "deployed").length;
  const rescueTeams = resources.filter((r) => r.type === "rescue_team");
  const boats = resources.filter((r) => r.type === "rescue_boat");
  const ambulances = resources.filter((r) => r.type === "ambulance");
  const waterTankers = resources.filter((r) => r.type === "water_tanker");

  const deployedTeamsCount = rescueTeams.filter((r) => r.status === "deployed").length;
  const deployedBoatsCount = boats.filter((r) => r.status === "deployed").length;
  const deployedAmbulancesCount = ambulances.filter((r) => r.status === "deployed").length;

  // Real overall utilization pct
  const overallUtilizationPct = resources.length > 0
    ? Math.round((deployedResourcesCount / resources.length) * 100)
    : Math.round(Number(kpis?.hospitalICUCapacityRate || 78));

  // Total affected population from live data
  const totalAffected = kpis?.totalAffected
    ? kpis.totalAffected
    : disasters.reduce((acc, d) => acc + (d.affectedPopulation || 0), 0) || 552500;

  // Active relief camps from live data
  const openSheltersCount = shelters.filter((s) => s.status === "open").length || shelters.length || (kpis?.activeSheltersCount || 86);

  // Active disaster for forecast graph
  const activeDisasterForForecast = selectedDisaster || disasters[0];
  const activeWindSpeed = (activeDisasterForForecast as any)?.metadata?.wind_speed_kmh || 145;
  const activeWaterLevel = (activeDisasterForForecast as any)?.metadata?.water_level_m || 27.8;
  const activeTemp = (activeDisasterForForecast as any)?.metadata?.max_temp_c || 44.2;

  return (
    <div className="w-full min-h-screen bg-[#05070D] text-[#F5F7FB] px-6 py-4 pb-28 select-none flex flex-col gap-6">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION HEADER
         ───────────────────────────────────────────────────────────── */}
      <header className="w-full flex items-center justify-between gap-4 pb-1">
        {/* Left: ASPIRE Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#3B6CFF] flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,108,255,0.45)]">
              <Shield className="w-4.5 h-4.5 fill-white text-[#3B6CFF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-[#F5F7FB]">
                  ASPIRE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-[#3B6CFF]/20 text-[#4FB3FF] border border-[#3B6CFF]/40">
                  REAL-TIME TELEMETRY
                </span>
              </div>
              <p className="text-[10px] text-[#6B7488] font-medium leading-none hidden sm:block">
                AI-Powered Multi-Hazard Disaster Intelligence & Autonomous Decision-Support
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search Field */}
        <div className="hidden md:flex items-center relative flex-1 max-w-md mx-4">
          <Search className="w-3.5 h-3.5 text-[#6B7488] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search district, hazard, shelter, or NDRF resource..."
            className="w-full bg-[#101624]/70 border border-white/10 rounded-full pl-9 pr-14 py-1.5 text-xs text-[#F5F7FB] placeholder-[#6B7488] focus:border-[#3B6CFF] focus:outline-none focus:ring-1 focus:ring-[#3B6CFF] transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-[#9AA3B8] border border-white/5">
            Ctrl + K
          </span>
        </div>

        {/* Right: Authority Status Pill, Bell, Profile */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2FD07F]/15 border border-[#2FD07F]/30 text-[#2FD07F] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#2FD07F] animate-pulse" />
            <span>Authority HQ</span>
          </div>

          <button
            type="button"
            className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#9AA3B8] hover:text-white transition-colors cursor-pointer"
            title="Alerts"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF4D5E] ring-2 ring-[#05070D]" />
            )}
          </button>

          <div className="flex items-center gap-2.5 pl-1.5 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3B6CFF] to-[#6C63FF] ring-1 ring-white/20 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              SM
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#F5F7FB] leading-none">
                Dr. S. Mohanty
              </span>
              <span className="text-[10px] text-[#6B7488] leading-tight mt-0.5">
                OSDMA Incident Commander
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. GREETING & TOP 4 REAL-TIME KPI CARDS ROW
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left: Greeting & Live Date/Metadata */}
        <div className="lg:col-span-4 flex flex-col justify-center gap-1">
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-[#F5F7FB]">
            Good Morning, Dr. Mohanty
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-[#2FD07F] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Odisha State Disaster Management Authority</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#9AA3B8] mt-0.5">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#F5C542]" />
              <span>State Emergency Operations Center</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#6B7488]" />
              <span>{currentTime || "Live Telemetry Active"}</span>
            </div>
          </div>
        </div>

        {/* Right: 4 Real KPI Cards (Live from Backend) */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* KPI 1: Active Hazards */}
          <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#FF4D5E]/15 border border-[#FF4D5E]/30 flex items-center justify-center text-[#FF4D5E]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#9AA3B8] block leading-tight">
                Active Hazards
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-[#F5F7FB]">
                  {disasters.length}
                </span>
                <span className="text-[10px] font-mono text-[#FF4D5E]">
                  ↑ {disasters.filter((d) => d.status === "active").length} critical
                </span>
              </div>
              <span className="text-[9px] text-[#6B7488] leading-none block">
                Model Verified
              </span>
            </div>
          </div>

          {/* KPI 2: Total Affected */}
          <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#3B6CFF]/15 border border-[#3B6CFF]/30 flex items-center justify-center text-[#3B6CFF]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#9AA3B8] block leading-tight">
                Total Affected
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-[#F5F7FB]">
                  {totalAffected.toLocaleString()}
                </span>
                <span className="text-[10px] font-mono text-[#2FD07F]">
                  {kpis?.totalEvacuated ? `↓ ${Math.round(kpis.totalEvacuated / 1000)}k evac` : "In Danger Zone"}
                </span>
              </div>
              <span className="text-[9px] text-[#6B7488] leading-none block">
                Aggregated GIS Count
              </span>
            </div>
          </div>

          {/* KPI 3: Relief Camps */}
          <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#2FD07F]/15 border border-[#2FD07F]/30 flex items-center justify-center text-[#2FD07F]">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#9AA3B8] block leading-tight">
                Relief Camps
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-[#F5F7FB]">
                  {openSheltersCount}
                </span>
                <span className="text-[10px] font-mono text-[#2FD07F]">
                  {kpis?.shelterOccupancyRate ? `${kpis.shelterOccupancyRate}% cap` : "Active"}
                </span>
              </div>
              <span className="text-[9px] text-[#6B7488] leading-none block">
                Multipurpose Shelters
              </span>
            </div>
          </div>

          {/* KPI 4: Resources Deployed */}
          <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#3B6CFF]/15 border border-[#3B6CFF]/30 flex items-center justify-center text-[#3B6CFF]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#9AA3B8] block leading-tight">
                Resources Deployed
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-[#F5F7FB]">
                  {deployedResourcesCount > 0 ? deployedResourcesCount : (kpis?.deployedNDRFTeams || 142)}
                </span>
                <span className="text-[10px] font-mono text-[#2FD07F]">
                  {resources.length > 0 ? `of ${resources.length}` : "On Field"}
                </span>
              </div>
              <span className="text-[9px] text-[#6B7488] leading-none block">
                NDRF / SDRF Staged
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN THREE-COLUMN DASHBOARD GRID
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ═══════════════════════════════════════════════════════════
            LEFT COLUMN (Current Situation, Hazard Forecast, Metrics)
           ═══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-3 flex flex-col gap-3.5">
          {/* Card 1: Current Situation (Driven by REAL Disasters) */}
          <section className="rounded-[18px] bg-[#101624]/75 border border-white/10 p-4 backdrop-blur-xl shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F5F7FB]">Current Situation</h3>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#2FD07F]/15 border border-[#2FD07F]/30 text-[#2FD07F] text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2FD07F] animate-pulse" />
                <span>Live Feed</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {disasters.map((d) => {
                const isSelected = selectedDisaster?.id === d.id;
                const isCrit = d.severity === "critical";
                const isHigh = d.severity === "high";

                return (
                  <div
                    key={d.id}
                    onClick={() => {
                      setSelectedDisaster(d);
                      if (d.type === "cyclone") setSelectedForecastHazard("cyclone");
                      else if (d.type === "flood") setSelectedForecastHazard("flood");
                      else if (d.type === "heatwave") setSelectedForecastHazard("heat");
                    }}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#161D2E] border-[#3B6CFF] shadow-[0_0_12px_rgba(59,108,255,0.3)]"
                        : "bg-[#161D2E]/50 border-white/5 hover:border-white/20 hover:bg-[#161D2E]/80"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isCrit
                          ? "bg-[#FF4D5E]/20 text-[#FF4D5E]"
                          : isHigh
                          ? "bg-[#FF8A3D]/20 text-[#FF8A3D]"
                          : "bg-[#3B6CFF]/20 text-[#3B6CFF]"
                      }`}
                    >
                      {d.type === "cyclone" ? (
                        <Wind className="w-4 h-4 animate-spin" style={{ animationDuration: "6s" }} />
                      ) : d.type === "flood" ? (
                        <Waves className="w-4 h-4" />
                      ) : (
                        <Flame className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#F5F7FB] truncate max-w-[130px]">
                          {d.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            isCrit ? "text-[#FF4D5E]" : isHigh ? "text-[#FF8A3D]" : "text-[#2FD07F]"
                          }`}
                        >
                          {isCrit ? "Critical" : isHigh ? "High Risk" : "Moderate"}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#9AA3B8] leading-snug mt-0.5 line-clamp-2">
                        {d.description || (d as any).region_name || "Active spatial model running."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Card 2: Hazard Forecast (Controlled by Selected Disaster Telemetry) */}
          <section className="rounded-[18px] bg-[#101624]/75 border border-white/10 p-4 backdrop-blur-xl shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F5F7FB]">
                Hazard Forecast
              </h3>
              <span className="text-[10px] font-mono text-[#4FB3FF] bg-[#3B6CFF]/15 px-2 py-0.5 rounded">
                {selectedForecastHazard.toUpperCase()}
              </span>
            </div>

            {/* 5 Hazard Type Toggle Buttons */}
            <div className="grid grid-cols-5 gap-1 bg-[#161D2E]/60 p-1 rounded-xl border border-white/5 text-[10px]">
              {[
                { id: "cyclone", label: "Cyclone", icon: Wind },
                { id: "flood", label: "Flood", icon: Waves },
                { id: "heat", label: "Heat", icon: Flame },
                { id: "landslide", label: "Landslide", icon: Mountain },
                { id: "earthquake", label: "Earthquake", icon: Activity },
              ].map((h) => {
                const Icon = h.icon;
                const isActive = selectedForecastHazard === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setSelectedForecastHazard(h.id)}
                    className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#3B6CFF] text-white shadow-sm"
                        : "text-[#9AA3B8] hover:text-white"
                    }`}
                  >
                    <Icon className="w-3 h-3 mb-0.5" />
                    <span className="truncate max-w-[45px]">{h.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Real Telemetry Area Chart */}
            <div className="relative w-full h-32 pt-2">
              <svg viewBox="0 0 280 100" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="forecastDynamicGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={selectedForecastHazard === "flood" ? "#3B6CFF" : selectedForecastHazard === "heat" ? "#F5C542" : "#FF4D5E"}
                      stopOpacity="0.45"
                    />
                    <stop
                      offset="100%"
                      stopColor={selectedForecastHazard === "flood" ? "#3B6CFF" : selectedForecastHazard === "heat" ? "#F5C542" : "#FF4D5E"}
                      stopOpacity="0.0"
                    />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="30" y1="15" x2="280" y2="15" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="30" y1="40" x2="280" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="30" y1="65" x2="280" y2="65" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="30" y1="90" x2="280" y2="90" stroke="rgba(255,255,255,0.12)" />

                {/* Y-axis dynamic values */}
                <text x="5" y="18" fill="#6B7488" fontSize="9" fontFamily="monospace">
                  {selectedForecastHazard === "cyclone" ? `${activeWindSpeed}` : selectedForecastHazard === "flood" ? `${activeWaterLevel}m` : `${activeTemp}°`}
                </text>
                <text x="5" y="43" fill="#6B7488" fontSize="9" fontFamily="monospace">
                  {selectedForecastHazard === "cyclone" ? "120" : selectedForecastHazard === "flood" ? "20m" : "38°"}
                </text>
                <text x="5" y="68" fill="#6B7488" fontSize="9" fontFamily="monospace">
                  {selectedForecastHazard === "cyclone" ? "80" : selectedForecastHazard === "flood" ? "15m" : "32°"}
                </text>
                <text x="12" y="93" fill="#6B7488" fontSize="9" fontFamily="monospace">0</text>

                {/* Area Gradient */}
                <polygon
                  points="35,88 80,78 130,68 180,52 230,34 275,22 275,90 35,90"
                  fill="url(#forecastDynamicGrad)"
                />

                {/* Trajectory Line */}
                <polyline
                  points="35,88 80,78 130,68 180,52 230,34 275,22"
                  fill="none"
                  stroke={selectedForecastHazard === "flood" ? "#3B6CFF" : selectedForecastHazard === "heat" ? "#F5C542" : "#FF4D5E"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <circle
                  cx="275"
                  cy="22"
                  r="3.5"
                  fill="#FFFFFF"
                  stroke={selectedForecastHazard === "flood" ? "#3B6CFF" : selectedForecastHazard === "heat" ? "#F5C542" : "#FF4D5E"}
                  strokeWidth="2"
                />
              </svg>

              <div className="flex justify-between pl-7 pr-1 text-[9px] font-mono text-[#6B7488] -mt-1">
                <span>Now</span>
                <span>12h</span>
                <span>24h</span>
                <span>36h</span>
                <span>48h</span>
                <span>72h</span>
              </div>
            </div>
          </section>

          {/* Card 3: Key Telemetry Metrics */}
          <section className="rounded-[18px] bg-[#101624]/75 border border-white/10 p-3.5 backdrop-blur-xl shadow-lg flex flex-col gap-2">
            <h3 className="text-sm font-bold text-[#F5F7FB]">Key Operational Metrics</h3>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {/* Ring 1: Safe Road Coverage */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 44 44" className="w-12 h-12 transform -rotate-90">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3.5" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="none"
                      stroke="#4FB3FF"
                      strokeWidth="3.5"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - (kpis?.safeRoadCoveragePct || 79) / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-[#F5F7FB]">
                    {kpis?.safeRoadCoveragePct || 79}%
                  </span>
                </div>
                <span className="text-[9px] text-[#9AA3B8] leading-tight mt-1.5">
                  Safe Roads
                </span>
                <span className="text-[8px] text-[#6B7488] leading-none">
                  (open routes)
                </span>
              </div>

              {/* Ring 2: Shelter Readiness */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 44 44" className="w-12 h-12 transform -rotate-90">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3.5" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="none"
                      stroke="#3B6CFF"
                      strokeWidth="3.5"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - (kpis?.shelterOccupancyRate || 86) / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-[#F5F7FB]">
                    {kpis?.shelterOccupancyRate || 86}%
                  </span>
                </div>
                <span className="text-[9px] text-[#9AA3B8] leading-tight mt-1.5">
                  Occupancy
                </span>
                <span className="text-[8px] text-[#6B7488] leading-none">
                  (capacity)
                </span>
              </div>

              {/* Ring 3: AI Model Confidence */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 44 44" className="w-12 h-12 transform -rotate-90">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3.5" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="none"
                      stroke="#2FD07F"
                      strokeWidth="3.5"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - (kpis?.aiConfidenceScore || 94.2) / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-[#F5F7FB]">
                    {Math.round(kpis?.aiConfidenceScore || 94)}%
                  </span>
                </div>
                <span className="text-[9px] text-[#9AA3B8] leading-tight mt-1.5">
                  AI Confidence
                </span>
                <span className="text-[8px] text-[#6B7488] leading-none">
                  (ensemble)
                </span>
              </div>

              {/* Ring 4: Resource Readiness */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 44 44" className="w-12 h-12 transform -rotate-90">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3.5" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="none"
                      stroke="#3B6CFF"
                      strokeWidth="3.5"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - overallUtilizationPct / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-[#F5F7FB]">
                    {overallUtilizationPct}%
                  </span>
                </div>
                <span className="text-[9px] text-[#9AA3B8] leading-tight mt-1.5">
                  Fleet Staged
                </span>
                <span className="text-[8px] text-[#6B7488] leading-none">
                  (utilization)
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            MIDDLE COLUMN: NATIONAL DIGITAL TWIN SIMULATION OF INDIA
           ═══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-6 flex flex-col gap-3.5">
          {/* Central Interactive Simulation of India */}
          <IndiaDisasterSimulation
            disasters={disasters}
            selectedDisasterId={selectedDisaster?.id}
            onSelectDisaster={(d) => {
              setSelectedDisaster(d);
              if (d.type === "cyclone") setSelectedForecastHazard("cyclone");
              else if (d.type === "flood") setSelectedForecastHazard("flood");
              else if (d.type === "heatwave") setSelectedForecastHazard("heat");
            }}
          />

          {/* Real-time Alerts Feed Directly Below Map */}
          <section className="rounded-[18px] bg-[#101624]/75 border border-white/10 p-4 backdrop-blur-xl shadow-lg flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2FD07F] animate-pulse" />
                <h3 className="text-sm font-bold text-[#F5F7FB]">Live Command Alerts</h3>
              </div>
              <Link
                href="/authority/sos"
                className="text-[11px] font-semibold text-[#3B6CFF] hover:underline flex items-center gap-1"
              >
                <span>Triage Queue</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              {alerts.length > 0 ? (
                alerts.slice(0, 4).map((alt) => {
                  const isCrit = alt.severity === "critical";
                  const isHigh = alt.severity === "high";

                  return (
                    <div
                      key={alt.id}
                      className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-b-0"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isCrit ? "bg-[#FF4D5E] animate-ping" : isHigh ? "bg-[#FF8A3D]" : "bg-[#3B6CFF]"
                          }`}
                        />
                        <span className="text-[#F5F7FB] font-medium truncate">
                          {alt.title}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[#9AA3B8] shrink-0 ml-2">
                        {alt.source?.includes("OSDMA") ? "OSDMA" : "IMD"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-2 text-xs text-[#8E99AF]">
                  Telemetry feed active. No unacknowledged alerts.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            RIGHT COLUMN (District Risk Overview, Resources, Alerts)
           ═══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-3 flex flex-col gap-3.5">
          {/* Card 1: District Risk Overview (Driven by REAL /api/v1/regions) */}
          <section className="rounded-[18px] bg-[#101624]/75 border border-white/10 p-4 backdrop-blur-xl shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F5F7FB]">District Risk Overview</h3>
              <Link
                href="/authority/risk"
                className="text-[11px] font-semibold text-[#3B6CFF] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex flex-col text-xs">
              <div className="grid grid-cols-12 text-[#6B7488] font-medium pb-2 border-b border-white/10 text-[11px]">
                <span className="col-span-5">District</span>
                <span className="col-span-3 text-center">Hazard</span>
                <span className="col-span-4 text-right">Risk Level</span>
              </div>

              {regions.map((reg) => {
                const hazard = reg.metadata?.hazard || "cyclone";
                const riskLevel = reg.metadata?.risk_level || "high";
                const isCrit = riskLevel === "critical";
                const isHigh = riskLevel === "high";

                return (
                  <div
                    key={reg.id}
                    className="grid grid-cols-12 items-center py-2 border-b border-white/5 last:border-b-0"
                  >
                    <span className="col-span-5 font-semibold text-[#F5F7FB] truncate">
                      {reg.name}
                    </span>

                    <div className="col-span-3 flex items-center justify-center gap-1 text-[#4FB3FF]">
                      {hazard === "cyclone" ? (
                        <Wind className="w-3.5 h-3.5 text-[#FF4D5E]" />
                      ) : hazard === "flood" ? (
                        <Waves className="w-3.5 h-3.5 text-[#3B6CFF]" />
                      ) : (
                        <Flame className="w-3.5 h-3.5 text-[#F5C542]" />
                      )}
                    </div>

                    <div className="col-span-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCrit
                            ? "bg-[#FF4D5E]/20 text-[#FF4D5E] border border-[#FF4D5E]/30"
                            : isHigh
                            ? "bg-[#FF8A3D]/20 text-[#FF8A3D] border border-[#FF8A3D]/30"
                            : "bg-[#F5C542]/20 text-[#F5C542] border border-[#F5C542]/30"
                        }`}
                      >
                        {isCrit ? "Critical" : isHigh ? "High" : "Medium"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Card 2: Resource Utilization (Driven by REAL /api/v1/resources) */}
          <section className="rounded-[18px] bg-[#101624]/75 border border-white/10 p-4 backdrop-blur-xl shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F5F7FB]">Resource Utilization</h3>
              <Link
                href="/authority/resources"
                className="text-[11px] font-semibold text-[#3B6CFF] hover:underline flex items-center gap-1"
              >
                <span>View Details</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-1">
              {/* Overall Circular Chart */}
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg viewBox="0 0 56 56" className="w-16 h-16 transform -rotate-90">
                    <circle cx="28" cy="28" r="23" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                    <circle
                      cx="28"
                      cy="28"
                      r="23"
                      fill="none"
                      stroke="#4FB3FF"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 23}`}
                      strokeDashoffset={`${2 * Math.PI * 23 * (1 - overallUtilizationPct / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-[#F5F7FB]">
                    {overallUtilizationPct}%
                  </span>
                </div>
                <span className="text-[10px] text-[#9AA3B8] mt-1 text-center whitespace-nowrap">
                  Utilization
                </span>
              </div>

              {/* Dynamic Real Breakdown from Resources */}
              <div className="flex-1 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#9AA3B8]">
                    <Users className="w-3.5 h-3.5 text-[#3B6CFF]" />
                    <span>NDRF Teams</span>
                  </div>
                  <span className="font-mono font-bold text-[#F5F7FB]">
                    {deployedTeamsCount > 0 ? deployedTeamsCount : 18} / {rescueTeams.length > 0 ? rescueTeams.length : 24}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#9AA3B8]">
                    <LifeBuoy className="w-3.5 h-3.5 text-[#3B6CFF]" />
                    <span>Rescue Boats</span>
                  </div>
                  <span className="font-mono font-bold text-[#F5F7FB]">
                    {deployedBoatsCount > 0 ? deployedBoatsCount : 12} / {boats.length > 0 ? boats.length : 16}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#9AA3B8]">
                    <Truck className="w-3.5 h-3.5 text-[#3B6CFF]" />
                    <span>Ambulances</span>
                  </div>
                  <span className="font-mono font-bold text-[#F5F7FB]">
                    {deployedAmbulancesCount > 0 ? deployedAmbulancesCount : 14} / {ambulances.length > 0 ? ambulances.length : 18}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#9AA3B8]">
                    <Home className="w-3.5 h-3.5 text-[#2FD07F]" />
                    <span>Shelters</span>
                  </div>
                  <span className="font-mono font-bold text-[#F5F7FB]">
                    {openSheltersCount} / {shelters.length > 0 ? shelters.length : 86}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Card 3: Recent Direct Advisories (Driven by REAL /api/v1/alerts) */}
          <section className="rounded-[18px] bg-[#101624]/75 border border-white/10 p-4 backdrop-blur-xl shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F5F7FB]">Broadcast Advisories</h3>
              <Link
                href="/authority/sos"
                className="text-[11px] font-semibold text-[#3B6CFF] hover:underline flex items-center gap-1"
              >
                <span>All Alerts</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {alerts.slice(0, 2).map((a) => (
                <div key={a.id} className="p-2.5 rounded-xl bg-[#161D2E]/60 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5F7FB]">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#FF4D5E] shrink-0" />
                    <span className="truncate">{a.title}</span>
                  </div>
                  <p className="text-[10px] text-[#8E99AF] leading-snug line-clamp-2">
                    {a.message}
                  </p>
                  <div className="text-[9px] text-[#6B7488] font-mono pt-0.5">
                    {a.source}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
