"use client";

import React from "react";
import { AuthorityHeader } from "@/components/layout/AuthorityHeader";
import { MOCK_CASCADE_GRAPH } from "@/lib/mock-data";
import { CascadeGraphNode, CascadeGraphEdge } from "@/types";
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
    <div className="w-full min-h-screen bg-[#05070D] text-[#F5F7FB] flex flex-col select-none">
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
              <span className="w-3 h-3 rounded-full bg-[#3B6CFF] animate-pulse" />
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-[#F5F7FB]">
                Cascade Failure Analysis
              </h2>
            </div>
            <p className="text-xs text-[#9AA3B8] leading-snug">
              Graph neural network mapping domino failures across substations, water treatment plants, and telecom towers.
            </p>
          </div>

          {/* Right: 4 Visual KPI Cards */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: Grid Substations */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#F5C542]/20 border border-[#F5C542]/40 flex items-center justify-center text-[#F5C542] shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Power Substations</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">12</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">Online</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">3 Inundation watch</span>
              </div>
            </div>

            {/* KPI 2: Water Filtration Hubs */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#3B6CFF]/20 border border-[#3B6CFF]/40 flex items-center justify-center text-[#3B6CFF] shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Water Plants</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">6</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">Pumping</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Gravity backup ready</span>
              </div>
            </div>

            {/* KPI 3: Telecom Towers */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#2FD07F]/20 border border-[#2FD07F]/40 flex items-center justify-center text-[#2FD07F] shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Telecom Hubs</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#F5F7FB]">18</span>
                  <span className="text-[10px] font-mono text-[#2FD07F]">Active</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">COW mobile masts</span>
              </div>
            </div>

            {/* KPI 4: Domino Chains */}
            <div className="rounded-[16px] bg-[#101624]/75 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#FF4D5E]/20 border border-[#FF4D5E]/40 flex items-center justify-center text-[#FF4D5E] shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#9AA3B8] block leading-tight">Cascade Risk</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#FF4D5E]">3</span>
                  <span className="text-[10px] font-bold text-[#FF4D5E]">Chains</span>
                </div>
                <span className="text-[9px] text-[#6B7488]">Substation → Pumps</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. CASCADE GRAPH BENTO (Nodes Grid + Trigger Sequence Flow)
           ───────────────────────────────────────────────────────────── */}
        <div className="rounded-[18px] border border-white/10 bg-[#101624]/75 p-5 backdrop-blur-xl shadow-lg space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-[#F5F7FB] flex items-center gap-2">
              <Workflow className="w-4 h-4 text-[#3B6CFF]" />
              <span>Inter-Sector Critical Infrastructure Nodes</span>
            </h3>
            <span className="text-xs font-mono font-semibold text-[#3B6CFF] px-2.5 py-0.5 rounded-full bg-[#3B6CFF]/15 border border-[#3B6CFF]/30">
              {MOCK_CASCADE_GRAPH.nodes.length} Interconnected Vertices
            </span>
          </div>

          {/* Nodes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {MOCK_CASCADE_GRAPH.nodes.map((node: CascadeGraphNode) => {
              const Icon = getNodeIcon(node.type);
              const isCrit = node.status === "critical";

              return (
                <div
                  key={node.id}
                  className="p-4 rounded-xl border border-white/5 bg-[#161D2E]/80 space-y-2 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[#3B6CFF]">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase font-bold text-[#9AA3B8]">
                        {node.type}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border ${
                        isCrit
                          ? "bg-[#FF4D5E]/20 text-[#FF4D5E] border-[#FF4D5E]/40"
                          : "bg-[#F5C542]/20 text-[#F5C542] border-[#F5C542]/40"
                      }`}
                    >
                      {node.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#F5F7FB] leading-snug">
                    {node.label}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-[#6B7488] pt-1 border-t border-white/5">
                    <span>Vulnerability Index:</span>
                    <span className="font-mono font-bold text-[#FF4D5E]">
                      {node.impactScore}/100
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trigger Sequence Pipeline */}
          <div className="pt-2 border-t border-white/10 space-y-2.5">
            <h4 className="text-xs font-bold text-[#F5F7FB] flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[#F5C542]" />
              <span>Predictive Domino Propagation Sequence:</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {MOCK_CASCADE_GRAPH.edges.map((edge: CascadeGraphEdge, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#161D2E]/80 border border-white/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#3B6CFF] font-bold">{edge.source}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#6B7488]" />
                    <span className="font-mono text-[#F5F7FB] font-bold">{edge.target}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span className="text-[#6B7488]">Lag: +{edge.lagHours} hr</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#FF8A3D]/20 text-[#FF8A3D] border border-[#FF8A3D]/40 font-bold">
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
