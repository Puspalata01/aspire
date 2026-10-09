"use client";

import React, { useEffect } from "react";
import { AuthorityHeader } from "@/components/layout/AuthorityHeader";
import { SOSTable } from "@/components/sos/SOSTable";
import { useSOSStore } from "@/stores/useSOSStore";
import { MapboxView } from "@/components/map/MapboxView";
import {
  AlertTriangle,
  Users,
  LifeBuoy,
  Clock,
  MapPin,
  Waves,
  ShieldCheck,
  Send,
  Radio,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

export default function AuthoritySOSPage() {
  const { requests, fetchSOSRequests } = useSOSStore();

  useEffect(() => {
    fetchSOSRequests();
  }, [fetchSOSRequests]);

  const criticalCount = requests.filter((r) => r.urgency === "critical").length;
  const totalTrapped = requests.reduce((acc, r) => acc + (r.peopleCount || 1), 0);


  return (
    <div className="w-full min-h-screen bg-[#05070D] text-[#F5F7FB] flex flex-col select-none">
      {/* Top Standard Authority Header */}
      <AuthorityHeader pageTitle="Emergency SOS Triage" />

      {/* Main Workspace Area */}
      <div className="flex-1 p-4 lg:p-6 flex flex-col gap-4 max-w-[1600px] w-full mx-auto">
        {/* ─────────────────────────────────────────────────────────────
            1. TITLE & TOP 4 VISUAL KPI CARDS ROW (Universal Visual Comprehension)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Left: Title & Subtitle */}
          <div className="lg:col-span-4 flex flex-col justify-center gap-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF4D5E] animate-ping" />
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-[#F5F7FB]">
                SOS Emergency Dispatch
              </h2>
            </div>
            <p className="text-xs text-[#9AA3B8] leading-snug">
              Autonomous civilian distress prioritization, reverse GPS geocoding, and tactical boat dispatch.
            </p>
          </div>

          {/* Right: 4 Visual KPI Cards */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: Critical Life Threats */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#FF4D5E]/20 border border-[#FF4D5E]/40 flex items-center justify-center text-[#FF4D5E] shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Critical Threats</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#FF4D5E]">{criticalCount}</span>
                  <span className="text-[10px] font-bold text-[#FF4D5E]">Immediate</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Acuity Level 4/4</span>
              </div>
            </div>

            {/* KPI 2: Trapped Citizens */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#3B6CFF]/20 border border-[#3B6CFF]/40 flex items-center justify-center text-[#3B6CFF] shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Trapped Citizens</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">{totalTrapped}</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">48 hrs food</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Verified headcount</span>
              </div>
            </div>

            {/* KPI 3: Units Mobilized */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#2FD07F]/20 border border-[#2FD07F]/40 flex items-center justify-center text-[#2FD07F] shrink-0">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Rescue Units</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">12</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">Deployed</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Boats & Amphibians</span>
              </div>
            </div>

            {/* KPI 4: Mean Dispatch Time */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#F5C542]/20 border border-[#F5C542]/40 flex items-center justify-center text-[#F5C542] shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Avg Response</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">8.2m</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">↓ 4.1m</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Target: &lt; 15 mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. MAIN BENTO GRID (Table Feed + DBSCAN Spatial Clusters)
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Feed: SOS Distress Queue (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <SOSTable />
          </div>

          {/* Right Column: DBSCAN Spatial Clusters & Radar Map (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Mini Radar Map Canvas */}
            <div className="rounded-[18px] bg-[#101624]/75 border border-white/10 p-3.5 backdrop-blur-xl shadow-lg flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF4D5E] animate-pulse" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FB]">
                    Cluster Radar View
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#6B7488]">ε=500m, MinPts=3</span>
              </div>

              <div className="w-full h-48 rounded-xl overflow-hidden border border-white/10 relative">
                <MapboxView height="100%" />
              </div>
            </div>

            {/* DBSCAN Hotspot Clusters Cards (Visual Acuity with depth meters) */}
            <div className="rounded-[18px] bg-[#101624]/75 border border-white/10 p-4 backdrop-blur-xl shadow-lg flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FB] flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-[#3B6CFF]" />
                  <span>DBSCAN Density Clusters</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF4D5E]/15 text-[#FF4D5E] border border-[#FF4D5E]/30">
                  3 Hotspots
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {[
                  {
                    id: "Cluster Alpha",
                    loc: "Marine Drive Ward 4",
                    count: 8,
                    danger: 96,
                    water: "1.8m Rising",
                    note: "3 elderly trapped on rooftop; water rising fast.",
                    unit: "NDRF Boat 3",
                  },
                  {
                    id: "Cluster Bravo",
                    loc: "Balighai Fishermen Colony",
                    count: 4,
                    danger: 84,
                    water: "1.2m Casuarina",
                    note: "Trees blocked road; pregnant woman in labor.",
                    unit: "Ambulance ALS-2",
                  },
                  {
                    id: "Cluster Charlie",
                    loc: "Brahmagiri High School",
                    count: 2,
                    danger: 62,
                    water: "0.5m Shallow",
                    note: "Drinking water depleted; ration supply needed.",
                    unit: "Truck Logistics 1",
                  },
                ].map((cl) => {
                  const isExtreme = cl.danger >= 90;
                  return (
                    <div
                      key={cl.id}
                      className="p-3 rounded-xl bg-[#161D2E]/70 border border-white/5 flex flex-col gap-2 hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#F5F7FB]">{cl.id}</span>
                            <span className="px-1.5 py-0.2 rounded bg-[#3B6CFF]/20 text-[#4FB3FF] text-[10px] font-bold">
                              {cl.count} 👤
                            </span>
                          </div>
                          <span className="text-[10px] text-[#6B7488] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#FF4D5E]" />
                            {cl.loc}
                          </span>
                        </div>

                        {/* Danger Score Badge */}
                        <div className="text-right">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                              isExtreme
                                ? "bg-[#FF4D5E]/20 text-[#FF4D5E] border-[#FF4D5E]/40"
                                : "bg-[#FF8A3D]/20 text-[#FF8A3D] border-[#FF8A3D]/40"
                            }`}
                          >
                            Risk {cl.danger}%
                          </span>
                        </div>
                      </div>

                      {/* Visual Water Level Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[#9AA3B8] flex items-center gap-1">
                            <Waves className="w-3 h-3 text-[#4FB3FF]" /> {cl.water}
                          </span>
                          <span className="text-[#6B7488] font-mono">{cl.unit}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isExtreme ? "bg-[#FF4D5E]" : "bg-[#FF8A3D]"
                            }`}
                            style={{ width: `${cl.danger}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-[10px] text-[#9AA3B8] leading-tight italic">
                        &ldquo;{cl.note}&rdquo;
                      </p>

                      <button
                        type="button"
                        onClick={() => toast.success(`Priority sortie dispatched to ${cl.id}!`)}
                        className="w-full py-1 rounded-lg bg-white/5 hover:bg-[#3B6CFF] text-[#F5F7FB] text-[10px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-0.5"
                      >
                        <Send className="w-3 h-3" />
                        <span>Dispatch Priority Sortie</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
