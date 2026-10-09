"use client";

import React from "react";

interface SVGRingGaugeProps {
  value: number;
  label: string;
  color?: string;
  size?: number;
}

export function SVGRingGauge({
  value,
  label,
  color = "#F5C542",
  size = 72,
}: SVGRingGaugeProps) {
  const strokeWidth = 5;
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-1 group cursor-default">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth={strokeWidth}
          />
          {/* Active Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[13px] font-bold font-mono text-[#F5F7FB] tracking-tight">
            {value}%
          </span>
        </div>
      </div>

      {/* Label */}
      <span className="text-[10px] font-medium text-[#9AA3B8] tracking-wider uppercase text-center truncate max-w-[84px]">
        {label}
      </span>
    </div>
  );
}

export function DualRingPanel() {
  return (
    <div className="flex items-center gap-4 bg-[#101624]/75 border border-white/10 rounded-[18px] p-3 backdrop-blur-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.45)] hover:border-white/20 transition-all">
      <SVGRingGauge
        value={78.4}
        label="Sheltered"
        color="#F5C542"
        size={68}
      />
      <div className="w-px h-10 bg-white/10" />
      <SVGRingGauge
        value={84.1}
        label="ICU Surge"
        color="#4FB3FF"
        size={68}
      />
    </div>
  );
}
