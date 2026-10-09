"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, ShieldCheck } from "lucide-react";

interface CDRISemiGaugeProps {
  score: number; // e.g. 89.4
  maxScore?: number; // e.g. 100
  levelText?: string; // e.g. "CRITICAL"
  className?: string;
}

export function CDRISemiGauge({
  score = 89.4,
  maxScore = 100,
  levelText = "CRITICAL",
  className,
}: CDRISemiGaugeProps) {
  // Semi-circle gauge calculation
  // Radius = 60, circumference of semi-circle = Math.PI * 60 ≈ 188.5
  const radius = 60;
  const semiCircumference = Math.PI * radius;
  const pct = Math.min(Math.max(score / maxScore, 0), 1);
  const strokeDashoffset = semiCircumference - pct * semiCircumference;

  // Needle angle from -180 deg (left) to 0 deg (right)
  const needleAngle = -180 + pct * 180;

  return (
    <div className={cn("flex flex-col items-center select-none", className)}>
      <div className="relative w-44 h-24 overflow-hidden flex items-end justify-center">
        {/* SVG Semi-Circle Arc */}
        <svg
          className="w-44 h-44 absolute -top-1"
          viewBox="0 0 160 160"
        >
          {/* Background sunken track */}
          <path
            d="M 20 80 A 60 60 0 0 1 140 80"
            fill="none"
            stroke="#D4D4D1"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Color Segments Indicator */}
          {/* Low (0-30% Green) */}
          <path
            d="M 20 80 A 60 60 0 0 1 45 35"
            fill="none"
            stroke="#2E9E6B"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.25"
          />
          {/* Moderate (30-60% Yellow) */}
          <path
            d="M 45 35 A 60 60 0 0 1 115 35"
            fill="none"
            stroke="#D99A1E"
            strokeWidth="12"
            opacity="0.25"
          />
          {/* Critical (60-100% Red) */}
          <path
            d="M 115 35 A 60 60 0 0 1 140 80"
            fill="none"
            stroke="#D64545"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.25"
          />

          {/* Active Progress Arc */}
          <path
            d="M 20 80 A 60 60 0 0 1 140 80"
            fill="none"
            stroke={score >= 80 ? "#D64545" : score >= 60 ? "#F97316" : score >= 40 ? "#D99A1E" : "#2E9E6B"}
            strokeWidth="12"
            strokeDasharray={semiCircumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Inset Sunken Needle Center Hub */}
        <div className="w-16 h-16 rounded-full bg-[#E2E2E0] shadow-sink-1 border border-[#D4D4D1] flex flex-col items-center justify-center z-10 -mb-8">
          <span className="font-mono font-bold text-xs text-[#D64545] leading-tight">
            {levelText}
          </span>
          <span className="font-mono font-extrabold text-sm text-[#1D1D1F]">
            {score}
          </span>
        </div>
      </div>

      {/* Metric details & sub-label */}
      <div className="mt-3 text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] font-mono text-[#8A8A90]">Index Range 0 - 100</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D64545] animate-ping" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E2E2E0] shadow-sink-1 border border-[#D4D4D1]">
          <span className="w-2 h-2 rounded-full bg-[#D64545]" />
          <span className="text-[10px] font-mono font-bold text-[#1D1D1F]">
            LEVEL-4 SEVERE THREAT
          </span>
        </div>
      </div>
    </div>
  );
}
