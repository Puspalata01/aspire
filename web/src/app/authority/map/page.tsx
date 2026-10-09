"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { RealEarthMap } from "@/components/map/RealEarthMap";
import { Disaster, DashboardKPIs, Alert, Shelter, Hospital, Resource } from "@/types";
import {
  LayoutDashboard,
  Globe,
  Bell,
  Package,
  Home,
  Users,
  FileText,
  Sparkles,
  Settings,
  Search,
  Layers,
  CloudRain,
  Ruler,
  Maximize2,
  Minimize2,
  Wind,
  Waves,
  AlertTriangle,
  Building,
  Shield,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Droplets,
  Gauge,
  MapPin,
  ArrowRight,
  Radio,
  Box,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { toast } from "sonner";

export default function AuthorityMapPage() {
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState<string>("2d");
  const [selectedMilestone, setSelectedMilestone] = useState<number>(0);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [activeDisaster, setActiveDisaster] = useState<Disaster | null>(null);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.getActiveDisaster(),
      api.getKPIs(),
      api.getAlerts(),
      api.getShelters(),
      api.getHospitals(),
      api.getResources(),
      api.getDisasters(),
    ]).then(([d, k, a, sh, h, r, dis]) => {
      if (!isMounted) return;
      if (d) setActiveDisaster(d);
      if (k) setKpis(k);
      if (a && a.length > 0) setAlerts(a);
      if (sh && sh.length > 0) setShelters(sh);
      if (h && h.length > 0) setHospitals(h);
      if (r && r.length > 0) setResources(r);
      if (dis && dis.length > 0) setDisasters(dis);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Layer toggles matching reference image exactly
  const [layers, setLayers] = useState({
    hazardZones: true,
    cycloneTrack: true,

    rainfall: true,
    windSpeed: true,
    satelliteImagery: true,
    districtBoundaries: false,
    roadNetwork: false,
    shelters: true,
    hospitals: true,
    reliefAssets: true,
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!mounted) {
    return (
      <div className="w-full flex-1 flex flex-col min-h-0 bg-[#F8F7F4] text-[#1C1929] select-none font-sans relative overflow-hidden">
        <header className="h-[58px] px-5 bg-white/95 backdrop-blur-xl border-b border-[#E7E2DA] flex items-center justify-between gap-4 z-20 shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#767092] font-medium leading-none">
              Authority / Map
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h1 className="text-base font-bold tracking-tight text-[#1C1929] leading-none">
                Disaster Monitoring
              </h1>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#059669] text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>Live</span>
              </div>
            </div>
            <p className="text-[10px] text-[#5D5775] font-medium leading-none mt-0.5 hidden sm:block">
              Real-time multi-hazard tracking and impact intelligence
            </p>
          </div>
        </header>
        <div className="flex-1 w-full relative overflow-hidden bg-[#F8F7F4] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#7C3AED] border-t-transparent animate-spin" />
            <span className="text-xs text-[#767092] font-mono tracking-wider uppercase">Loading GIS Tactical Map...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 bg-[#F8F7F4] text-[#1C1929] select-none font-sans relative overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────
          TOP HEADER BAR (Luxury White/Cream & Royal Purple)
         ───────────────────────────────────────────────────────────── */}
      <header className="h-[58px] px-5 bg-white/95 backdrop-blur-xl border-b border-[#E7E2DA] flex items-center justify-between gap-4 z-20 shrink-0">
        {/* Left: Breadcrumb + Title + Subtitle */}
        <div className="flex flex-col">
          <span className="text-[10px] text-[#767092] font-medium leading-none">
            Authority / Map
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-base font-bold tracking-tight text-[#1C1929] leading-none">
              Disaster Monitoring
            </h1>
            {/* Green Live Pill */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#059669] text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>Live</span>
            </div>
          </div>
          <p className="text-[10px] text-[#5D5775] font-medium leading-none mt-0.5 hidden sm:block">
            Real-time multi-hazard tracking and impact intelligence
          </p>
        </div>

        {/* Center: Search Field */}
        <div className="hidden md:flex items-center relative flex-1 max-w-sm mx-4">
          <Search className="w-3.5 h-3.5 text-[#767092] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search location, district, facility..."
            className="w-full bg-[#F5F3ED] border border-[#E4DFD5] rounded-full pl-9 pr-14 py-1.5 text-xs text-[#1C1929] placeholder-[#767092] focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] transition-all"
            suppressHydrationWarning
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-[#5D5775] border border-[#E4DFD5]">
            ⌘ K
          </span>
        </div>

        {/* Right: Notifications + User Profile */}
        <div className="flex items-center gap-3">
          {/* Bell Icon */}
          <Link
            href="/authority/sos"
            className="relative w-8 h-8 rounded-full bg-[#F5F3ED] hover:bg-white border border-[#E4DFD5] flex items-center justify-center text-[#5D5775] hover:text-[#7C3AED] transition-colors"
            title="Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-white" />
          </Link>

          {/* Profile Avatar Pill */}
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#6D28D9] ring-1 ring-purple-300 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              AD
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#1C1929] leading-none">
                Authority User
              </span>
              <span className="text-[10px] text-[#767092] leading-tight mt-0.5">
                State Emergency Ops
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          MAP AREA (Real Earth 3D WebGL Globe & GIS Surface)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 w-full min-h-0 relative overflow-hidden">
        {/* Real Hardware-Accelerated 3D Earth / Tactical Satellite GIS */}
        <div className="absolute inset-0 z-0">
          <RealEarthMap
            height="100%"
            initialMode={activeTool === "3d" ? "globe" : "2d"}
            initialTheme={layers.satelliteImagery ? "satellite" : "dark"}
            initialCenter={[85.82, 20.29]} // Odisha GIS focus
            initialZoom={7.2}
            initialPitch={45}
            activeDisaster={activeDisaster}
            disasters={disasters}
            shelters={layers.shelters ? shelters : []}
            hospitals={layers.hospitals ? hospitals : []}
            resources={layers.reliefAssets ? resources : []}
            showTopBar={false}
            showTelemetryBar={true}
            showCameraControls={true}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════
            TOP FLOATING CONTROLS PILL BAR (Over Map)
           ═══════════════════════════════════════════════════════════ */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 pointer-events-auto">
          {/* 1. 2D Tactical GIS */}
          <button
            type="button"
            onClick={() => setActiveTool("2d")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTool === "2d"
                ? "bg-[#7C3AED] text-white shadow-[0_4px_16px_rgba(124,58,237,0.35)] border border-[#7C3AED]"
                : "bg-white/95 text-[#5D5775] hover:text-[#1C1929] border border-[#E7E2DA] shadow-sm"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>2D Tactical GIS</span>
          </button>

          {/* 2. 3D Mode */}
          <button
            type="button"
            onClick={() => setActiveTool("3d")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTool === "3d"
                ? "bg-[#7C3AED] text-white shadow-[0_4px_16px_rgba(124,58,237,0.35)] border border-[#7C3AED]"
                : "bg-white/95 text-[#5D5775] hover:text-[#1C1929] border border-[#E7E2DA] shadow-sm"
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Real Earth</span>
          </button>

            {/* 3. Satellite vs Light Theme Toggle */}
            <button
              type="button"
              onClick={() => toggleLayer("satelliteImagery")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                layers.satelliteImagery
                  ? "bg-[#10B981]/15 text-[#059669] border border-[#10B981]/40"
                  : "bg-white/95 text-[#5D5775] hover:text-[#1C1929] border border-[#E7E2DA] shadow-sm"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{layers.satelliteImagery ? "Satellite Active" : "Light GIS"}</span>
            </button>

            {/* 4. Measure */}
            <button
              type="button"
              onClick={() => {
                setActiveTool("measure");
                toast.info("GIS Distance Caliper Active. Click two points on map.");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeTool === "measure"
                  ? "bg-[#7C3AED] text-white shadow-md border border-[#7C3AED]"
                  : "bg-white/95 text-[#5D5775] hover:text-[#1C1929] border border-[#E7E2DA] shadow-sm"
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Measure</span>
            </button>

            {/* 5. Fullscreen */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/95 text-[#5D5775] hover:text-[#1C1929] border border-[#E7E2DA] shadow-sm transition-all cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>Fullscreen</span>
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              LEFT FLOATING STACKED CARDS (With Collapse Toggle)
             ═══════════════════════════════════════════════════════════ */}
          {showLeftPanel ? (
            <div className="absolute top-3 left-3 z-20 w-[260px] flex flex-col gap-2 max-h-[calc(100vh-140px)] overflow-y-auto pointer-events-auto transition-all">
              {/* ── CARD 1: ACTIVE HAZARDS ── */}
              <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-2.5 backdrop-blur-2xl shadow-[0_12px_32px_rgba(124,58,237,0.06)] space-y-1.5 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1929]">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
                    <span>Active Hazards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/authority/risk"
                      className="text-[11px] font-semibold text-[#7C3AED] hover:underline flex items-center gap-0.5"
                    >
                      <span>All</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowLeftPanel(false)}
                      className="text-[#767092] hover:text-[#1C1929] p-0.5 rounded hover:bg-[#F3EFE8] transition-colors cursor-pointer"
                      title="Hide Panel"
                    >
                      <PanelLeftClose className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              {/* Hero Cyclone Box */}
              <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center text-[#7C3AED]">
                      <Wind className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "6s" }} />
                    </div>
                    <span className="text-xs font-bold text-[#1C1929] truncate max-w-[140px]">
                      {activeDisaster?.name || "Cyclone Dana • Severe"}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono bg-purple-100 text-[#7C3AED] border border-purple-300">
                    {activeDisaster?.severity || "Critical"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-purple-200/60 text-center">
                  <div>
                    <span className="text-[8px] text-[#767092] block">Wind Speed</span>
                    <span className="font-mono text-xs font-bold text-[#1C1929]">185 km/h</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-[#767092] block">Landfall (est.)</span>
                    <span className="font-mono text-xs font-bold text-[#1C1929]">in 14 hrs</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-[#767092] block">Affected Districts</span>
                    <span className="font-mono text-xs font-bold text-[#1C1929]">
                      {activeDisaster?.zones?.length ? activeDisaster.zones.length * 3 : 6}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-hazards List */}
              <div className="space-y-1 text-xs">
                {/* Coastal Inundation */}
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#F8F7F4] border border-[#E7E2DA]">
                  <div className="flex items-center gap-2">
                    <Waves className="w-3 h-3 text-[#7C3AED]" />
                    <span className="text-[10px] font-medium text-[#1C1929]">Coastal Inundation</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#F97316]/15 text-[#C2410C] border border-[#F97316]/30">
                    High
                  </span>
                </div>

                {/* Heavy Rainfall */}
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#F8F7F4] border border-[#E7E2DA]">
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-3 h-3 text-[#8B5CF6]" />
                    <span className="text-[10px] font-medium text-[#1C1929]">Heavy Rainfall</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#F97316]/15 text-[#C2410C] border border-[#F97316]/30">
                    High
                  </span>
                </div>

                {/* Flood Risk */}
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#F8F7F4] border border-[#E7E2DA]">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-3 h-3 text-[#10B981]" />
                    <span className="text-[10px] font-medium text-[#1C1929]">Flood Risk</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30">
                    Medium
                  </span>
                </div>
              </div>
            </div>

            {/* ── CARD 2: KEY STATISTICS ── */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 backdrop-blur-2xl shadow-[0_12px_32px_rgba(124,58,237,0.06)] space-y-1.5 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1929]">
                  <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Key Statistics</span>
                </div>
                <span className="text-[9px] text-[#767092]">Last 24 hours</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                {/* People at Risk */}
                <div className="p-2 rounded-xl bg-[#F8F7F4] border border-[#E7E2DA] flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-[#7C3AED] flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold font-mono text-[#1C1929] leading-none block">
                      {kpis?.totalAffected ? (kpis.totalAffected >= 1000000 ? `${(kpis.totalAffected / 1000000).toFixed(1)}M` : `${Math.round(kpis.totalAffected / 1000)}k`) : "2.4M"}
                    </span>
                    <span className="text-[8px] text-[#767092] leading-none mt-0.5 block">
                      People at Risk
                    </span>
                  </div>
                </div>

                {/* Villages */}
                <div className="p-2 rounded-xl bg-[#F8F7F4] border border-[#E7E2DA] flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-100 text-[#EF4444] flex items-center justify-center shrink-0">
                    <Home className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold font-mono text-[#1C1929] leading-none block">
                      {kpis?.activeSheltersCount ? kpis.activeSheltersCount * 7 : 642}
                    </span>
                    <span className="text-[8px] text-[#767092] leading-none mt-0.5 block">
                      Villages
                    </span>
                  </div>
                </div>

                {/* Critical Facilities */}
                <div className="p-2 rounded-xl bg-[#F8F7F4] border border-[#E7E2DA] flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-100 text-[#EF4444] flex items-center justify-center shrink-0">
                    <Building className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold font-mono text-[#1C1929] leading-none block">
                      {kpis?.deployedNDRFTeams ? kpis.deployedNDRFTeams - 14 : 128}
                    </span>
                    <span className="text-[8px] text-[#767092] leading-none mt-0.5 block">
                      Critical Facilities
                    </span>
                  </div>
                </div>

                {/* 12 Districts */}
                <div className="p-2 rounded-xl bg-[#F8F7F4] border border-[#E7E2DA] flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#10B981] flex items-center justify-center shrink-0">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold font-mono text-[#1C1929] leading-none block">
                      12
                    </span>
                    <span className="text-[8px] text-[#767092] leading-none mt-0.5 block">
                      Districts
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CARD 3: LIVE UPDATES ── */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 backdrop-blur-2xl shadow-[0_12px_32px_rgba(124,58,237,0.06)] space-y-1.5 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1929]">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span>Live Updates</span>
                </div>
                <Link
                  href="/authority/sos"
                  className="text-[11px] font-semibold text-[#7C3AED] hover:underline flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-1.5 text-xs">
                {(alerts && alerts.length > 0
                  ? alerts.slice(0, 4)
                  : [
                      { id: "alt-1", title: "Cyclone intensity increased to Severe", source: "IMD Advisory #12", severity: "critical" },
                      { id: "alt-2", title: "High tidal surge expected in Puri", source: "Est. height: 3.4m", severity: "high" },
                      { id: "alt-3", title: "Evacuation started in low-lying areas", source: "3,200 people moved", severity: "high" },
                      { id: "alt-4", title: "NDRF team dispatched to Kendrapara", source: "ETA: 2 hrs", severity: "medium" },
                    ]
                ).map((alt: any, idx: number) => {
                  const isCrit = alt.severity === "critical";
                  const isHigh = alt.severity === "high";
                  return (
                    <div key={alt.id || idx} className="flex items-start gap-2 py-0.5 border-b border-[#E7E2DA]/60 last:border-b-0">
                      <span className="font-mono text-[9px] text-[#767092] shrink-0 mt-0.5">
                        {`10:0${idx * 5}`}
                      </span>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isCrit ? "bg-rose-100 text-[#EF4444]" : isHigh ? "bg-orange-100 text-[#F97316]" : "bg-purple-100 text-[#7C3AED]"
                      }`}>
                        {isCrit ? <Wind className="w-2.5 h-2.5" /> : isHigh ? <Waves className="w-2.5 h-2.5" /> : <Shield className="w-2.5 h-2.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-[#1C1929] leading-tight truncate">
                          {alt.title}
                        </p>
                        <span className="text-[8px] text-[#767092] block truncate">
                          {alt.source || alt.message || "Active Alert"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowLeftPanel(true)}
            className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-full bg-white/95 border border-[#E7E2DA] text-xs text-[#5D5775] hover:text-[#1C1929] flex items-center gap-1.5 shadow-md backdrop-blur-xl pointer-events-auto cursor-pointer hover:border-[#7C3AED]/50 transition-all"
          >
            <PanelLeftOpen className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span className="font-medium">Hazards & Stats</span>
          </button>
        )}

          {/* ═══════════════════════════════════════════════════════════
              RIGHT FLOATING LAYERS PANEL (With Collapse Toggle)
             ═══════════════════════════════════════════════════════════ */}
          {showRightPanel ? (
            <div className="absolute top-3 right-3 z-20 w-[185px] rounded-[16px] bg-white/95 border border-[#E7E2DA] p-2.5 backdrop-blur-2xl shadow-[0_16px_36px_rgba(124,58,237,0.08)] space-y-1.5 pointer-events-auto transition-all">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#E7E2DA]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1929]">
                  <Layers className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Layers</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRightPanel(false)}
                  className="text-[#5D5775] hover:text-[#1C1929] p-0.5 rounded hover:bg-[#F3E8FF] transition-colors cursor-pointer"
                  title="Hide Layers"
                >
                  <PanelRightClose className="w-3.5 h-3.5" />
                </button>
              </div>

            <div className="space-y-1.5 text-xs">
              {/* 1. Hazard Zones */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#3B354D] font-medium">
                  <AlertTriangle className="w-3 h-3 text-[#DC2626]" />
                  <span>Hazard Zones</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("hazardZones")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.hazardZones ? "bg-[#7C3AED]" : "bg-[#E4DFD5]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                      layers.hazardZones ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 2. Cyclone Track */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#3B354D] font-medium">
                  <Wind className="w-3 h-3 text-[#EA580C]" />
                  <span>Cyclone Track</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("cycloneTrack")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.cycloneTrack ? "bg-[#7C3AED]" : "bg-[#E4DFD5]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                      layers.cycloneTrack ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 3. Rainfall (Live) */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#3B354D] font-medium">
                  <CloudRain className="w-3 h-3 text-[#0284C7]" />
                  <span>Rainfall (Live)</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("rainfall")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.rainfall ? "bg-[#7C3AED]" : "bg-[#E4DFD5]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                      layers.rainfall ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 4. Wind Speed */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#3B354D] font-medium">
                  <Gauge className="w-3 h-3 text-[#7C3AED]" />
                  <span>Wind Speed</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("windSpeed")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.windSpeed ? "bg-[#7C3AED]" : "bg-[#E4DFD5]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                      layers.windSpeed ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 5. Satellite Imagery */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#3B354D] font-medium">
                  <Globe className="w-3 h-3 text-[#7C3AED]" />
                  <span>Satellite Imagery</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("satelliteImagery")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.satelliteImagery ? "bg-[#7C3AED]" : "bg-[#E4DFD5]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                      layers.satelliteImagery ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 6. District Boundaries */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#5D5775] font-medium">
                  <Box className="w-3 h-3 text-[#767092]" />
                  <span>District Boundaries</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("districtBoundaries")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.districtBoundaries ? "bg-[#7C3AED]" : "bg-[#E4DFD5]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                      layers.districtBoundaries ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 7. Road Network */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#5D5775] font-medium">
                  <Radio className="w-3 h-3 text-[#767092]" />
                  <span>Road Network</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("roadNetwork")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.roadNetwork ? "bg-[#7C3AED]" : "bg-[#E4DFD5]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                      layers.roadNetwork ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 8. Shelters */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#3B354D] font-medium">
                  <Home className="w-3 h-3 text-[#059669]" />
                  <span>Shelters</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("shelters")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.shelters ? "bg-[#7C3AED]" : "bg-[#E4DFD5]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                      layers.shelters ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 9. Hospitals */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#3B354D] font-medium">
                  <span className="w-3 h-3 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-bold text-[8px]">
                    +
                  </span>
                  <span>Hospitals</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("hospitals")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.hospitals ? "bg-[#7C3AED]" : "bg-[#E4DFD5]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                      layers.hospitals ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 10. Relief Assets */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#3B354D] font-medium">
                  <Package className="w-3 h-3 text-[#D97706]" />
                  <span>Relief Assets</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("reliefAssets")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.reliefAssets ? "bg-[#7C3AED]" : "bg-[#E4DFD5]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                      layers.reliefAssets ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowRightPanel(true)}
            className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-full bg-white/95 border border-[#E7E2DA] text-xs text-[#5D5775] hover:text-[#7C3AED] flex items-center gap-1.5 shadow-lg backdrop-blur-xl pointer-events-auto cursor-pointer hover:border-[#7C3AED]/40 transition-all"
          >
            <PanelRightOpen className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span className="font-medium">Layers</span>
          </button>
        )}

          {/* ═══════════════════════════════════════════════════════════
              BOTTOM FLOATING PANELS (Positioned cleanly above bottom dock)
             ═══════════════════════════════════════════════════════════ */}
          {/* ── BOTTOM CENTER-LEFT: CYCLONE FORECAST TRACK ── */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-[540px] rounded-[16px] bg-white/95 border border-[#E7E2DA] p-2.5 backdrop-blur-2xl shadow-[0_16px_36px_rgba(124,58,237,0.08)] space-y-1.5 pointer-events-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="w-3.5 h-3.5 text-[#DC2626]" />
                <h3 className="text-xs font-bold text-[#1C1929]">Cyclone Forecast Track</h3>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#F8F7F4] border border-[#E7E2DA] text-[10px] font-medium text-[#1C1929] cursor-pointer hover:bg-purple-50 hover:border-[#7C3AED]/30 transition-colors">
                  <span>IMD Forecast</span>
                  <ChevronDown className="w-3 h-3 text-[#5D5775]" />
                </div>
                <button
                  type="button"
                  onClick={() => toast.success("IMD Bulletin #14 opened in advisory view")}
                  className="p-1 rounded-lg hover:bg-[#F3E8FF] text-[#5D5775] hover:text-[#7C3AED] transition-colors"
                  title="External Link"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 5-Stage Trajectory Track Timeline */}
            <div className="relative pt-1 pb-1">
              {/* Horizontal Track Bar */}
              <div className="absolute top-[16px] left-4 right-4 h-[2px] bg-gradient-to-r from-[#DC2626] via-[#EA580C] to-[#7C3AED] opacity-70" />

              <div className="grid grid-cols-5 relative z-10 text-center">
                {/* Point 1: Current */}
                <div
                  onClick={() => setSelectedMilestone(0)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-full bg-[#DC2626]/10 border-2 border-[#DC2626] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-ping" />
                  </div>
                  <span className="text-[9px] font-bold text-[#DC2626] leading-tight">Current</span>
                  <span className="font-mono text-[10px] font-bold text-[#1C1929] leading-tight mt-0.5">
                    185 km/h
                  </span>
                  <span className="font-mono text-[8px] text-[#767092] leading-tight">
                    16.1°N, 88.9°E
                  </span>
                </div>

                {/* Point 2: 6 hrs */}
                <div
                  onClick={() => setSelectedMilestone(1)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-full bg-[#DC2626]/10 border-2 border-[#DC2626] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <Wind className="w-2.5 h-2.5 text-[#DC2626]" />
                  </div>
                  <span className="text-[9px] font-bold text-[#5D5775] leading-tight">6 hrs</span>
                  <span className="font-mono text-[10px] font-bold text-[#1C1929] leading-tight mt-0.5">
                    190 km/h
                  </span>
                  <span className="font-mono text-[8px] text-[#767092] leading-tight">
                    17.2°N, 87.8°E
                  </span>
                </div>

                {/* Point 3: 12 hrs */}
                <div
                  onClick={() => setSelectedMilestone(2)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-full bg-[#EA580C]/10 border-2 border-[#EA580C] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
                  </div>
                  <span className="text-[9px] font-bold text-[#5D5775] leading-tight">12 hrs</span>
                  <span className="font-mono text-[10px] font-bold text-[#1C1929] leading-tight mt-0.5">
                    160 km/h
                  </span>
                  <span className="font-mono text-[8px] text-[#767092] leading-tight">
                    19.0°N, 86.5°E
                  </span>
                </div>

                {/* Point 4: 18 hrs */}
                <div
                  onClick={() => setSelectedMilestone(3)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-full bg-[#7C3AED]/10 border-2 border-[#7C3AED] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                  </div>
                  <span className="text-[9px] font-bold text-[#5D5775] leading-tight">18 hrs</span>
                  <span className="font-mono text-[10px] font-bold text-[#1C1929] leading-tight mt-0.5">
                    120 km/h
                  </span>
                  <span className="font-mono text-[8px] text-[#767092] leading-tight">
                    20.1°N, 85.2°E
                  </span>
                </div>

                {/* Point 5: 24 hrs */}
                <div
                  onClick={() => setSelectedMilestone(4)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-full bg-[#F3E8FF] border-2 border-[#D8B4FE] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                  </div>
                  <span className="text-[9px] font-bold text-[#5D5775] leading-tight">24 hrs</span>
                  <span className="font-mono text-[10px] font-bold text-[#1C1929] leading-tight mt-0.5">
                    80 km/h
                  </span>
                  <span className="font-mono text-[8px] text-[#767092] leading-tight">
                    21.0°N, 84.1°E
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── BOTTOM RIGHT: WEATHER NOW ── */}
          <div className="hidden 2xl:block absolute bottom-24 right-4 z-20 w-[195px] rounded-[16px] bg-white/95 border border-[#E7E2DA] p-2.5 backdrop-blur-2xl shadow-[0_16px_36px_rgba(124,58,237,0.08)] space-y-1.5 pointer-events-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1929]">
                <CloudRain className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Weather Now</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#5D5775]">
                <MapPin className="w-3 h-3 text-[#DC2626]" />
                <span>Puri</span>
              </div>
            </div>

            {/* Main Temp & Cloud Graphic */}
            <div className="flex items-center justify-between py-0.5">
              <div>
                <span className="text-2xl font-extrabold font-mono text-[#1C1929] leading-none">
                  28°C
                </span>
                <p className="text-[10px] text-[#5D5775] font-semibold mt-0.5">
                  Heavy Rain
                </p>
              </div>

              <div className="w-10 h-10 flex items-center justify-center text-[#7C3AED]">
                <CloudRain className="w-8 h-8 animate-bounce" style={{ animationDuration: "3s" }} />
              </div>
            </div>

            {/* 4 Metrics in a Row */}
            <div className="grid grid-cols-4 gap-1 pt-1 border-t border-[#E7E2DA] text-center">
              <div>
                <span className="text-[7px] text-[#767092] block">Wind</span>
                <span className="font-mono text-[9px] font-bold text-[#1C1929] block">62 km/h</span>
              </div>
              <div>
                <span className="text-[7px] text-[#767092] block">Humidity</span>
                <span className="font-mono text-[9px] font-bold text-[#1C1929] block">92%</span>
              </div>
              <div>
                <span className="text-[7px] text-[#767092] block">Pressure</span>
                <span className="font-mono text-[9px] font-bold text-[#1C1929] block">982 hPa</span>
              </div>
              <div>
                <span className="text-[7px] text-[#767092] block">Visibility</span>
                <span className="font-mono text-[9px] font-bold text-[#1C1929] block">2.4 km</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
