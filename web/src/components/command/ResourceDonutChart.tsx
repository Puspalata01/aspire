"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ResourceSegment {
  name: string;
  count: number;
  total: number;
  color: string;
  pct: number;
}

export function ResourceDonutChart({ className }: { className?: string }) {
  const segments: ResourceSegment[] = [
    { name: "Gemini Boats", count: 45, total: 80, color: "#2F6FE0", pct: 48 },
    { name: "Ambulances", count: 14, total: 20, color: "#2E9E6B", pct: 15 },
    { name: "Airdrop Helis", count: 3, total: 5, color: "#D99A1E", pct: 4 },
    { name: "RO Tankers", count: 22, total: 25, color: "#F97316", pct: 23 },
    { name: "Trauma Squads", count: 9, total: 10, color: "#D64545", pct: 10 },
  ];

  const totalDeployed = segments.reduce((acc, s) => acc + s.count, 0);

  // SVG Donut calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  return (
    <div className={cn("flex items-center justify-between gap-4 select-none", className)}>
      {/* ── Donut Chart ── */}
      <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          {/* Background sunken ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#D4D4D1"
            strokeWidth="14"
            fill="none"
          />

          {/* Segmented color strokes */}
          {segments.map((seg, i) => {
            const strokeDasharray = `${(seg.pct / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedAngle / 100) * circumference);
            accumulatedAngle += seg.pct;

            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                fill="none"
                className="transition-all duration-500 hover:opacity-80"
              />
            );
          })}
        </svg>

        {/* Inset Sunken Center */}
        <div className="absolute inset-4 rounded-full bg-[#E2E2E0] shadow-sink-1 border border-[#D4D4D1] flex flex-col items-center justify-center">
          <span className="font-mono font-bold text-sm text-[#1D1D1F]">
            {totalDeployed}
          </span>
          <span className="text-[9px] text-[#8A8A90] font-mono">
            DEPLOYED
          </span>
        </div>
      </div>

      {/* ── Legend Chips ── */}
      <div className="flex-1 space-y-1.5 text-xs">
        {segments.map((seg) => (
          <div key={seg.name} className="flex items-center justify-between gap-1 text-[11px]">
            <div className="flex items-center gap-1.5 truncate">
              <span
                className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-[#4A4A4F] truncate font-medium">{seg.name}</span>
            </div>
            <span className="font-mono font-bold text-[#1D1D1F] shrink-0">
              {seg.count}/{seg.total}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
