"use client";

import React, { useEffect, useState } from "react";
import { AuthorityHeader } from "@/components/layout/AuthorityHeader";
import { api } from "@/lib/api";
import { CascadeGraph, CascadeGraphNode, CascadeGraphEdge } from "@/types";
import {
  Workflow,
  ArrowRight,
  Zap,
  Droplets,
  Radio,
  HeartPulse,
  Navigation,
  AlertTriangle,
  Layers,
  ShieldCheck,
} from "lucide-react";

export default function AuthorityCascadePage() {
  const [graph, setGraph] = useState<CascadeGraph>({
    nodes: [
      { id: "surge", label: "2.4m Storm Surge", type: "hazard", status: "critical", impactScore: 94 },
      { id: "grid", label: "132kV Grid Substation Puri", type: "power", status: "critical", impactScore: 82 },
      { id: "water", label: "Mangalahat Water Works", type: "water", status: "vulnerable", impactScore: 78 },
      { id: "hospital", label: "DHH Puri Hospital ICU", type: "hospital", status: "vulnerable", impactScore: 70 },
      { id: "telecom", label: "Coastal Cellular Towers (18)", type: "telecom", status: "critical", impactScore: 85 },
      { id: "evac", label: "Puri Coastal Shelters (5)", type: "shelter", status: "active", impactScore: 55 },
    ],
    edges: [
      { source: "surge", target: "grid", probabilityPct: 88, lagHours: 2 },
      { source: "grid", target: "water", probabilityPct: 94, lagHours: 4 },
      { source: "grid", target: "hospital", probabilityPct: 80, lagHours: 1 },
      { source: "surge", target: "telecom", probabilityPct: 91, lagHours: 2 },
      { source: "surge", target: "evac", probabilityPct: 65, lagHours: 3 },
    ],
  });

  useEffect(() => {
    api.getCascadeGraph("cyclone", 24).then((data) => {
      if (data && data.nodes && data.nodes.length > 0) {
        setGraph(data);
      }
    });
  }, []);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "power":
        return Zap;
      case "water":
        return Droplets;
      case "telecom":
        return Radio;
      case "hospital":
        return HeartPulse;
      default:
        return Navigation;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] text-[#1C1929] flex flex-col select-none">
      {/* Top Standard Authority Header */}
      <AuthorityHeader pageTitle="Infrastructure Cascade Failure Engine" />

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
                Cascade Failure Analysis
              </h2>
            </div>
            <p className="text-xs text-[#5D5775] leading-snug">
              Graph neural network mapping domino failures across substations, water treatment plants, and telecom towers.
            </p>
          </div>

          {/* Right: 4 Visual KPI Cards */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: Grid Substations */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#D97706]/15 border border-[#D97706]/30 flex items-center justify-center text-[#D97706] shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Power Substations</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">12</span>
                  <span className="text-[10px] font-mono text-[#16A34A]">Online</span>
                </div>
                <span className="text-[9px] text-[#767092]">3 Inundation watch</span>
              </div>
            </div>

            {/* KPI 2: Water Filtration Hubs */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/30 flex items-center justify-center text-[#2563EB] shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Water Plants</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">6</span>
                  <span className="text-[10px] font-mono text-[#16A34A]">Pumping</span>
                </div>
                <span className="text-[9px] text-[#767092]">Gravity backup ready</span>
              </div>
            </div>

            {/* KPI 3: Telecom Towers */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A] shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Telecom Hubs</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#1C1929]">18</span>
                  <span className="text-[10px] font-mono text-[#16A34A]">Active</span>
                </div>
                <span className="text-[9px] text-[#767092]">COW mobile masts</span>
              </div>
            </div>

            {/* KPI 4: Domino Chains */}
            <div className="rounded-[16px] bg-white/95 border border-[#E7E2DA] p-3 flex items-center gap-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#5D5775] block leading-tight">Cascade Risk</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#EF4444]">3</span>
                  <span className="text-[10px] font-bold text-[#EF4444]">Chains</span>
                </div>
                <span className="text-[9px] text-[#767092]">Substation → Pumps</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. CASCADE GRAPH BENTO (Nodes Grid + Trigger Sequence Flow)
           ───────────────────────────────────────────────────────────── */}
        <div className="rounded-[18px] border border-[#E7E2DA] bg-white/95 p-5 backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA]">
            <h3 className="text-sm font-bold text-[#1C1929] flex items-center gap-2">
              <Workflow className="w-4 h-4 text-[#7C3AED]" />
              <span>Inter-Sector Critical Infrastructure Nodes</span>
            </h3>
            <span className="text-xs font-mono font-semibold text-[#7C3AED] px-2.5 py-0.5 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/30">
              {graph.nodes.length} Interconnected Vertices
            </span>
          </div>

          {/* Nodes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {graph.nodes.map((node: CascadeGraphNode) => {
              const Icon = getNodeIcon(node.type);
              const isCrit = node.status === "critical";

              return (
                <div
                  key={node.id}
                  className="p-4 rounded-xl border border-[#E7E2DA] bg-[#FAF8F5] space-y-2 hover:border-[#7C3AED]/40 hover:bg-[#F3E8FF]/20 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white border border-[#E7E2DA] flex items-center justify-center text-[#7C3AED]">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase font-bold text-[#5D5775]">
                        {node.type}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border ${
                        isCrit
                          ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30"
                          : "bg-[#D97706]/15 text-[#D97706] border-[#D97706]/30"
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#1C1929] leading-snug">
                    {node.label}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-[#767092] pt-1 border-t border-[#E7E2DA]">
                    <span>Vulnerability Index:</span>
                    <span className="font-mono font-bold text-[#EF4444]">
                      {node.impactScore}/100
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trigger Sequence Pipeline */}
          <div className="pt-2 border-t border-[#E7E2DA] space-y-2.5">
            <h4 className="text-xs font-bold text-[#1C1929] flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Predictive Domino Propagation Sequence:</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {graph.edges.map((edge: CascadeGraphEdge, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA]"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#7C3AED] font-bold">{edge.source}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#767092]" />
                    <span className="font-mono text-[#1C1929] font-bold">{edge.target}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span className="text-[#767092]">Lag: +{edge.lagHours} hr</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#F97316]/15 text-[#F97316] border border-[#F97316]/30 font-bold">
                      {edge.probabilityPct}% Probability
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
