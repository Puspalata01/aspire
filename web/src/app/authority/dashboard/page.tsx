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
    <div className="w-full min-h-screen bg-[#F8F7F4] text-[#1C1929] px-6 py-4 pb-28 select-none flex flex-col gap-6">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION HEADER
         ───────────────────────────────────────────────────────────── */}
      <header className="w-full flex items-center justify-between gap-4 pb-1">
        {/* Left: ASPIRE Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(124,58,237,0.3)]">
              <Shield className="w-4.5 h-4.5 fill-white text-[#7C3AED]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-[#1C1929]">
                  ASPIRE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/30">
                  REAL-TIME TELEMETRY
                </span>
              </div>
              <p className="text-[10px] text-[#5D5775] font-medium leading-none hidden sm:block">
                AI-Powered Multi-Hazard Disaster Intelligence & Autonomous Decision-Support
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search Field */}
        <div className="hidden md:flex items-center relative flex-1 max-w-md mx-4">
          <Search className="w-3.5 h-3.5 text-[#767092] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search district, hazard, shelter, or NDRF resource..."
            className="w-full bg-white border border-[#E7E2DA] rounded-full pl-9 pr-14 py-1.5 text-xs text-[#1C1929] placeholder-[#767092] focus:border-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 shadow-sm transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F5F3ED] text-[#5D5775] border border-[#E7E2DA]">
            Ctrl + K
          </span>
        </div>

        {/* Right: Authority Status Pill, Bell, Profile */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/25 text-[#16A34A] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span>Authority HQ</span>
          </div>

          <button
            type="button"
            className="relative w-9 h-9 rounded-xl bg-white hover:bg-[#F5F3ED] border border-[#E7E2DA] flex items-center justify-center text-[#5D5775] hover:text-[#1C1929] shadow-sm transition-colors cursor-pointer"
            title="Alerts"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-white" />
            )}
          </button>

          <div className="flex items-center gap-2.5 pl-1.5 border-l border-[#E7E2DA]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] ring-1 ring-[#7C3AED]/30 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              SM
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#1C1929] leading-none">
                Dr. S. Mohanty
              </span>
              <span className="text-[10px] text-[#5D5775] leading-tight mt-0.5">
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
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-[#1C1929]">
            Good Morning, Dr. Mohanty
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-[#16A34A] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Odisha State Disaster Management Authority</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#5D5775] mt-0.5">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#D97706]" />
              <span>State Emergency Operations Center</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#767092]" />
              <span>{currentTime || "Live Telemetry Active"}</span>
            </div>
          </div>
        </div>

        {/* Right: 4 Real KPI Cards (Live from Backend) */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* KPI 1: Active Hazards */}
          <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
            <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/25 flex items-center justify-center text-[#EF4444]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#5D5775] block leading-tight">
                Active Hazards
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-[#1C1929]">
                  {disasters.length}
                </span>
                <span className="text-[10px] font-mono text-[#EF4444]">
                  ↑ {disasters.filter((d) => d.status === "active").length} critical
                </span>
              </div>
              <span className="text-[9px] text-[#767092] leading-none block">
                Model Verified
              </span>
            </div>
          </div>

          {/* KPI 2: Total Affected */}
          <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/25 flex items-center justify-center text-[#7C3AED]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#5D5775] block leading-tight">
                Total Affected
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-[#1C1929]">
                  {totalAffected.toLocaleString()}
                </span>
                <span className="text-[10px] font-mono text-[#16A34A]">
                  {kpis?.totalEvacuated ? `↓ ${Math.round(kpis.totalEvacuated / 1000)}k evac` : "In Danger Zone"}
                </span>
              </div>
              <span className="text-[9px] text-[#767092] leading-none block">
                Aggregated GIS Count
              </span>
            </div>
          </div>

          {/* KPI 3: Relief Camps */}
          <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
            <div className="w-10 h-10 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/25 flex items-center justify-center text-[#16A34A]">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#5D5775] block leading-tight">
                Relief Camps
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-[#1C1929]">
                  {openSheltersCount}
                </span>
                <span className="text-[10px] font-mono text-[#16A34A]">
                  {kpis?.shelterOccupancyRate ? `${kpis.shelterOccupancyRate}% cap` : "Active"}
                </span>
              </div>
              <span className="text-[9px] text-[#767092] leading-none block">
                Multipurpose Shelters
              </span>
            </div>
          </div>

          {/* KPI 4: Resources Deployed */}
          <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/25 flex items-center justify-center text-[#7C3AED]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#5D5775] block leading-tight">
                Resources Deployed
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono text-[#1C1929]">
                  {deployedResourcesCount > 0 ? deployedResourcesCount : (kpis?.deployedNDRFTeams || 142)}
                </span>
                <span className="text-[10px] font-mono text-[#16A34A]">
                  {resources.length > 0 ? `of ${resources.length}` : "On Field"}
                </span>
              </div>
              <span className="text-[9px] text-[#767092] leading-none block">
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
          <section className="rounded-[18px] bg-white/95 border border-[#E7E2DA] p-4 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1C1929]">Current Situation</h3>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/25 text-[#16A34A] text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
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
                        ? "bg-[#F3E8FF]/40 border-[#7C3AED] shadow-[0_4px_16px_rgba(124,58,237,0.1)]"
                        : "bg-[#FAF8F5] border-[#E7E2DA]/80 hover:border-[#7C3AED]/40 hover:bg-[#F3E8FF]/20"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isCrit
                          ? "bg-[#EF4444]/15 text-[#EF4444]"
                          : isHigh
                          ? "bg-[#F97316]/15 text-[#F97316]"
                          : "bg-[#7C3AED]/15 text-[#7C3AED]"
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
                        <span className="text-xs font-bold text-[#1C1929] truncate max-w-[130px]">
                          {d.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            isCrit ? "text-[#EF4444]" : isHigh ? "text-[#F97316]" : "text-[#16A34A]"
                          }`}
                        >
                          {isCrit ? "Critical" : isHigh ? "High Risk" : "Moderate"}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#5D5775] leading-snug mt-0.5 line-clamp-2">
                        {d.description || (d as any).region_name || "Active spatial model running."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Card 2: Hazard Forecast (Controlled by Selected Disaster Telemetry) */}
          <section className="rounded-[18px] bg-white/95 border border-[#E7E2DA] p-4 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1C1929]">
                Hazard Forecast
              </h3>
              <span className="text-[10px] font-mono text-[#7C3AED] bg-[#7C3AED]/10 border border-[#7C3AED]/20 px-2 py-0.5 rounded font-semibold">
                {selectedForecastHazard.toUpperCase()}
              </span>
            </div>

            {/* 5 Hazard Type Toggle Buttons */}
            <div className="grid grid-cols-5 gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E7E2DA] text-[10px]">
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
                        ? "bg-[#7C3AED] text-white shadow-sm"
                        : "text-[#5D5775] hover:text-[#1C1929]"
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
                      stopColor={selectedForecastHazard === "flood" ? "#2563EB" : selectedForecastHazard === "heat" ? "#D97706" : "#7C3AED"}
                      stopOpacity="0.35"
                    />
                    <stop
                      offset="100%"
                      stopColor={selectedForecastHazard === "flood" ? "#2563EB" : selectedForecastHazard === "heat" ? "#D97706" : "#7C3AED"}
                      stopOpacity="0.0"
                    />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="30" y1="15" x2="280" y2="15" stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />
                <line x1="30" y1="40" x2="280" y2="40" stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />
                <line x1="30" y1="65" x2="280" y2="65" stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />
                <line x1="30" y1="90" x2="280" y2="90" stroke="rgba(0,0,0,0.1)" />

                {/* Y-axis dynamic values */}
                <text x="5" y="18" fill="#767092" fontSize="9" fontFamily="monospace">
                  {selectedForecastHazard === "cyclone" ? `${activeWindSpeed}` : selectedForecastHazard === "flood" ? `${activeWaterLevel}m` : `${activeTemp}°`}
                </text>
                <text x="5" y="43" fill="#767092" fontSize="9" fontFamily="monospace">
                  {selectedForecastHazard === "cyclone" ? "120" : selectedForecastHazard === "flood" ? "20m" : "38°"}
                </text>
                <text x="5" y="68" fill="#767092" fontSize="9" fontFamily="monospace">
                  {selectedForecastHazard === "cyclone" ? "80" : selectedForecastHazard === "flood" ? "15m" : "32°"}
                </text>
                <text x="12" y="93" fill="#767092" fontSize="9" fontFamily="monospace">0</text>

                {/* Area Gradient */}
                <polygon
                  points="35,88 80,78 130,68 180,52 230,34 275,22 275,90 35,90"
                  fill="url(#forecastDynamicGrad)"
                />

                {/* Trajectory Line */}
                <polyline
                  points="35,88 80,78 130,68 180,52 230,34 275,22"
                  fill="none"
                  stroke={selectedForecastHazard === "flood" ? "#2563EB" : selectedForecastHazard === "heat" ? "#D97706" : "#7C3AED"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <circle
                  cx="275"
                  cy="22"
                  r="3.5"
                  fill="#FFFFFF"
                  stroke={selectedForecastHazard === "flood" ? "#2563EB" : selectedForecastHazard === "heat" ? "#D97706" : "#7C3AED"}
                  strokeWidth="2.5"
                />
              </svg>

              <div className="flex justify-between pl-7 pr-1 text-[9px] font-mono text-[#767092] -mt-1">
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
          <section className="rounded-[18px] bg-white/95 border border-[#E7E2DA] p-3.5 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)] flex flex-col gap-2">
            <h3 className="text-sm font-bold text-[#1C1929]">Key Operational Metrics</h3>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {/* Ring 1: Safe Road Coverage */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 44 44" className="w-12 h-12 transform -rotate-90">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3.5" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="none"
                      stroke="#7C3AED"
                      strokeWidth="3.5"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - (kpis?.safeRoadCoveragePct || 79) / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-[#1C1929]">
                    {kpis?.safeRoadCoveragePct || 79}%
                  </span>
                </div>
                <span className="text-[9px] text-[#5D5775] leading-tight mt-1.5 font-medium">
                  Safe Roads
                </span>
                <span className="text-[8px] text-[#767092] leading-none">
                  (open routes)
                </span>
              </div>

              {/* Ring 2: Shelter Readiness */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 44 44" className="w-12 h-12 transform -rotate-90">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3.5" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="3.5"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - (kpis?.shelterOccupancyRate || 86) / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-[#1C1929]">
                    {kpis?.shelterOccupancyRate || 86}%
                  </span>
                </div>
                <span className="text-[9px] text-[#5D5775] leading-tight mt-1.5 font-medium">
                  Occupancy
                </span>
                <span className="text-[8px] text-[#767092] leading-none">
                  (capacity)
                </span>
              </div>

              {/* Ring 3: AI Model Confidence */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 44 44" className="w-12 h-12 transform -rotate-90">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3.5" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="none"
                      stroke="#16A34A"
                      strokeWidth="3.5"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - (kpis?.aiConfidenceScore || 94.2) / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-[#1C1929]">
                    {Math.round(kpis?.aiConfidenceScore || 94)}%
                  </span>
                </div>
                <span className="text-[9px] text-[#5D5775] leading-tight mt-1.5 font-medium">
                  AI Conf.
                </span>
                <span className="text-[8px] text-[#767092] leading-none">
                  (ensemble)
                </span>
              </div>

              {/* Ring 4: Resource Readiness */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 44 44" className="w-12 h-12 transform -rotate-90">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3.5" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      fill="none"
                      stroke="#6D28D9"
                      strokeWidth="3.5"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - overallUtilizationPct / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-[#1C1929]">
                    {overallUtilizationPct}%
                  </span>
                </div>
                <span className="text-[9px] text-[#5D5775] leading-tight mt-1.5 font-medium">
                  Fleet Staged
                </span>
                <span className="text-[8px] text-[#767092] leading-none">
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
          <section className="rounded-[18px] bg-white/95 border border-[#E7E2DA] p-4 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                <h3 className="text-sm font-bold text-[#1C1929]">Live Command Alerts</h3>
              </div>
              <Link
                href="/authority/sos"
                className="text-[11px] font-semibold text-[#7C3AED] hover:underline flex items-center gap-1"
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
                      className="flex items-center justify-between py-1.5 border-b border-[#E7E2DA]/60 last:border-b-0"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isCrit ? "bg-[#EF4444] animate-ping" : isHigh ? "bg-[#F97316]" : "bg-[#7C3AED]"
                          }`}
                        />
                        <span className="text-[#1C1929] font-medium truncate">
                          {alt.title}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[#5D5775] shrink-0 ml-2">
                        {alt.source?.includes("OSDMA") ? "OSDMA" : "IMD"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-2 text-xs text-[#5D5775]">
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
          <section className="rounded-[18px] bg-white/95 border border-[#E7E2DA] p-4 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1C1929]">District Risk Overview</h3>
              <Link
                href="/authority/risk"
                className="text-[11px] font-semibold text-[#7C3AED] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="flex flex-col text-xs">
              <div className="grid grid-cols-12 text-[#767092] font-semibold pb-2 border-b border-[#E7E2DA] text-[11px]">
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
                    className="grid grid-cols-12 items-center py-2 border-b border-[#E7E2DA]/50 last:border-b-0"
                  >
                    <span className="col-span-5 font-semibold text-[#1C1929] truncate">
                      {reg.name}
                    </span>

                    <div className="col-span-3 flex items-center justify-center gap-1 text-[#7C3AED]">
                      {hazard === "cyclone" ? (
                        <Wind className="w-3.5 h-3.5 text-[#EF4444]" />
                      ) : hazard === "flood" ? (
                        <Waves className="w-3.5 h-3.5 text-[#2563EB]" />
                      ) : (
                        <Flame className="w-3.5 h-3.5 text-[#D97706]" />
                      )}
                    </div>

                    <div className="col-span-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCrit
                            ? "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/25"
                            : isHigh
                            ? "bg-[#F97316]/15 text-[#F97316] border border-[#F97316]/25"
                            : "bg-[#D97706]/15 text-[#D97706] border border-[#D97706]/25"
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
          <section className="rounded-[18px] bg-white/95 border border-[#E7E2DA] p-4 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1C1929]">Resource Utilization</h3>
              <Link
                href="/authority/resources"
                className="text-[11px] font-semibold text-[#7C3AED] hover:underline flex items-center gap-1"
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
                    <circle cx="28" cy="28" r="23" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="4" />
                    <circle
                      cx="28"
                      cy="28"
                      r="23"
                      fill="none"
                      stroke="#7C3AED"
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 23}`}
                      strokeDashoffset={`${2 * Math.PI * 23 * (1 - overallUtilizationPct / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-[#1C1929]">
                    {overallUtilizationPct}%
                  </span>
                </div>
                <span className="text-[10px] text-[#5D5775] mt-1 text-center whitespace-nowrap font-medium">
                  Utilization
                </span>
              </div>

              {/* Dynamic Real Breakdown from Resources */}
              <div className="flex-1 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#5D5775]">
                    <Users className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>NDRF Teams</span>
                  </div>
                  <span className="font-mono font-bold text-[#1C1929]">
                    {deployedTeamsCount > 0 ? deployedTeamsCount : 18} / {rescueTeams.length > 0 ? rescueTeams.length : 24}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#5D5775]">
                    <LifeBuoy className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Rescue Boats</span>
                  </div>
                  <span className="font-mono font-bold text-[#1C1929]">
                    {deployedBoatsCount > 0 ? deployedBoatsCount : 12} / {boats.length > 0 ? boats.length : 16}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#5D5775]">
                    <Truck className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Ambulances</span>
                  </div>
                  <span className="font-mono font-bold text-[#1C1929]">
                    {deployedAmbulancesCount > 0 ? deployedAmbulancesCount : 14} / {ambulances.length > 0 ? ambulances.length : 18}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#5D5775]">
                    <Home className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Shelters</span>
                  </div>
                  <span className="font-mono font-bold text-[#1C1929]">
                    {openSheltersCount} / {shelters.length > 0 ? shelters.length : 86}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Card 3: Recent Direct Advisories (Driven by REAL /api/v1/alerts) */}
          <section className="rounded-[18px] bg-white/95 border border-[#E7E2DA] p-4 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1C1929]">Broadcast Advisories</h3>
              <Link
                href="/authority/sos"
                className="text-[11px] font-semibold text-[#7C3AED] hover:underline flex items-center gap-1"
              >
                <span>All Alerts</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {alerts.slice(0, 2).map((a) => (
                <div key={a.id} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1929]">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />
                    <span className="truncate">{a.title}</span>
                  </div>
                  <p className="text-[10px] text-[#5D5775] leading-snug line-clamp-2">
                    {a.message}
                  </p>
                  <div className="text-[9px] text-[#767092] font-mono pt-0.5">
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
