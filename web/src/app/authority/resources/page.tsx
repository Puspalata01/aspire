"use client";

import React from "react";
import { AuthorityHeader } from "@/components/layout/AuthorityHeader";
import { ResourceOverview } from "@/components/resources/ResourceOverview";
import {
  Truck,
  LifeBuoy,
  Radio,
  Fuel,
  Plus,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export default function AuthorityResourcesPage() {
  return (
    <div className="w-full min-h-screen bg-[#05070D] text-[#F5F7FB] flex flex-col select-none">
      {/* Top Standard Authority Header */}
      <AuthorityHeader pageTitle="Tactical Fleet & Logistics Management" />

      {/* Main Workspace Area */}
      <div className="flex-1 p-4 lg:p-6 flex flex-col gap-4 max-w-[1600px] w-full mx-auto">
        {/* ─────────────────────────────────────────────────────────────
            1. TITLE & TOP 4 VISUAL KPI CARDS ROW (Universal Visual Comprehension)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Left: Title & Subtitle */}
          <div className="lg:col-span-4 flex flex-col justify-center gap-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#3B6CFF] animate-pulse" />
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-[#F5F7FB]">
                Tactical Fleet Operations
              </h2>
            </div>
            <p className="text-xs text-[#9AA3B8] leading-snug">
              Telemetry tracking for Gemini inflatable boats, IAF airlift helicopters, mobile RO water tankers, and paramedic teams.
            </p>
          </div>

          {/* Right: 4 Visual KPI Cards */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: Inflatable Rescue Boats */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#3B6CFF]/20 border border-[#3B6CFF]/40 flex items-center justify-center text-[#3B6CFF] shrink-0">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Rescue Boats</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">32</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">/ 48 Active</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">16 Staged on standby</span>
              </div>
            </div>

            {/* KPI 2: IAF Airlift Helicopters */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#2FD07F]/20 border border-[#2FD07F]/40 flex items-center justify-center text-[#2FD07F] shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Airlift Choppers</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">6</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">Mi-17 Ready</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Airdrop & winch units</span>
              </div>
            </div>

            {/* KPI 3: Mobile Water Tankers */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#4FB3FF]/20 border border-[#4FB3FF]/40 flex items-center justify-center text-[#4FB3FF] shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">RO Tankers</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">18</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">10,000L ea</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Potable water routes</span>
              </div>
            </div>

            {/* KPI 4: Fleet Readiness Index */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#F5C542]/20 border border-[#F5C542]/40 flex items-center justify-center text-[#F5C542] shrink-0">
                <Fuel className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Fleet Fuel Index</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">86%</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">Optimal</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Refueling points online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Requisition Button Row */}
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs text-[#9AA3B8]">
            Real-time GPS telemetry updated via Satellite SATCOM-4
          </span>
          <button
            type="button"
            onClick={() => toast.success("Asset mobilization request dispatched to State Emergency Operation Center.")}
            className="px-4 py-2 rounded-xl bg-[#3B6CFF] hover:bg-[#325bd4] text-xs font-bold text-white shadow-[0_0_12px_rgba(59,108,255,0.4)] flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Requisition New Tactical Assets</span>
          </button>
        </div>

        {/* Main Grid */}
        <ResourceOverview />
      </div>
    </div>
  );
}
