"use client";

import React, { useState } from "react";
import { AuthorityHeader } from "@/components/layout/AuthorityHeader";
import {
  Settings,
  Shield,
  Bell,
  Key,
  Radio,
  Wifi,
  Volume2,
  Check,
  CheckCircle2,
  Layers,
  Database,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

export default function AuthoritySettingsPage() {
  const [sirenThreshold, setSirenThreshold] = useState(88);
  const [autoSiren, setAutoSiren] = useState(true);
  const [satelliteSync, setSatelliteSync] = useState(true);
  const [telemetryFallback, setTelemetryFallback] = useState(true);

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] text-[#1C1929] flex flex-col select-none">
      {/* Top Standard Authority Header */}
      <AuthorityHeader pageTitle="Platform Configuration & Settings" />

      {/* Main Workspace Area */}
      <div className="flex-1 p-4 lg:p-6 flex flex-col gap-4 max-w-[1600px] w-full mx-auto">
        {/* ─────────────────────────────────────────────────────────────
            1. TITLE & TOP 4 VISUAL KPI CARDS ROW (Universal Visual Comprehension)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Left: Title & Subtitle */}
          <div className="lg:col-span-4 flex flex-col justify-center gap-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#7C3AED] animate-pulse" />
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-[#1C1929]">
                System Configuration
              </h2>
            </div>
            <p className="text-xs text-[#5D5775] leading-snug">
              IMD Doppler radar feeds, Common Alerting Protocol (CAP) sirens, LoRaWAN mesh failover, and autonomous AI thresholds.
            </p>
          </div>

          {/* Right: 4 Visual KPI Cards */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: API Feeds Online */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Sensor Feeds</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">4/4</span>
                  <span className="text-[10px] font-mono text-[#16A34A] font-semibold">Connected</span>
                </div>
                <span className="text-[9px] text-[#767092]">IMD, CWC, ISRO, GIS</span>
              </div>
            </div>

            {/* KPI 2: Siren Sound Level */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED] shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Siren Acoustic</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">{sirenThreshold}</span>
                  <span className="text-[10px] font-mono text-[#7C3AED] font-semibold">dB / 100</span>
                </div>
                <span className="text-[9px] text-[#767092]">Auto-trigger level</span>
              </div>
            </div>

            {/* KPI 3: LoRaWAN Telemetry */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#7C3AED] shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">LoRaWAN Mesh</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#16A34A]">Active</span>
                  <span className="text-[10px] font-mono text-[#16A34A] font-semibold">868 MHz</span>
                </div>
                <span className="text-[9px] text-[#767092]">Fallback online</span>
              </div>
            </div>

            {/* KPI 4: Uptime SLA */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">System SLA</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">99.98%</span>
                  <span className="text-[10px] font-mono text-[#16A34A] font-semibold">Zero Lag</span>
                </div>
                <span className="text-[9px] text-[#767092]">High availability</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. MAIN BENTO GRID (API Endpoints + CAP Controls + Policies)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: API Endpoints & Feeds (col-span-6) */}
          <div className="lg:col-span-6 p-5 rounded-[18px] bg-white/95 border border-[#E7E2DA] backdrop-blur-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA]">
              <h3 className="text-sm font-bold text-[#1C1929] flex items-center gap-2">
                <Key className="w-4 h-4 text-[#7C3AED]" />
                <span>Sensor & Satellite GIS Feeds</span>
              </h3>
              <span className="text-xs font-mono text-[#16A34A] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                Active Feeds: 4/4
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#5D5775] font-semibold block mb-1">
                  India Meteorological Department (IMD) API Endpoint
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="https://api.imd.gov.in/radar/paradip-doppler/v2"
                    className="w-full bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl px-3.5 py-2 font-mono text-xs text-[#1C1929] focus:outline-none"
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] shrink-0" title="Connected" />
                </div>
              </div>

              <div>
                <label className="text-[#5D5775] font-semibold block mb-1">
                  Central Water Commission (CWC) Hydrological Inflow Feed
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="https://cwc.gov.in/telemetry/basin/mahanadi-daya/live"
                    className="w-full bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl px-3.5 py-2 font-mono text-xs text-[#1C1929] focus:outline-none"
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] shrink-0" title="Connected" />
                </div>
              </div>

              <div>
                <label className="text-[#5D5775] font-semibold block mb-1">
                  ISRO Bhuvan Disaster Services Gateway
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="https://bhuvan-app1.nrsc.gov.in/disaster/sar-inundation"
                    className="w-full bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl px-3.5 py-2 font-mono text-xs text-[#1C1929] focus:outline-none"
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] shrink-0" title="Connected" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: CAP Auto-Trigger & Policies (col-span-6) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* CAP Auto-Trigger Threshold */}
            <div className="p-5 rounded-[18px] bg-white/95 border border-[#E7E2DA] backdrop-blur-xl shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E2DA]">
                <h3 className="text-sm font-bold text-[#1C1929] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#7C3AED]" />
                  <span>Common Alerting Protocol (CAP) Auto-Trigger</span>
                </h3>
                <span className="text-xs font-mono font-bold text-rose-600 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200">
                  {sirenThreshold}.0 / 100
                </span>
              </div>

              <p className="text-xs text-[#5D5775] leading-relaxed">
                Automatically dispatch emergency cell broadcast sirens when AI Composite Risk Score exceeds threshold:
              </p>

              <div className="space-y-1.5 pt-1">
                <input
                  type="range"
                  min="70"
                  max="98"
                  value={sirenThreshold}
                  onChange={(e) => setSirenThreshold(Number(e.target.value))}
                  className="w-full accent-[#7C3AED] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#767092]">
                  <span>70 (Sensitive)</span>
                  <span className="text-[#7C3AED] font-bold">{sirenThreshold} (Current)</span>
                  <span>98 (Extreme Only)</span>
                </div>
              </div>
            </div>

            {/* Protocol Automation Policies */}
            <div className="p-5 rounded-[18px] bg-white/95 border border-[#E7E2DA] backdrop-blur-xl shadow-sm space-y-3">
              <div className="pb-2 border-b border-[#E7E2DA]">
                <h3 className="text-sm font-bold text-[#1C1929] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#7C3AED]" />
                  <span>Protocol Automation Policies</span>
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Toggle 1 */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA]">
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-[#7C3AED]" />
                    <div>
                      <p className="font-semibold text-[#1C1929]">Multi-Channel Audio Siren Broadcast</p>
                      <p className="text-[10px] text-[#767092]">Auto-trigger tower megaphones upon high breach</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoSiren(!autoSiren)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      autoSiren ? "bg-[#7C3AED]" : "bg-neutral-300"
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      autoSiren ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>

                {/* Toggle 2 */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA]">
                  <div className="flex items-center gap-2.5">
                    <Wifi className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-[#1C1929]">Live Radar & Satellite Cloud Sync</p>
                      <p className="text-[10px] text-[#767092]">Continuous 5-minute Doppler precipitation delta pull</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSatelliteSync(!satelliteSync)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      satelliteSync ? "bg-[#7C3AED]" : "bg-neutral-300"
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      satelliteSync ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>

                {/* Toggle 3 */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA]">
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-4 h-4 text-[#7C3AED]" />
                    <div>
                      <p className="font-semibold text-[#1C1929]">LoRaWAN Mesh Telemetry Fallback</p>
                      <p className="text-[10px] text-[#767092]">Switch transmission if cellular backhaul fails</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTelemetryFallback(!telemetryFallback)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      telemetryFallback ? "bg-[#7C3AED]" : "bg-neutral-300"
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      telemetryFallback ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => toast.success("Platform configuration updated successfully!")}
                  className="px-6 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-xs font-bold text-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Configuration</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
