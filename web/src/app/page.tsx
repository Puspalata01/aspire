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
    <div className="min-h-screen bg-[#05070D] text-[#F5F7FB] flex flex-col font-sans selection:bg-[#3B6CFF] selection:text-white relative overflow-x-hidden">
      {/* Ambient Atmospheric Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#3B6CFF]/15 via-[#1D4ED8]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[35%] -left-[10%] w-[550px] h-[550px] bg-[#3B6CFF]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[60%] -right-[10%] w-[650px] h-[650px] bg-[#2FD07F]/5 rounded-full blur-3xl pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────────
          1. NAVIGATION HEADER
         ───────────────────────────────────────────────────────────── */}
      <header className="border-b border-white/10 bg-[#060A13]/80 backdrop-blur-xl sticky top-0 z-50 px-6 lg:px-16 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#3B6CFF] text-white flex items-center justify-center shadow-[0_0_20px_rgba(59,108,255,0.45)]">
            <Shield className="w-5 h-5 fill-white text-[#3B6CFF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-[#F5F7FB]">
                {APP_CONFIG.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#3B6CFF]/20 text-[#4FB3FF] border border-[#3B6CFF]/40">
                DISASTER INTELLIGENCE OS
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/authority/dashboard"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#3B6CFF] hover:bg-[#2F5DD8] text-white shadow-[0_0_15px_rgba(59,108,255,0.35)] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Authority HQ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/citizen"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-[#F5F7FB] border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-[#FF4D5E]" />
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
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#101624]/80 border border-white/10 text-xs text-[#9AA3B8] backdrop-blur-xl shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#2FD07F] animate-pulse" />
            <span className="font-mono font-semibold text-[#F5F7FB]">PLATFORM ARCHITECTURE:</span>
            <span className="text-[#4FB3FF] font-medium">Predictive Intelligence & Autonomous Response Execution</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F5F7FB] leading-[1.1]">
            From Early Warning <br />
            <span className="bg-gradient-to-r from-[#4FB3FF] via-[#3B6CFF] to-[#8B5CF6] bg-clip-text text-transparent">
              To Tactical Action.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#8E99AF] max-w-2xl mx-auto leading-relaxed">
            ASPIRE bridges the critical gap between meteorological early warnings and on-the-ground crisis execution. Fusing multi-hazard spatial prediction, cascading infrastructure failure graph simulation, and autonomous relief fleet orchestration into a unified operational digital twin.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/authority/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#3B6CFF] hover:bg-[#2F5DD8] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(59,108,255,0.45)] hover:scale-[1.02] transition-all cursor-pointer"
            >
              <span>Launch Authority Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/citizen"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#101624]/90 hover:bg-[#161D2E] text-[#F5F7FB] border border-[#FF4D5E]/40 font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-all cursor-pointer group"
            >
              <LifeBuoy className="w-4 h-4 text-[#FF4D5E] group-hover:rotate-45 transition-transform" />
              <span>Open Citizen Emergency Lifeline</span>
            </Link>
          </div>

          {/* Architectural Capabilities Strip */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-[#8E99AF]">
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-[#3B6CFF]" />
              Multi-Hazard Digital Twin
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1.5">
              <Workflow className="w-3.5 h-3.5 text-[#8B5CF6]" />
              Cascading Failure Graphs
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#2FD07F]" />
              Autonomous Resource Allocation
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#FF4D5E]" />
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
          <span className="text-xs font-mono uppercase tracking-widest text-[#4FB3FF] mb-2">
            CORE PLATFORM CAPABILITIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F7FB]">
            Engineered for Zero-Latency Crisis Decisions
          </h2>
          <p className="text-sm text-[#8E99AF] max-w-xl mt-2">
            Discover the five integrated analytical engines powering proactive disaster intelligence from prediction to recovery.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 auto-rows-[280px]">
          {/* ── CARD 1 (HERO CARD - Spans 2 cols, 2 rows): Spatial Prediction & 3D GIS ── */}
          <div className="md:col-span-2 lg:col-span-2 md:row-span-2 rounded-[24px] bg-[#0E1524]/80 border border-white/10 p-6 flex flex-col justify-between backdrop-blur-2xl relative overflow-hidden group hover:border-[#3B6CFF]/40 transition-all shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#3B6CFF]/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase bg-[#3B6CFF]/20 text-[#4FB3FF] border border-[#3B6CFF]/40 flex items-center gap-1.5">
                  <Globe2 className="w-3 h-3" />
                  Primary Analytical Engine
                </span>
                <span className="text-xs text-[#8E99AF] font-mono">Spatial Digital Twin</span>
              </div>
              <h3 className="text-xl font-bold text-[#F5F7FB]">
                3D Multi-Hazard Spatial Modeling
              </h3>
              <p className="text-xs text-[#8E99AF] mt-1 max-w-md">
                Continuous ingestion of satellite synthetic-aperture radar, Doppler radar telemetry, river discharge gauges, and coastal elevation models to simulate hydrodynamic inundation and structural exposure.
              </p>
            </div>

            {/* Architecture Pipeline Diagram */}
            <div className="mt-4 p-4 rounded-2xl bg-[#080D19]/90 border border-white/5 relative overflow-hidden flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-[#3B6CFF]" />
                  <span className="font-mono font-semibold text-[#F5F7FB]">Multimodal Telemetry Pipeline</span>
                </div>
                <span className="font-mono text-[10px] text-[#4FB3FF] bg-[#3B6CFF]/15 px-2 py-0.5 rounded">
                  Spatial GIS Ingestion
                </span>
              </div>

              {/* Schematic Flow: Data -> AI -> GIS */}
              <div className="py-3 grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-[#101624]/80 border border-white/5 text-center flex flex-col items-center justify-center">
                  <Wind className="w-5 h-5 text-[#4FB3FF] mb-1.5" />
                  <span className="text-xs font-bold text-[#F5F7FB] block">Atmospheric</span>
                  <span className="text-[9px] text-[#8E99AF] mt-0.5">Wind & Barometric Vector Fields</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#101624]/80 border border-white/5 text-center flex flex-col items-center justify-center">
                  <Waves className="w-5 h-5 text-[#3B6CFF] mb-1.5" />
                  <span className="text-xs font-bold text-[#F5F7FB] block">Hydrodynamic</span>
                  <span className="text-[9px] text-[#8E99AF] mt-0.5">Surge & River Runoff Physics</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#101624]/80 border border-white/5 text-center flex flex-col items-center justify-center">
                  <Layers className="w-5 h-5 text-[#2FD07F] mb-1.5" />
                  <span className="text-xs font-bold text-[#F5F7FB] block">Topographic</span>
                  <span className="text-[9px] text-[#8E99AF] mt-0.5">High-Res DEM Inundation Meshing</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5 text-[#8E99AF]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#2FD07F]" />
                  Composite Risk Index (CDRI) Scoring Active
                </span>
                <Link href="/authority/map" className="text-[#4FB3FF] font-semibold hover:underline flex items-center gap-1">
                  <span>Explore GIS Map</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* ── CARD 2: CASCADING FAILURE GRAPH SIMULATION ── */}
          <div className="rounded-[24px] bg-[#0E1524]/80 border border-white/10 p-5 flex flex-col justify-between backdrop-blur-2xl hover:border-[#8B5CF6]/40 transition-all shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
            <div>
              <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center mb-3">
                <Workflow className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#F5F7FB]">Cascading Failure Graph</h3>
              <p className="text-xs text-[#8E99AF] mt-0.5">
                Directed dependency modeling that exposes multi-tier infrastructure collapse before service interruption occurs.
              </p>
            </div>

            {/* Architecture Node Chain */}
            <div className="p-3 rounded-xl bg-[#080D19]/80 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-[#3B6CFF]/20 text-[#4FB3FF]">Primary Hazard</span>
                <span className="text-[#8E99AF]">→</span>
                <span className="px-2 py-0.5 rounded bg-[#FF8A3D]/20 text-[#FF8A3D]">Power Grids</span>
                <span className="text-[#8E99AF]">→</span>
                <span className="px-2 py-0.5 rounded bg-[#8B5CF6]/20 text-[#8B5CF6]">Hospital ICUs</span>
              </div>
              <div className="text-[10px] text-[#2FD07F] font-semibold flex items-center justify-between pt-1 border-t border-white/5">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Pre-emptive Isolation Protocols
                </span>
                <Link href="/authority/cascade" className="text-[#4FB3FF] hover:underline">
                  Simulate
                </Link>
              </div>
            </div>
          </div>

          {/* ── CARD 3: AUTONOMOUS FLEET & RESOURCE ALLOCATION ── */}
          <div className="rounded-[24px] bg-[#0E1524]/80 border border-white/10 p-5 flex flex-col justify-between backdrop-blur-2xl hover:border-[#2FD07F]/40 transition-all shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
            <div>
              <div className="w-8 h-8 rounded-xl bg-[#2FD07F]/20 text-[#2FD07F] flex items-center justify-center mb-3">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#F5F7FB]">Autonomous Fleet Dispatch</h3>
              <p className="text-xs text-[#8E99AF] mt-0.5">
                Multi-agency constraint optimization computing dynamic, flood-safe routing for rescue teams, boats, and ambulances.
              </p>
            </div>

            {/* Workflow Component */}
            <div className="p-3 rounded-xl bg-[#080D19]/80 border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-[#8E99AF]">Multi-Agency Staging</span>
                <span className="text-[#2FD07F] font-semibold">Dynamic Routing</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#CBD5E1] bg-white/5 p-1.5 rounded-lg">
                <span>NDRF • SDRF • Fire Ops</span>
                <span className="text-[#4FB3FF] font-mono">Auto-Triage</span>
              </div>
            </div>
          </div>

          {/* ── CARD 4: CITIZEN LIFELINE & EMERGENCY BEACON ── */}
          <div className="rounded-[24px] bg-[#0E1524]/80 border border-white/10 p-5 flex flex-col justify-between backdrop-blur-2xl hover:border-[#FF4D5E]/40 transition-all shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
            <div>
              <div className="w-8 h-8 rounded-xl bg-[#FF4D5E]/20 text-[#FF4D5E] flex items-center justify-center mb-3">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#F5F7FB]">Citizen Lifeline & Safe Routes</h3>
              <p className="text-xs text-[#8E99AF] mt-0.5">
                Offline-resilient public portal providing 1-tap distress beacons and terrain-aware evacuation routing to fortified shelters.
              </p>
            </div>

            {/* Workflow Component */}
            <div className="p-3 rounded-xl bg-[#080D19]/80 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold text-[#F5F7FB]">1-Tap Emergency Beacon</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FF4D5E]/20 text-[#FF4D5E]">
                  Offline Capable
                </span>
              </div>
              <p className="text-[10px] text-[#8E99AF]">
                Instant GPS coordinates beamed to Command Center triage queue
              </p>
            </div>
          </div>

          {/* ── CARD 5: RELIEF CAMPS & CRITICAL INFRASTRUCTURE ── */}
          <div className="rounded-[24px] bg-[#0E1524]/80 border border-white/10 p-5 flex flex-col justify-between backdrop-blur-2xl hover:border-[#3B6CFF]/40 transition-all shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
            <div>
              <div className="w-8 h-8 rounded-xl bg-[#3B6CFF]/20 text-[#4FB3FF] flex items-center justify-center mb-3">
                <Home className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#F5F7FB]">Shelters & Medical Capacity</h3>
              <p className="text-xs text-[#8E99AF] mt-0.5">
                Centralized monitoring of emergency relief shelters, medical ICU beds, rations, and emergency generator reserves.
              </p>
            </div>

            {/* Workflow Component */}
            <div className="p-3 rounded-xl bg-[#080D19]/80 border border-white/5 space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-[#8E99AF]">Supply Chain Balancing</span>
                <span className="text-[#2FD07F] font-semibold">Proactive Reroute</span>
              </div>
              <p className="text-[10px] text-[#CBD5E1]">
                Prevents camp overcrowding and medical trauma saturation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. THE ASPIRE PARADIGM SHIFT (6-Stage Lifecycle)
         ───────────────────────────────────────────────────────────── */}
      <section className="px-6 lg:px-16 py-16 bg-[#080D19]/60 border-y border-white/10 relative">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#4FB3FF]">
              SYSTEM METHODOLOGY
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F7FB]">
              Replacing Reactive Chaos with Predictive Orchestration
            </h2>
            <p className="text-xs sm:text-sm text-[#8E99AF] max-w-xl mx-auto">
              How ASPIRE transforms conventional emergency protocols into an end-to-end intelligent decision loop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional Crisis Paradigm */}
            <div className="p-6 rounded-2xl bg-[#0E1524]/50 border border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FF8A3D] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#FF8A3D]" />
                Traditional Crisis Response (Reactive)
              </div>
              <div className="space-y-3 text-xs text-[#8E99AF]">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-white/5 text-[#CBD5E1] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">1</div>
                  <p><strong className="text-[#F5F7FB]">Passive Observation:</strong> Sensors detect floodwaters or cyclonic gales after breach has initiated.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-white/5 text-[#CBD5E1] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">2</div>
                  <p><strong className="text-[#F5F7FB]">Delayed Broadcasts:</strong> Generic SMS alerts sent to widespread populations without elevation-specific guidance.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-white/5 text-[#CBD5E1] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">3</div>
                  <p><strong className="text-[#F5F7FB]">Manual Cognitive Overload:</strong> Incident commanders manually triage hundreds of disjointed department spreadsheets.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-white/5 text-[#CBD5E1] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">4</div>
                  <p><strong className="text-[#F5F7FB]">Fragmented Reaction:</strong> Rescue assets deployed after roads are already washed out, causing severe delays.</p>
                </div>
              </div>
            </div>

            {/* The ASPIRE Intelligent Loop */}
            <div className="p-6 rounded-2xl bg-[#0E1524]/90 border border-[#3B6CFF]/40 space-y-4 shadow-[0_0_30px_rgba(59,108,255,0.15)]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4FB3FF] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#3B6CFF] animate-pulse" />
                The ASPIRE Intelligent Loop (Proactive)
              </div>
              <div className="space-y-3 text-xs text-[#8E99AF]">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#3B6CFF]/20 text-[#4FB3FF] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">1</div>
                  <p><strong className="text-[#F5F7FB]">Predict (Physics-AI):</strong> Models compute precise coastal inundation and wind impact hours before landfall.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#3B6CFF]/20 text-[#4FB3FF] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">2</div>
                  <p><strong className="text-[#F5F7FB]">Simulate (What-If):</strong> Cascading dependency graph models compound failures across electrical grids and hospitals.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#3B6CFF]/20 text-[#4FB3FF] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">3</div>
                  <p><strong className="text-[#F5F7FB]">Recommend (XAI):</strong> Explainable AI proposes optimal pre-emptive evacuation orders and resource pre-positioning.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#3B6CFF]/20 text-[#4FB3FF] flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">4</div>
                  <p><strong className="text-[#F5F7FB]">Orchestrate (GIS/IoT):</strong> Autonomous dynamic fleet routing and two-way citizen beacon triage coordinate rescue live.</p>
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
          <span className="text-xs font-mono uppercase tracking-widest text-[#4FB3FF]">
            ACCESS THE PLATFORM
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F7FB]">
            Two Portals, One Unified Disaster Intelligence Network
          </h2>
          <p className="text-xs sm:text-sm text-[#8E99AF] max-w-xl mx-auto">
            Choose your operational interface to begin interacting with the live backend services and spatial models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Authority Portal Box */}
          <div className="p-8 rounded-[24px] bg-[#0E1524]/90 border border-white/10 hover:border-[#3B6CFF]/50 transition-all flex flex-col justify-between group shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#3B6CFF]/20 text-[#4FB3FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#F5F7FB]">
                Authority Command Center
              </h3>
              <p className="text-xs text-[#8E99AF] leading-relaxed">
                Designed for State Emergency Operation Centers, District Collectors, and Incident Commanders. Features 3D spatial GIS layers, automated casualty mitigation, cascading infrastructure simulation, and multi-agency fleet tracking.
              </p>
              <ul className="text-xs text-[#CBD5E1] space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3B6CFF]" />
                  Real-Time Multi-Hazard Spatial GIS
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3B6CFF]" />
                  Cascading Failure Dependency Graph
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3B6CFF]" />
                  Autonomous NDRF / SDRF Fleet Staging
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/authority/dashboard"
                className="w-full py-3.5 rounded-xl bg-[#3B6CFF] hover:bg-[#2F5DD8] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,108,255,0.4)] transition-all cursor-pointer"
              >
                <span>Launch Authority HQ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Citizen Lifeline Box */}
          <div className="p-8 rounded-[24px] bg-[#0E1524]/90 border border-white/10 hover:border-[#FF4D5E]/50 transition-all flex flex-col justify-between group shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FF4D5E]/20 text-[#FF4D5E] flex items-center justify-center group-hover:scale-110 transition-transform">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#F5F7FB]">
                Citizen Emergency Lifeline
              </h3>
              <p className="text-xs text-[#8E99AF] leading-relaxed">
                Designed for frontline civilians and vulnerable communities. Simple, visual, and offline-capable. Provides 1-tap emergency SOS beaconing, real-time localized warnings, and turn-by-turn safe navigation to fortified cyclone shelters.
              </p>
              <ul className="text-xs text-[#CBD5E1] space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4D5E]" />
                  1-Tap Instant GPS Emergency Beacon
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4D5E]" />
                  Flood-Free Safe Evacuation Routing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4D5E]" />
                  Live Shelter Capacity & Medical Access
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/citizen"
                className="w-full py-3.5 rounded-xl bg-[#161D2E] hover:bg-[#1C263B] text-[#F5F7FB] border border-[#FF4D5E]/40 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer group"
              >
                <LifeBuoy className="w-4 h-4 text-[#FF4D5E] group-hover:rotate-45 transition-transform" />
                <span>Open Citizen Lifeline</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. FOOTER
         ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-[#060A13] py-8 px-6 lg:px-16 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7488] gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#3B6CFF] flex items-center justify-center text-white">
            <Shield className="w-3.5 h-3.5 fill-white text-[#3B6CFF]" />
          </div>
          <span>© 2026 ASPIRE — Autonomous System for Predictive Intelligence & Response Execution</span>
        </div>

        <div className="flex gap-6 text-[#8E99AF]">
          <Link href="/authority/dashboard" className="hover:text-white transition-colors">
            Command Center
          </Link>
          <Link href="/authority/map" className="hover:text-white transition-colors">
            3D GIS Map
          </Link>
          <Link href="/citizen" className="hover:text-white transition-colors">
            Citizen Lifeline
          </Link>
          <Link href="/authority/cascade" className="hover:text-white transition-colors">
            Cascade Engine
          </Link>
        </div>
      </footer>
    </div>
  );
}
