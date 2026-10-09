"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  ExternalLink,
  Droplets,
  Gauge,
  MapPin,
  ArrowRight,
  Radio,
  Box,
} from "lucide-react";
import { toast } from "sonner";

export default function AuthorityMapPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState<string>("3d");
  const [selectedMilestone, setSelectedMilestone] = useState<number>(0);

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

  return (
    <div className="w-screen h-screen bg-[#060A13] text-[#F5F7FB] flex overflow-hidden select-none font-sans relative">
      {/* ═══════════════════════════════════════════════════════════════
          1. LEFT SLIM SIDEBAR (Exact Match to Reference Image)
         ═══════════════════════════════════════════════════════════════ */}
      <aside className="w-[72px] h-full bg-[#060A13] border-r border-white/10 flex flex-col items-center justify-between py-3 z-30 shrink-0">
        {/* Top: Brand Logo */}
        <div className="flex flex-col items-center gap-1">
          <Link
            href="/authority/dashboard"
            className="w-9 h-9 rounded-2xl bg-[#3B6CFF] flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,108,255,0.5)] hover:scale-105 transition-transform"
            title="ASPIRE Command Center"
          >
            <Shield className="w-4 h-4 fill-white text-[#3B6CFF]" />
          </Link>
          <span className="text-[9px] font-black tracking-widest text-[#F5F7FB] uppercase mt-0.5">
            ASPIRE
          </span>
        </div>

        {/* Navigation Items (Stacked with Icon + small text label) */}
        <nav className="flex flex-col items-center gap-1.5 w-full px-1.5 my-auto">
          {/* 1. Dashboard */}
          <Link
            href="/authority/dashboard"
            className="w-full flex flex-col items-center justify-center py-1.5 rounded-xl text-[#8E99AF] hover:text-white hover:bg-white/5 transition-all group"
            title="Dashboard"
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-medium leading-none">Dashboard</span>
          </Link>

          {/* 2. Map (ACTIVE) */}
          <Link
            href="/authority/map"
            className="w-full flex flex-col items-center justify-center py-1.5 rounded-xl bg-[#3B6CFF] text-white shadow-[0_0_16px_rgba(59,108,255,0.45)] transition-all"
            title="Disaster Map"
          >
            <Globe className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-semibold leading-none">Map</span>
          </Link>

          {/* 3. Alerts */}
          <Link
            href="/authority/sos"
            className="w-full flex flex-col items-center justify-center py-1.5 rounded-xl text-[#8E99AF] hover:text-white hover:bg-white/5 transition-all group"
            title="Alerts"
          >
            <Bell className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-medium leading-none">Alerts</span>
          </Link>

          {/* 4. Resources */}
          <Link
            href="/authority/resources"
            className="w-full flex flex-col items-center justify-center py-1.5 rounded-xl text-[#8E99AF] hover:text-white hover:bg-white/5 transition-all group"
            title="Resources"
          >
            <Package className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-medium leading-none">Resources</span>
          </Link>

          {/* 5. Shelters */}
          <Link
            href="/authority/shelters"
            className="w-full flex flex-col items-center justify-center py-1.5 rounded-xl text-[#8E99AF] hover:text-white hover:bg-white/5 transition-all group"
            title="Shelters"
          >
            <Home className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-medium leading-none">Shelters</span>
          </Link>

          {/* 6. People */}
          <Link
            href="/authority/hospitals"
            className="w-full flex flex-col items-center justify-center py-1.5 rounded-xl text-[#8E99AF] hover:text-white hover:bg-white/5 transition-all group"
            title="People & Casualties"
          >
            <Users className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-medium leading-none">People</span>
          </Link>

          {/* 7. Reports */}
          <Link
            href="/authority/impact"
            className="w-full flex flex-col items-center justify-center py-1.5 rounded-xl text-[#8E99AF] hover:text-white hover:bg-white/5 transition-all group"
            title="Reports"
          >
            <FileText className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-medium leading-none">Reports</span>
          </Link>

          {/* 8. AI Insights */}
          <Link
            href="/authority/risk"
            className="w-full flex flex-col items-center justify-center py-1.5 rounded-xl text-[#8E99AF] hover:text-white hover:bg-white/5 transition-all group"
            title="AI Insights"
          >
            <Sparkles className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-medium leading-none whitespace-nowrap">AI Insights</span>
          </Link>
        </nav>

        {/* Bottom: Settings */}
        <Link
          href="/authority/settings"
          className="w-full flex flex-col items-center justify-center py-1.5 rounded-xl text-[#8E99AF] hover:text-white hover:bg-white/5 transition-all group"
          title="Settings"
        >
          <Settings className="w-4 h-4 mb-0.5 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-medium leading-none">Settings</span>
        </Link>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CANVAS CONTAINER (Header + Interactive Map Surface)
         ═══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 h-full flex flex-col relative overflow-hidden">
        {/* ─────────────────────────────────────────────────────────────
            TOP HEADER BAR (Exact Match to Reference Image)
           ───────────────────────────────────────────────────────────── */}
        <header className="h-[58px] px-5 bg-[#060A13]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-4 z-20 shrink-0">
          {/* Left: Breadcrumb + Title + Subtitle */}
          <div className="flex flex-col">
            <span className="text-[10px] text-[#6B7488] font-medium leading-none">
              Authority / Map
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h1 className="text-base font-bold tracking-tight text-[#F5F7FB] leading-none">
                Disaster Monitoring
              </h1>
              {/* Green Live Pill */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#2FD07F]/15 border border-[#2FD07F]/30 text-[#2FD07F] text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2FD07F] animate-pulse" />
                <span>Live</span>
              </div>
            </div>
            <p className="text-[10px] text-[#8E99AF] font-medium leading-none mt-0.5 hidden sm:block">
              Real-time multi-hazard tracking and impact intelligence
            </p>
          </div>

          {/* Center: Search Field */}
          <div className="hidden md:flex items-center relative flex-1 max-w-sm mx-4">
            <Search className="w-3.5 h-3.5 text-[#6B7488] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search location, district, facility..."
              className="w-full bg-[#101624]/80 border border-white/10 rounded-full pl-9 pr-14 py-1.5 text-xs text-[#F5F7FB] placeholder-[#6B7488] focus:border-[#3B6CFF] focus:outline-none focus:ring-1 focus:ring-[#3B6CFF] transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-[#8E99AF] border border-white/5">
              ⌘ K
            </span>
          </div>

          {/* Right: Notifications + User Profile */}
          <div className="flex items-center gap-3">
            {/* Bell Icon */}
            <Link
              href="/authority/sos"
              className="relative w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#9AA3B8] hover:text-white transition-colors"
              title="Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF4D5E] ring-2 ring-[#060A13]" />
            </Link>

            {/* Profile Avatar Pill */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3B6CFF] to-[#1D4ED8] ring-1 ring-white/20 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                AD
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#F5F7FB] leading-none">
                  Authority User
                </span>
                <span className="text-[10px] text-[#8E99AF] leading-tight mt-0.5">
                  State Emergency Ops
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ─────────────────────────────────────────────────────────────
            MAP AREA (Full Background with Floating Glass Panels)
           ───────────────────────────────────────────────────────────── */}
        <div className="flex-1 w-full h-full relative overflow-hidden">
          {/* Satellite Map Canvas Image (High-Res Odisha Terrain & Ocean Cyclone) */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url('/satellite-map-odisha.jpg')`,
              filter: "brightness(0.95) contrast(1.05)",
            }}
          />

          {/* Atmosphere Glow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060A13]/90 via-transparent to-[#060A13]/40 pointer-events-none" />

          {/* ═══════════════════════════════════════════════════════════
              TOP FLOATING CONTROLS PILL BAR (Over Map)
             ═══════════════════════════════════════════════════════════ */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {/* 1. 3D Mode */}
            <button
              type="button"
              onClick={() => setActiveTool("3d")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTool === "3d"
                  ? "bg-[#3B6CFF] text-white shadow-[0_0_15px_rgba(59,108,255,0.5)] border border-[#3B6CFF]"
                  : "bg-[#101624]/85 text-[#8E99AF] hover:text-white border border-white/10"
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D</span>
            </button>

            {/* 2. Layers */}
            <button
              type="button"
              onClick={() => setActiveTool("layers")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeTool === "layers"
                  ? "bg-[#3B6CFF] text-white shadow-md border border-[#3B6CFF]"
                  : "bg-[#101624]/85 text-[#8E99AF] hover:text-white border border-white/10"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layers</span>
            </button>

            {/* 3. Weather */}
            <button
              type="button"
              onClick={() => setActiveTool("weather")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeTool === "weather"
                  ? "bg-[#3B6CFF] text-white shadow-md border border-[#3B6CFF]"
                  : "bg-[#101624]/85 text-[#8E99AF] hover:text-white border border-white/10"
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>Weather</span>
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
                  ? "bg-[#3B6CFF] text-white shadow-md border border-[#3B6CFF]"
                  : "bg-[#101624]/85 text-[#8E99AF] hover:text-white border border-white/10"
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Measure</span>
            </button>

            {/* 5. Fullscreen */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#101624]/85 text-[#8E99AF] hover:text-white border border-white/10 transition-all cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>Fullscreen</span>
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              INTERACTIVE GIS VECTOR OVERLAYS (Districts, Trajectory, Pins)
             ═══════════════════════════════════════════════════════════ */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
              <radialGradient id="coneGrad" cx="70%" cy="60%" r="70%">
                <stop offset="0%" stopColor="#FF4D5E" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#FF4D5E" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#FF4D5E" stopOpacity="0.0" />
              </radialGradient>
            </defs>

            {/* Projected Landfall Cone of Uncertainty (Funnel Leading to Coast) */}
            {layers.cycloneTrack && (
              <g>
                <polygon
                  points="780,560 620,410 490,320 520,380 660,540"
                  fill="url(#coneGrad)"
                  stroke="#FF4D5E"
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
                {/* White Dashed Trajectory Centerline */}
                <line
                  x1="760"
                  y1="550"
                  x2="500"
                  y2="340"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                />
                {/* Cyclone milestone nodes along trajectory */}
                <circle cx="760" cy="550" r="7" fill="#FF4D5E" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="680" cy="485" r="6" fill="#FF4D5E" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="610" cy="425" r="5" fill="#FF8A3D" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="550" cy="380" r="5" fill="#3B6CFF" stroke="#FFFFFF" strokeWidth="1.5" />
              </g>
            )}

            {/* Coastal Hazard Zone Highlights */}
            {layers.hazardZones && (
              <g>
                {/* Jagatsinghpur, Kendrapara & Puri Coastal Red Zone */}
                <path
                  d="M 520 290 Q 560 310 580 345 T 530 380 Q 500 340 520 290 Z"
                  fill="#FF4D5E"
                  fillOpacity="0.32"
                  stroke="#FF4D5E"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
                {/* Cuttack & Jajpur Orange Alert Zone */}
                <path
                  d="M 480 260 Q 520 280 540 310 T 490 340 Q 460 300 480 260 Z"
                  fill="#FF8A3D"
                  fillOpacity="0.22"
                  stroke="#FF8A3D"
                  strokeWidth="1.5"
                />
              </g>
            )}
          </svg>

          {/* ═══════════════════════════════════════════════════════════
              GEOGRAPHIC DISTRICT LABELS & PINS ON MAP
             ═══════════════════════════════════════════════════════════ */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* ODISHA State Title */}
            <div className="absolute left-[34%] top-[38%] text-base font-extrabold tracking-widest text-white/70 select-none">
              ODISHA
            </div>

            {/* District Labels (Matching Reference Image) */}
            {[
              { name: "Sambalpur", x: "32%", y: "26%" },
              { name: "Deogarh", x: "39%", y: "27%" },
              { name: "Keonjhar", x: "46%", y: "26%" },
              { name: "Mayurbhanj", x: "53%", y: "20%" },
              { name: "Angul", x: "38%", y: "34%" },
              { name: "Dhenkanal", x: "43%", y: "36%" },
              { name: "Jajpur", x: "49%", y: "38%" },
              { name: "Bhadrak", x: "55%", y: "37%" },
              { name: "Baleswar", x: "56%", y: "33%" },
              { name: "Kendrapara", x: "53%", y: "41%" },
              { name: "Cuttack", x: "47%", y: "43%" },
              { name: "Jagatsinghpur", x: "51%", y: "46%" },
              { name: "Bhubaneswar", x: "42%", y: "50%" },
              { name: "Khordha", x: "40%", y: "54%" },
              { name: "Puri", x: "44%", y: "55%" },
              { name: "Nayagarh", x: "35%", y: "49%" },
              { name: "Ganjam", x: "33%", y: "60%" },
            ].map((d) => (
              <div
                key={d.name}
                className="absolute text-[10px] font-semibold text-white/60 tracking-tight"
                style={{ left: d.x, top: d.y }}
              >
                {d.name}
              </div>
            ))}

            {/* Pins Placed Across Coast (Shelters ⛺, Hospitals ➕, Hazard ⚠️) */}
            {/* 1. Shelter Pins (Green) */}
            {layers.shelters && (
              <>
                <div
                  className="absolute pointer-events-auto cursor-pointer"
                  style={{ left: "53%", top: "22%" }}
                  onClick={() => toast.info("Shelter: Baripada High School Relief Hub (820 capacity, 410 occupied)")}
                >
                  <div className="w-5 h-5 rounded-full bg-[#2FD07F] border-2 border-white flex items-center justify-center text-white shadow-lg hover:scale-125 transition-transform">
                    <Home className="w-2.5 h-2.5 fill-white" />
                  </div>
                </div>

                <div
                  className="absolute pointer-events-auto cursor-pointer"
                  style={{ left: "56%", top: "28%" }}
                  onClick={() => toast.info("Shelter: Baleswar Cyclone Center (1200 capacity, 940 occupied)")}
                >
                  <div className="w-5 h-5 rounded-full bg-[#2FD07F] border-2 border-white flex items-center justify-center text-white shadow-lg hover:scale-125 transition-transform">
                    <Home className="w-2.5 h-2.5 fill-white" />
                  </div>
                </div>

                <div
                  className="absolute pointer-events-auto cursor-pointer"
                  style={{ left: "39%", top: "47%" }}
                  onClick={() => toast.info("Shelter: Khordha Community Shelter (950 capacity, 620 occupied)")}
                >
                  <div className="w-5 h-5 rounded-full bg-[#2FD07F] border-2 border-white flex items-center justify-center text-white shadow-lg hover:scale-125 transition-transform">
                    <Home className="w-2.5 h-2.5 fill-white" />
                  </div>
                </div>
              </>
            )}

            {/* 2. Hospital Pins (Blue Cross) */}
            {layers.hospitals && (
              <>
                <div
                  className="absolute pointer-events-auto cursor-pointer"
                  style={{ left: "44.5%", top: "43%" }}
                  onClick={() => toast.info("Hospital: SCB Medical College Cuttack (45 ICU Beds, Generator Online)")}
                >
                  <div className="w-5 h-5 rounded-full bg-[#3B6CFF] border-2 border-white flex items-center justify-center text-white shadow-lg hover:scale-125 transition-transform">
                    <span className="font-bold text-[11px] leading-none">+</span>
                  </div>
                </div>

                <div
                  className="absolute pointer-events-auto cursor-pointer"
                  style={{ left: "38.5%", top: "55%" }}
                  onClick={() => toast.info("Hospital: AIIMS Bhubaneswar Emergency Unit (100% Power, 22 Free ICU Beds)")}
                >
                  <div className="w-5 h-5 rounded-full bg-[#3B6CFF] border-2 border-white flex items-center justify-center text-white shadow-lg hover:scale-125 transition-transform">
                    <span className="font-bold text-[11px] leading-none">+</span>
                  </div>
                </div>
              </>
            )}

            {/* 3. Alert Pins (Red Triangle) */}
            {layers.hazardZones && (
              <>
                <div
                  className="absolute pointer-events-auto cursor-pointer"
                  style={{ left: "51%", top: "34%" }}
                  onClick={() => toast.error("CRITICAL: Coastal breach alert in Jajpur canal!")}
                >
                  <div className="w-5 h-5 rounded-full bg-[#FF4D5E] border-2 border-white flex items-center justify-center text-white shadow-lg hover:scale-125 transition-transform animate-bounce">
                    <AlertTriangle className="w-2.5 h-2.5" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════
              LEFT FLOATING STACKED CARDS (Matching Reference Image)
             ═══════════════════════════════════════════════════════════ */}
          <div className="absolute top-3 left-3 z-20 w-[295px] flex flex-col gap-2 max-h-[calc(100vh-75px)] overflow-hidden pointer-events-auto">
            {/* ── CARD 1: ACTIVE HAZARDS ── */}
            <div className="rounded-[16px] bg-[#101624]/85 border border-white/10 p-3 backdrop-blur-2xl shadow-[0_16px_36px_rgba(0,0,0,0.6)] space-y-2 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5F7FB]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#FF4D5E]" />
                  <span>Active Hazards</span>
                </div>
                <Link
                  href="/authority/risk"
                  className="text-[11px] font-semibold text-[#3B6CFF] hover:underline flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Hero Cyclone Box */}
              <div className="p-2.5 rounded-xl bg-[#161D2E]/80 border border-[#FF4D5E]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#FF4D5E]/20 flex items-center justify-center text-[#FF4D5E]">
                      <Wind className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "6s" }} />
                    </div>
                    <span className="text-xs font-bold text-[#F5F7FB]">Cyclone • Severe</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono bg-[#FF4D5E]/20 text-[#FF4D5E] border border-[#FF4D5E]/40">
                    Critical
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-white/5 text-center">
                  <div>
                    <span className="text-[8px] text-[#8E99AF] block">Wind Speed</span>
                    <span className="font-mono text-xs font-bold text-[#F5F7FB]">185 km/h</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-[#8E99AF] block">Landfall (est.)</span>
                    <span className="font-mono text-xs font-bold text-[#F5F7FB]">in 14 hrs</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-[#8E99AF] block">Affected Districts</span>
                    <span className="font-mono text-xs font-bold text-[#F5F7FB]">6</span>
                  </div>
                </div>
              </div>

              {/* Sub-hazards List */}
              <div className="space-y-1 text-xs">
                {/* Coastal Inundation */}
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#161D2E]/60 border border-white/5">
                  <div className="flex items-center gap-2">
                    <Waves className="w-3 h-3 text-[#3B6CFF]" />
                    <span className="text-[10px] font-medium text-[#F5F7FB]">Coastal Inundation</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#FF8A3D]/20 text-[#FF8A3D] border border-[#FF8A3D]/40">
                    High
                  </span>
                </div>

                {/* Heavy Rainfall */}
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#161D2E]/60 border border-white/5">
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-3 h-3 text-[#4FB3FF]" />
                    <span className="text-[10px] font-medium text-[#F5F7FB]">Heavy Rainfall</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#FF8A3D]/20 text-[#FF8A3D] border border-[#FF8A3D]/40">
                    High
                  </span>
                </div>

                {/* Flood Risk */}
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#161D2E]/60 border border-white/5">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-3 h-3 text-[#2FD07F]" />
                    <span className="text-[10px] font-medium text-[#F5F7FB]">Flood Risk</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#F5C542]/20 text-[#F5C542] border border-[#F5C542]/40">
                    Medium
                  </span>
                </div>
              </div>
            </div>

            {/* ── CARD 2: KEY STATISTICS ── */}
            <div className="rounded-[16px] bg-[#101624]/85 border border-white/10 p-3 backdrop-blur-2xl shadow-[0_16px_36px_rgba(0,0,0,0.6)] space-y-1.5 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5F7FB]">
                  <Sparkles className="w-3.5 h-3.5 text-[#3B6CFF]" />
                  <span>Key Statistics</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Last 24 hours</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                {/* 2.4M People at Risk */}
                <div className="p-2 rounded-xl bg-[#161D2E]/70 border border-white/5 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#3B6CFF]/15 text-[#3B6CFF] flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold font-mono text-[#F5F7FB] leading-none block">
                      2.4M
                    </span>
                    <span className="text-[8px] text-[#8E99AF] leading-none mt-0.5 block">
                      People at Risk
                    </span>
                  </div>
                </div>

                {/* 642 Villages */}
                <div className="p-2 rounded-xl bg-[#161D2E]/70 border border-white/5 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#FF4D5E]/15 text-[#FF4D5E] flex items-center justify-center shrink-0">
                    <Home className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold font-mono text-[#F5F7FB] leading-none block">
                      642
                    </span>
                    <span className="text-[8px] text-[#8E99AF] leading-none mt-0.5 block">
                      Villages
                    </span>
                  </div>
                </div>

                {/* 128 Critical Facilities */}
                <div className="p-2 rounded-xl bg-[#161D2E]/70 border border-white/5 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#FF4D5E]/15 text-[#FF4D5E] flex items-center justify-center shrink-0">
                    <Building className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold font-mono text-[#F5F7FB] leading-none block">
                      128
                    </span>
                    <span className="text-[8px] text-[#8E99AF] leading-none mt-0.5 block">
                      Critical Facilities
                    </span>
                  </div>
                </div>

                {/* 12 Districts */}
                <div className="p-2 rounded-xl bg-[#161D2E]/70 border border-white/5 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#2FD07F]/15 text-[#2FD07F] flex items-center justify-center shrink-0">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold font-mono text-[#F5F7FB] leading-none block">
                      12
                    </span>
                    <span className="text-[8px] text-[#8E99AF] leading-none mt-0.5 block">
                      Districts
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CARD 3: LIVE UPDATES ── */}
            <div className="rounded-[16px] bg-[#101624]/85 border border-white/10 p-3 backdrop-blur-2xl shadow-[0_16px_36px_rgba(0,0,0,0.6)] space-y-1.5 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5F7FB]">
                  <span className="w-2 h-2 rounded-full bg-[#2FD07F] animate-pulse" />
                  <span>Live Updates</span>
                </div>
                <Link
                  href="/authority/sos"
                  className="text-[11px] font-semibold text-[#3B6CFF] hover:underline flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-1.5 text-xs">
                {/* Update 1 */}
                <div className="flex items-start gap-2 py-0.5 border-b border-white/5">
                  <span className="font-mono text-[9px] text-[#8E99AF] shrink-0 mt-0.5">10:24</span>
                  <div className="w-4 h-4 rounded-full bg-[#FF4D5E]/20 text-[#FF4D5E] flex items-center justify-center shrink-0 mt-0.5">
                    <Wind className="w-2.5 h-2.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-[#F5F7FB] leading-tight truncate">
                      Cyclone intensity increased to Severe
                    </p>
                    <span className="text-[8px] text-[#8E99AF] block">IMD Advisory #12</span>
                  </div>
                </div>

                {/* Update 2 */}
                <div className="flex items-start gap-2 py-0.5 border-b border-white/5">
                  <span className="font-mono text-[9px] text-[#8E99AF] shrink-0 mt-0.5">10:18</span>
                  <div className="w-4 h-4 rounded-full bg-[#FF8A3D]/20 text-[#FF8A3D] flex items-center justify-center shrink-0 mt-0.5">
                    <Waves className="w-2.5 h-2.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-[#F5F7FB] leading-tight truncate">
                      High tidal surge expected in Puri
                    </p>
                    <span className="text-[8px] text-[#8E99AF] block">Est. height: 3.4m</span>
                  </div>
                </div>

                {/* Update 3 */}
                <div className="flex items-start gap-2 py-0.5 border-b border-white/5">
                  <span className="font-mono text-[9px] text-[#8E99AF] shrink-0 mt-0.5">10:03</span>
                  <div className="w-4 h-4 rounded-full bg-[#3B6CFF]/20 text-[#3B6CFF] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="font-bold text-[9px]">+</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-[#F5F7FB] leading-tight truncate">
                      Evacuation started in low-lying areas
                    </p>
                    <span className="text-[8px] text-[#8E99AF] block">3,200 people moved</span>
                  </div>
                </div>

                {/* Update 4 */}
                <div className="flex items-start gap-2 py-0.5">
                  <span className="font-mono text-[9px] text-[#8E99AF] shrink-0 mt-0.5">09:48</span>
                  <div className="w-4 h-4 rounded-full bg-[#2FD07F]/20 text-[#2FD07F] flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="w-2.5 h-2.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-[#F5F7FB] leading-tight truncate">
                      NDRF team dispatched to Kendrapara
                    </p>
                    <span className="text-[8px] text-[#8E99AF] block">ETA: 2 hrs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              RIGHT FLOATING LAYERS PANEL (Matching Reference Image)
             ═══════════════════════════════════════════════════════════ */}
          <div className="absolute top-3 right-3 z-20 w-[210px] rounded-[16px] bg-[#101624]/85 border border-white/10 p-3 backdrop-blur-2xl shadow-[0_16px_36px_rgba(0,0,0,0.6)] space-y-2 pointer-events-auto">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5F7FB]">
                <Layers className="w-3.5 h-3.5 text-[#3B6CFF]" />
                <span>Layers</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              {/* 1. Hazard Zones */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#CBD5E1]">
                  <AlertTriangle className="w-3 h-3 text-[#FF4D5E]" />
                  <span>Hazard Zones</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("hazardZones")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.hazardZones ? "bg-[#3B6CFF]" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      layers.hazardZones ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 2. Cyclone Track */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#CBD5E1]">
                  <Wind className="w-3 h-3 text-[#FF8A3D]" />
                  <span>Cyclone Track</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("cycloneTrack")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.cycloneTrack ? "bg-[#3B6CFF]" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      layers.cycloneTrack ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 3. Rainfall (Live) */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#CBD5E1]">
                  <CloudRain className="w-3 h-3 text-[#4FB3FF]" />
                  <span>Rainfall (Live)</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("rainfall")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.rainfall ? "bg-[#3B6CFF]" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      layers.rainfall ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 4. Wind Speed */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#CBD5E1]">
                  <Gauge className="w-3 h-3 text-[#A855F7]" />
                  <span>Wind Speed</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("windSpeed")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.windSpeed ? "bg-[#3B6CFF]" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      layers.windSpeed ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 5. Satellite Imagery */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#CBD5E1]">
                  <Globe className="w-3 h-3 text-[#3B6CFF]" />
                  <span>Satellite Imagery</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("satelliteImagery")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.satelliteImagery ? "bg-[#3B6CFF]" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      layers.satelliteImagery ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 6. District Boundaries */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#8E99AF]">
                  <Box className="w-3 h-3 text-[#8E99AF]" />
                  <span>District Boundaries</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("districtBoundaries")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.districtBoundaries ? "bg-[#3B6CFF]" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      layers.districtBoundaries ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 7. Road Network */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#8E99AF]">
                  <Radio className="w-3 h-3 text-[#8E99AF]" />
                  <span>Road Network</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("roadNetwork")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.roadNetwork ? "bg-[#3B6CFF]" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      layers.roadNetwork ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 8. Shelters */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#CBD5E1]">
                  <Home className="w-3 h-3 text-[#2FD07F]" />
                  <span>Shelters</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("shelters")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.shelters ? "bg-[#3B6CFF]" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      layers.shelters ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 9. Hospitals */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#CBD5E1]">
                  <span className="w-3 h-3 rounded-full bg-[#3B6CFF] text-white flex items-center justify-center font-bold text-[8px]">
                    +
                  </span>
                  <span>Hospitals</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("hospitals")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.hospitals ? "bg-[#3B6CFF]" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      layers.hospitals ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 10. Relief Assets */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] text-[#CBD5E1]">
                  <Package className="w-3 h-3 text-[#F5C542]" />
                  <span>Relief Assets</span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleLayer("reliefAssets")}
                  className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                    layers.reliefAssets ? "bg-[#3B6CFF]" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      layers.reliefAssets ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              BOTTOM FLOATING PANELS (Placed side-by-side without overlap)
             ═══════════════════════════════════════════════════════════ */}
          {/* ── BOTTOM CENTER-LEFT: CYCLONE FORECAST TRACK ── */}
          <div className="absolute bottom-3 left-[315px] z-20 w-[calc(100%-600px)] max-w-[620px] rounded-[16px] bg-[#101624]/85 border border-white/10 p-3 backdrop-blur-2xl shadow-[0_16px_36px_rgba(0,0,0,0.6)] space-y-2 pointer-events-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="w-3.5 h-3.5 text-[#F43F5E]" />
                <h3 className="text-xs font-bold text-[#F5F7FB]">Cyclone Forecast Track</h3>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-medium text-[#F5F7FB] cursor-pointer hover:bg-white/10">
                  <span>IMD Forecast</span>
                  <ChevronDown className="w-3 h-3 text-[#8E99AF]" />
                </div>
                <button
                  type="button"
                  onClick={() => toast.success("IMD Bulletin #14 opened in advisory view")}
                  className="p-1 rounded-lg hover:bg-white/5 text-[#8E99AF] hover:text-white"
                  title="External Link"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 5-Stage Trajectory Track Timeline */}
            <div className="relative pt-1 pb-1">
              {/* Horizontal Track Bar */}
              <div className="absolute top-[16px] left-4 right-4 h-[2px] bg-gradient-to-r from-[#FF4D5E] via-[#FF8A3D] to-[#3B6CFF] opacity-60" />

              <div className="grid grid-cols-5 relative z-10 text-center">
                {/* Point 1: Current */}
                <div
                  onClick={() => setSelectedMilestone(0)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-full bg-[#FF4D5E]/20 border-2 border-[#FF4D5E] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <span className="w-2 h-2 rounded-full bg-[#FF4D5E] animate-ping" />
                  </div>
                  <span className="text-[9px] font-bold text-[#FF4D5E] leading-tight">Current</span>
                  <span className="font-mono text-[10px] font-bold text-[#F5F7FB] leading-tight mt-0.5">
                    185 km/h
                  </span>
                  <span className="font-mono text-[8px] text-[#6B7488] leading-tight">
                    16.1°N, 88.9°E
                  </span>
                </div>

                {/* Point 2: 6 hrs */}
                <div
                  onClick={() => setSelectedMilestone(1)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-full bg-[#FF4D5E]/20 border-2 border-[#FF4D5E] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <Wind className="w-2.5 h-2.5 text-[#FF4D5E]" />
                  </div>
                  <span className="text-[9px] font-bold text-[#8E99AF] leading-tight">6 hrs</span>
                  <span className="font-mono text-[10px] font-bold text-[#F5F7FB] leading-tight mt-0.5">
                    190 km/h
                  </span>
                  <span className="font-mono text-[8px] text-[#6B7488] leading-tight">
                    17.2°N, 87.8°E
                  </span>
                </div>

                {/* Point 3: 12 hrs */}
                <div
                  onClick={() => setSelectedMilestone(2)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-full bg-[#FF8A3D]/20 border-2 border-[#FF8A3D] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <span className="w-2 h-2 rounded-full bg-[#FF8A3D]" />
                  </div>
                  <span className="text-[9px] font-bold text-[#8E99AF] leading-tight">12 hrs</span>
                  <span className="font-mono text-[10px] font-bold text-[#F5F7FB] leading-tight mt-0.5">
                    160 km/h
                  </span>
                  <span className="font-mono text-[8px] text-[#6B7488] leading-tight">
                    19.0°N, 86.5°E
                  </span>
                </div>

                {/* Point 4: 18 hrs */}
                <div
                  onClick={() => setSelectedMilestone(3)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-full bg-[#3B6CFF]/20 border-2 border-[#3B6CFF] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <span className="w-2 h-2 rounded-full bg-[#3B6CFF]" />
                  </div>
                  <span className="text-[9px] font-bold text-[#8E99AF] leading-tight">18 hrs</span>
                  <span className="font-mono text-[10px] font-bold text-[#F5F7FB] leading-tight mt-0.5">
                    120 km/h
                  </span>
                  <span className="font-mono text-[8px] text-[#6B7488] leading-tight">
                    20.1°N, 85.2°E
                  </span>
                </div>

                {/* Point 5: 24 hrs */}
                <div
                  onClick={() => setSelectedMilestone(4)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <span className="w-2 h-2 rounded-full bg-white/50" />
                  </div>
                  <span className="text-[9px] font-bold text-[#8E99AF] leading-tight">24 hrs</span>
                  <span className="font-mono text-[10px] font-bold text-[#F5F7FB] leading-tight mt-0.5">
                    80 km/h
                  </span>
                  <span className="font-mono text-[8px] text-[#6B7488] leading-tight">
                    21.0°N, 84.1°E
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── BOTTOM RIGHT: WEATHER NOW ── */}
          <div className="absolute bottom-3 right-3 z-20 w-[240px] rounded-[16px] bg-[#101624]/85 border border-white/10 p-3 backdrop-blur-2xl shadow-[0_16px_36px_rgba(0,0,0,0.6)] space-y-1.5 pointer-events-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5F7FB]">
                <CloudRain className="w-3.5 h-3.5 text-[#3B6CFF]" />
                <span>Weather Now</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#8E99AF]">
                <MapPin className="w-3 h-3 text-[#FF4D5E]" />
                <span>Puri</span>
              </div>
            </div>

            {/* Main Temp & Cloud Graphic */}
            <div className="flex items-center justify-between py-0.5">
              <div>
                <span className="text-2xl font-extrabold font-mono text-[#F5F7FB] leading-none">
                  28°C
                </span>
                <p className="text-[10px] text-[#CBD5E1] font-semibold mt-0.5">
                  Heavy Rain
                </p>
              </div>

              <div className="w-10 h-10 flex items-center justify-center text-[#4FB3FF]">
                <CloudRain className="w-8 h-8 animate-bounce" style={{ animationDuration: "3s" }} />
              </div>
            </div>

            {/* 4 Metrics in a Row */}
            <div className="grid grid-cols-4 gap-1 pt-1 border-t border-white/5 text-center">
              <div>
                <span className="text-[7px] text-[#6B7488] block">Wind</span>
                <span className="font-mono text-[9px] font-bold text-[#F5F7FB] block">62 km/h</span>
              </div>
              <div>
                <span className="text-[7px] text-[#6B7488] block">Humidity</span>
                <span className="font-mono text-[9px] font-bold text-[#F5F7FB] block">92%</span>
              </div>
              <div>
                <span className="text-[7px] text-[#6B7488] block">Pressure</span>
                <span className="font-mono text-[9px] font-bold text-[#F5F7FB] block">982 hPa</span>
              </div>
              <div>
                <span className="text-[7px] text-[#6B7488] block">Visibility</span>
                <span className="font-mono text-[9px] font-bold text-[#F5F7FB] block">2.4 km</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
