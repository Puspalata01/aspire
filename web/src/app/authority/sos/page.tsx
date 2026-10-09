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

  const sosList = Array.isArray(requests) ? requests : [];
  const criticalCount = sosList.filter((r) => r.urgency === "critical").length;
  const totalTrapped = sosList.reduce((acc, r) => acc + (r.peopleCount || 1), 0);


  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] text-[#1C1929] flex flex-col select-none">
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
              <span className="w-3 h-3 rounded-full bg-[#EF4444] animate-ping" />
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-[#1C1929]">
                SOS Emergency Dispatch
              </h2>
            </div>
            <p className="text-xs text-[#5D5775] leading-snug">
              Autonomous civilian distress prioritization, reverse GPS geocoding, and tactical boat dispatch.
            </p>
          </div>

          {/* Right: 4 Visual KPI Cards */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: Critical Life Threats */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Critical Threats</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#EF4444]">{criticalCount}</span>
                  <span className="text-[10px] font-bold text-[#EF4444]">Immediate</span>
                </div>
                <span className="text-[9px] text-[#767092]">Acuity Level 4/4</span>
              </div>
            </div>

            {/* KPI 2: Trapped Citizens */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/15 border border-[#7C3AED]/30 flex items-center justify-center text-[#7C3AED] shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Trapped Citizens</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">{totalTrapped}</span>
                  <span className="text-[10px] font-mono text-[#16A34A]">48 hrs food</span>
                </div>
                <span className="text-[9px] text-[#767092]">Verified headcount</span>
              </div>
            </div>

            {/* KPI 3: Units Mobilized */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A] shrink-0">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Rescue Units</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">12</span>
                  <span className="text-[10px] font-mono text-[#16A34A]">Deployed</span>
                </div>
                <span className="text-[9px] text-[#767092]">Boats & Amphibians</span>
              </div>
            </div>

            {/* KPI 4: Mean Dispatch Time */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#D97706]/15 border border-[#D97706]/30 flex items-center justify-center text-[#D97706] shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Avg Response</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">8.2m</span>
                  <span className="text-[10px] font-mono text-[#16A34A]">↓ 4.1m</span>
                </div>
                <span className="text-[9px] text-[#767092]">Target: &lt; 15 mins</span>
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
            <div className="rounded-[18px] bg-white/95 border border-[#E7E2DA] p-3.5 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1929]">
                    Cluster Radar View
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#767092]">ε=500m, MinPts=3</span>
              </div>

              <div className="w-full h-48 rounded-xl overflow-hidden border border-[#E7E2DA] relative">
                <MapboxView height="100%" />
              </div>
            </div>

            {/* DBSCAN Hotspot Clusters Cards (Visual Acuity with depth meters) */}
            <div className="rounded-[18px] bg-white/95 border border-[#E7E2DA] p-4 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)] flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1929] flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>DBSCAN Density Clusters</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 font-semibold">
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
                      className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] flex flex-col gap-2 hover:border-[#7C3AED]/40 hover:bg-[#F3E8FF]/20 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#1C1929]">{cl.id}</span>
                            <span className="px-1.5 py-0.2 rounded bg-[#7C3AED]/15 text-[#7C3AED] text-[10px] font-bold">
                              {cl.count} 👤
                            </span>
                          </div>
                          <span className="text-[10px] text-[#5D5775] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#EF4444]" />
                            {cl.loc}
                          </span>
                        </div>

                        {/* Danger Score Badge */}
                        <div className="text-right">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                              isExtreme
                                ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30"
                                : "bg-[#F97316]/15 text-[#F97316] border-[#F97316]/30"
                            }`}
                          >
                            Risk {cl.danger}%
                          </span>
                        </div>
                      </div>

                      {/* Visual Water Level Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[#5D5775] flex items-center gap-1 font-medium">
                            <Waves className="w-3 h-3 text-[#2563EB]" /> {cl.water}
                          </span>
                          <span className="text-[#767092] font-mono">{cl.unit}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#E7E2DA] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isExtreme ? "bg-[#EF4444]" : "bg-[#F97316]"
                            }`}
                            style={{ width: `${cl.danger}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-[10px] text-[#5D5775] leading-tight italic">
                        &ldquo;{cl.note}&rdquo;
                      </p>

                      <button
                        type="button"
                        onClick={() => toast.success(`Priority sortie dispatched to ${cl.id}!`)}
                        className="w-full py-1.5 rounded-lg bg-white hover:bg-[#7C3AED] hover:text-white border border-[#E7E2DA] text-[#7C3AED] text-[10px] font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer mt-0.5"
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
