"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  ArrowRight,
  LifeBuoy,
  Cpu,
  Workflow,
  MapPin,
  Layers,
  HeartPulse,
  Home,
  CheckCircle2,
  Wind,
  Waves,
  Zap,
  Globe2,
  Activity,
  Server,
  Navigation,
  Database,
  GitBranch,
  ShieldCheck,
  Radio,
  FileCheck2,
} from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1C1929] flex flex-col font-sans selection:bg-[#7C3AED] selection:text-white relative overflow-x-hidden">
      {/* Ambient Atmospheric Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#7C3AED]/12 via-[#9333EA]/4 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[35%] -left-[10%] w-[550px] h-[550px] bg-[#7C3AED]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[60%] -right-[10%] w-[650px] h-[650px] bg-[#059669]/5 rounded-full blur-3xl pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────────
          1. NAVIGATION HEADER
         ───────────────────────────────────────────────────────────── */}
      <header className="border-b border-[#E7E2DA] bg-white/90 backdrop-blur-xl sticky top-0 z-50 px-6 lg:px-16 h-16 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.35)]">
            <Shield className="w-5 h-5 fill-white text-[#7C3AED]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-[#1C1929]">
                {APP_CONFIG.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE]">
                DISASTER INTELLIGENCE OS
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/authority/dashboard"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-[0_4px_14px_rgba(124,58,237,0.3)] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Authority HQ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/citizen"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F8F7F4] hover:bg-[#F3E8FF] text-[#1C1929] hover:text-[#7C3AED] border border-[#E7E2DA] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Citizen Lifeline</span>
          </Link>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION
         ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-16 px-6 lg:px-16 flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          {/* Architecture Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-[#E7E2DA] text-xs text-[#5D5775] backdrop-blur-xl shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
            <span className="font-mono font-semibold text-[#1C1929]">PLATFORM ARCHITECTURE:</span>
            <span className="text-[#7C3AED] font-bold">Predictive Intelligence & Autonomous Response Execution</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#1C1929] leading-[1.1]">
            From Early Warning <br />
            <span className="bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#4F46E5] bg-clip-text text-transparent">
              To Tactical Action.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#5D5775] max-w-2xl mx-auto leading-relaxed">
            ASPIRE bridges the critical gap between meteorological early warnings and on-the-ground crisis execution. Fusing multi-hazard spatial prediction, cascading infrastructure failure graph simulation, and autonomous relief fleet orchestration into a unified operational digital twin.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/authority/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(124,58,237,0.35)] hover:scale-[1.02] transition-all cursor-pointer"
            >
              <span>Launch Authority Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/citizen"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-[#F8F7F4] text-[#1C1929] border border-[#E7E2DA] font-bold text-sm flex items-center justify-center gap-2 shadow-xs hover:scale-[1.02] transition-all cursor-pointer group"
            >
              <LifeBuoy className="w-4 h-4 text-[#DC2626] group-hover:rotate-45 transition-transform" />
              <span>Open Citizen Emergency Lifeline</span>
            </Link>
          </div>

          {/* Architectural Capabilities Strip */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-[#5D5775]">
            <span className="px-3 py-1 rounded-lg bg-white border border-[#E7E2DA] shadow-xs flex items-center gap-1.5 font-medium">
              <Globe2 className="w-3.5 h-3.5 text-[#7C3AED]" />
              Multi-Hazard Digital Twin
            </span>
            <span className="px-3 py-1 rounded-lg bg-white border border-[#E7E2DA] shadow-xs flex items-center gap-1.5 font-medium">
              <Workflow className="w-3.5 h-3.5 text-[#9333EA]" />
              Cascading Failure Graphs
            </span>
            <span className="px-3 py-1 rounded-lg bg-white border border-[#E7E2DA] shadow-xs flex items-center gap-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-[#059669]" />
              Autonomous Resource Allocation
            </span>
            <span className="px-3 py-1 rounded-lg bg-white border border-[#E7E2DA] shadow-xs flex items-center gap-1.5 font-medium">
              <Radio className="w-3.5 h-3.5 text-[#DC2626]" />
              Offline Citizen Lifeline
            </span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. CORE ARCHITECTURAL PILLARS (Bento Grid)
         ───────────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-16 pb-24 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center mb-12 text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-[#7C3AED] font-bold mb-2">
            CORE PLATFORM CAPABILITIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1929]">
            Engineered for Zero-Latency Crisis Decisions
          </h2>
          <p className="text-sm text-[#5D5775] max-w-xl mt-2">
            Discover the five integrated analytical engines powering proactive disaster intelligence from prediction to recovery.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 auto-rows-[280px]">
          {/* ── CARD 1 (HERO CARD - Spans 2 cols, 2 rows): Spatial Prediction & 3D GIS ── */}
          <div className="md:col-span-2 lg:col-span-2 md:row-span-2 rounded-[24px] bg-white border border-[#E7E2DA] p-6 flex flex-col justify-between backdrop-blur-2xl relative overflow-hidden group hover:border-[#7C3AED]/40 transition-all shadow-[0_12px_36px_rgba(124,58,237,0.06)]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#7C3AED]/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE] flex items-center gap-1.5">
                  <Globe2 className="w-3 h-3" />
                  Primary Analytical Engine
                </span>
                <span className="text-xs text-[#767092] font-mono">Spatial Digital Twin</span>
              </div>
              <h3 className="text-xl font-bold text-[#1C1929]">
                3D Multi-Hazard Spatial Modeling
              </h3>
              <p className="text-xs text-[#5D5775] mt-1 max-w-md">
                Continuous ingestion of satellite synthetic-aperture radar, Doppler radar telemetry, river discharge gauges, and coastal elevation models to simulate hydrodynamic inundation and structural exposure.
              </p>
            </div>

            {/* Architecture Pipeline Diagram */}
            <div className="mt-4 p-4 rounded-2xl bg-[#F8F7F4] border border-[#E7E2DA] relative overflow-hidden flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E7E2DA]">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span className="font-mono font-semibold text-[#1C1929]">Multimodal Telemetry Pipeline</span>
                </div>
                <span className="font-mono text-[10px] text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Spatial GIS Ingestion
                </span>
              </div>

              {/* Schematic Flow: Data -> AI -> GIS */}
              <div className="py-3 grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-white border border-[#E7E2DA] text-center flex flex-col items-center justify-center shadow-xs">
                  <Wind className="w-5 h-5 text-[#7C3AED] mb-1.5" />
                  <span className="text-xs font-bold text-[#1C1929] block">Atmospheric</span>
                  <span className="text-[9px] text-[#767092] mt-0.5">Wind & Barometric Vector Fields</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#E7E2DA] text-center flex flex-col items-center justify-center shadow-xs">
                  <Waves className="w-5 h-5 text-[#0284C7] mb-1.5" />
                  <span className="text-xs font-bold text-[#1C1929] block">Hydrodynamic</span>
                  <span className="text-[9px] text-[#767092] mt-0.5">Surge & River Runoff Physics</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#E7E2DA] text-center flex flex-col items-center justify-center shadow-xs">
                  <Layers className="w-5 h-5 text-[#059669] mb-1.5" />
                  <span className="text-xs font-bold text-[#1C1929] block">Topographic</span>
                  <span className="text-[9px] text-[#767092] mt-0.5">High-Res DEM Inundation Meshing</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#E7E2DA] text-[#5D5775]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#059669]" />
                  Composite Risk Index (CDRI) Scoring Active
                </span>
                <Link href="/authority/map" className="text-[#7C3AED] font-semibold hover:underline flex items-center gap-1">
                  <span>Explore GIS Map</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* ── CARD 2: CASCADING FAILURE GRAPH SIMULATION ── */}
          <div className="rounded-[24px] bg-white border border-[#E7E2DA] p-5 flex flex-col justify-between backdrop-blur-2xl hover:border-[#7C3AED]/40 transition-all shadow-[0_12px_36px_rgba(124,58,237,0.06)]">
            <div>
              <div className="w-8 h-8 rounded-xl bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center mb-3">
                <Workflow className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#1C1929]">Cascading Failure Graph</h3>
              <p className="text-xs text-[#5D5775] mt-0.5">
                Directed dependency modeling that exposes multi-tier infrastructure collapse before service interruption occurs.
              </p>
            </div>

            {/* Architecture Node Chain */}
            <div className="p-3 rounded-xl bg-[#F8F7F4] border border-[#E7E2DA] space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-purple-50 text-[#7C3AED] border border-purple-200">Primary Hazard</span>
                <span className="text-[#767092]">→</span>
                <span className="px-2 py-0.5 rounded bg-orange-50 text-[#EA580C] border border-orange-200">Power Grids</span>
                <span className="text-[#767092]">→</span>
                <span className="px-2 py-0.5 rounded bg-red-50 text-[#DC2626] border border-red-200">Hospital ICUs</span>
              </div>
              <div className="text-[10px] text-[#059669] font-semibold flex items-center justify-between pt-1 border-t border-[#E7E2DA]">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Pre-emptive Isolation Protocols
                </span>
                <Link href="/authority/cascade" className="text-[#7C3AED] hover:underline font-bold">
                  Simulate
                </Link>
              </div>
            </div>
          </div>

          {/* ── CARD 3: AUTONOMOUS FLEET & RESOURCE ALLOCATION ── */}
          <div className="rounded-[24px] bg-white border border-[#E7E2DA] p-5 flex flex-col justify-between backdrop-blur-2xl hover:border-[#059669]/40 transition-all shadow-[0_12px_36px_rgba(124,58,237,0.06)]">
            <div>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center mb-3">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#1C1929]">Autonomous Fleet Dispatch</h3>
              <p className="text-xs text-[#5D5775] mt-0.5">
                Multi-agency constraint optimization computing dynamic, flood-safe routing for rescue teams, boats, and ambulances.
              </p>
            </div>

            {/* Workflow Component */}
            <div className="p-3 rounded-xl bg-[#F8F7F4] border border-[#E7E2DA] space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-[#5D5775]">Multi-Agency Staging</span>
                <span className="text-[#059669] font-semibold">Dynamic Routing</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#1C1929] bg-white border border-[#E7E2DA] p-1.5 rounded-lg shadow-xs">
                <span>NDRF • SDRF • Fire Ops</span>
                <span className="text-[#7C3AED] font-mono font-bold">Auto-Triage</span>
              </div>
            </div>
          </div>

          {/* ── CARD 4: CITIZEN LIFELINE & EMERGENCY BEACON ── */}
          <div className="rounded-[24px] bg-white border border-[#E7E2DA] p-5 flex flex-col justify-between backdrop-blur-2xl hover:border-red-300 transition-all shadow-[0_12px_36px_rgba(124,58,237,0.06)]">
            <div>
              <div className="w-8 h-8 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center mb-3">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#1C1929]">Citizen Lifeline & Safe Routes</h3>
              <p className="text-xs text-[#5D5775] mt-0.5">
                Offline-resilient public portal providing 1-tap distress beacons and terrain-aware evacuation routing to fortified shelters.
              </p>
            </div>

            {/* Workflow Component */}
            <div className="p-3 rounded-xl bg-[#F8F7F4] border border-[#E7E2DA] space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold text-[#1C1929]">1-Tap Emergency Beacon</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-[#DC2626] border border-red-200">
                  Offline Capable
                </span>
              </div>
              <p className="text-[10px] text-[#5D5775]">
                Instant GPS coordinates beamed to Command Center triage queue
              </p>
            </div>
          </div>

          {/* ── CARD 5: RELIEF CAMPS & CRITICAL INFRASTRUCTURE ── */}
          <div className="rounded-[24px] bg-white border border-[#E7E2DA] p-5 flex flex-col justify-between backdrop-blur-2xl hover:border-[#7C3AED]/40 transition-all shadow-[0_12px_36px_rgba(124,58,237,0.06)]">
            <div>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center mb-3">
                <Home className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#1C1929]">Shelters & Medical Capacity</h3>
              <p className="text-xs text-[#5D5775] mt-0.5">
                Centralized monitoring of emergency relief shelters, medical ICU beds, rations, and emergency generator reserves.
              </p>
            </div>

            {/* Workflow Component */}
            <div className="p-3 rounded-xl bg-[#F8F7F4] border border-[#E7E2DA] space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-[#5D5775]">Supply Chain Balancing</span>
                <span className="text-[#059669] font-semibold">Proactive Reroute</span>
              </div>
              <p className="text-[10px] text-[#1C1929] font-medium">
                Prevents camp overcrowding and medical trauma saturation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. THE ASPIRE PARADIGM SHIFT (6-Stage Lifecycle)
         ───────────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-16 py-16 bg-white border-y border-[#E7E2DA] relative">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#7C3AED] font-bold">
              SYSTEM METHODOLOGY
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1929]">
              Replacing Reactive Chaos with Predictive Orchestration
            </h2>
            <p className="text-xs sm:text-sm text-[#5D5775] max-w-xl mx-auto">
              How ASPIRE transforms conventional emergency protocols into an end-to-end intelligent decision loop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional Crisis Paradigm */}
            <div className="p-6 rounded-2xl bg-[#F8F7F4] border border-[#E7E2DA] space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
                Traditional Crisis Response (Reactive)
              </div>
              <div className="space-y-3 text-xs text-[#5D5775]">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-white text-[#767092] border border-[#E7E2DA] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">1</div>
                  <p><strong className="text-[#1C1929]">Passive Observation:</strong> Sensors detect floodwaters or cyclonic gales after breach has initiated.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-white text-[#767092] border border-[#E7E2DA] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">2</div>
                  <p><strong className="text-[#1C1929]">Delayed Broadcasts:</strong> Generic SMS alerts sent to widespread populations without elevation-specific guidance.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-white text-[#767092] border border-[#E7E2DA] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">3</div>
                  <p><strong className="text-[#1C1929]">Manual Cognitive Overload:</strong> Incident commanders manually triage hundreds of disjointed department spreadsheets.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-white text-[#767092] border border-[#E7E2DA] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">4</div>
                  <p><strong className="text-[#1C1929]">Fragmented Reaction:</strong> Rescue assets deployed after roads are already washed out, causing severe delays.</p>
                </div>
              </div>
            </div>

            {/* The ASPIRE Intelligent Loop */}
            <div className="p-6 rounded-2xl bg-[#FBF9F5] border-2 border-[#7C3AED]/40 space-y-4 shadow-[0_10px_35px_rgba(124,58,237,0.08)]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
                The ASPIRE Intelligent Loop (Proactive)
              </div>
              <div className="space-y-3 text-xs text-[#5D5775]">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5 font-bold">1</div>
                  <p><strong className="text-[#1C1929]">Predict (Physics-AI):</strong> Models compute precise coastal inundation and wind impact hours before landfall.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5 font-bold">2</div>
                  <p><strong className="text-[#1C1929]">Simulate (What-If):</strong> Cascading dependency graph models compound failures across electrical grids and hospitals.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5 font-bold">3</div>
                  <p><strong className="text-[#1C1929]">Recommend (XAI):</strong> Explainable AI proposes optimal pre-emptive evacuation orders and resource pre-positioning.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5 font-bold">4</div>
                  <p><strong className="text-[#1C1929]">Orchestrate (GIS/IoT):</strong> Autonomous dynamic fleet routing and two-way citizen beacon triage coordinate rescue live.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. DUAL-PORTAL ECOSYSTEM
         ───────────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-16 py-20 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[#7C3AED] font-bold">
            ACCESS THE PLATFORM
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1929]">
            Two Portals, One Unified Disaster Intelligence Network
          </h2>
          <p className="text-xs sm:text-sm text-[#5D5775] max-w-xl mx-auto">
            Choose your operational interface to begin interacting with the live backend services and spatial models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Authority Portal Box */}
          <div className="p-8 rounded-[24px] bg-white border border-[#E7E2DA] hover:border-[#7C3AED]/50 transition-all flex flex-col justify-between group shadow-[0_12px_32px_rgba(124,58,237,0.06)]">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7C3AED] border border-purple-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1C1929]">
                Authority Command Center
              </h3>
              <p className="text-xs text-[#5D5775] leading-relaxed">
                Designed for State Emergency Operation Centers, District Collectors, and Incident Commanders. Features 3D spatial GIS layers, automated casualty mitigation, cascading infrastructure simulation, and multi-agency fleet tracking.
              </p>
              <ul className="text-xs text-[#1C1929] space-y-1.5 pt-2 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                  Real-Time Multi-Hazard Spatial GIS
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                  Cascading Failure Dependency Graph
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7C3AED]" />
                  Autonomous NDRF / SDRF Fleet Staging
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/authority/dashboard"
                className="w-full py-3.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(124,58,237,0.35)] transition-all cursor-pointer"
              >
                <span>Launch Authority HQ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Citizen Lifeline Box */}
          <div className="p-8 rounded-[24px] bg-white border border-[#E7E2DA] hover:border-red-300 transition-all flex flex-col justify-between group shadow-[0_12px_32px_rgba(220,38,38,0.05)]">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#DC2626] border border-red-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1C1929]">
                Citizen Emergency Lifeline
              </h3>
              <p className="text-xs text-[#5D5775] leading-relaxed">
                Designed for frontline civilians and vulnerable communities. Simple, visual, and offline-capable. Provides 1-tap emergency SOS beaconing, real-time localized warnings, and turn-by-turn safe navigation to fortified cyclone shelters.
              </p>
              <ul className="text-xs text-[#1C1929] space-y-1.5 pt-2 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#DC2626]" />
                  1-Tap Instant GPS Emergency Beacon
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#DC2626]" />
                  Flood-Free Safe Evacuation Routing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#DC2626]" />
                  Live Shelter Capacity & Medical Access
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/citizen"
                className="w-full py-3.5 rounded-xl bg-[#F8F7F4] hover:bg-[#F3E8FF] text-[#1C1929] hover:text-[#7C3AED] border border-[#E7E2DA] font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer group"
              >
                <LifeBuoy className="w-4 h-4 text-[#DC2626] group-hover:rotate-45 transition-transform" />
                <span>Open Citizen Lifeline</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. FOOTER
         ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E7E2DA] bg-[#F8F7F4] py-8 px-6 lg:px-16 flex flex-col sm:flex-row items-center justify-between text-xs text-[#767092] gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#7C3AED] flex items-center justify-center text-white">
            <Shield className="w-3.5 h-3.5 fill-white text-[#7C3AED]" />
          </div>
          <span>© 2026 ASPIRE — Autonomous System for Predictive Intelligence & Response Execution</span>
        </div>

        <div className="flex gap-6 text-[#5D5775]">
          <Link href="/authority/dashboard" className="hover:text-[#7C3AED] transition-colors">
            Command Center
          </Link>
          <Link href="/authority/map" className="hover:text-[#7C3AED] transition-colors">
            3D GIS Map
          </Link>
          <Link href="/citizen" className="hover:text-[#7C3AED] transition-colors">
            Citizen Lifeline
          </Link>
          <Link href="/authority/cascade" className="hover:text-[#7C3AED] transition-colors">
            Cascade Engine
          </Link>
        </div>
      </footer>
    </div>
  );
}
