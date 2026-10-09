"use client";

import React from "react";

// Mini Sparkline (Left Top Card)
export function MiniSparkline({
  data = [20, 24, 22, 28, 25, 32, 38],
  color = "#2FD07F",
  width = 90,
  height = 36,
}: {
  data?: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <filter id="glow-sparkline" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        filter="url(#glow-sparkline)"
      />
    </svg>
  );
}

// Area Chart (Right Top Card)
export function AreaSparkline({
  data = [12, 18, 15, 24, 22, 32, 28, 42, 36, 48],
  color = "#2FD07F",
  width = 240,
  height = 70,
}: {
  data?: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const linePoints = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 14) - 8;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${linePoints} ${width},${height} 0,${height}`;

  return (
    <div className="w-full relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        className="overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon fill="url(#areaGrad)" points={areaPoints} />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={linePoints}
        />
        {/* End pulse point */}
        <circle
          cx={width}
          cy={height - ((data[data.length - 1] - min) / range) * (height - 14) - 8}
          r="4"
          fill="#F5F7FB"
          stroke={color}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

// 4-Bar Resource Readiness Chart (Right Bottom Card)
interface BarItem {
  name: string;
  pct: number;
  color: string;
  eta: string;
}

export function ResourceFourBars({
  items = [
    { name: "Rescue Boats", pct: 56, color: "#3B6CFF", eta: "3 hr 12 min" },
    { name: "Ambulances", pct: 70, color: "#2FD07F", eta: "1 hr 18 min" },
    { name: "Air Choppers", pct: 60, color: "#6C63FF", eta: "2 hr 21 min" },
    { name: "Water Tankers", pct: 88, color: "#FF8A3D", eta: "5 hr 12 min" },
  ],
}: {
  items?: BarItem[];
}) {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* 4 Vertical Bars container */}
      <div className="flex items-end justify-between h-28 px-3 pt-4 pb-1 border-b border-white/10">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1.5 w-12 group">
            {/* Percentage badge on top */}
            <span className="text-[11px] font-mono font-bold text-[#F5F7FB] opacity-90 group-hover:scale-110 transition-transform">
              {item.pct}%
            </span>
            {/* Bar track and fill */}
            <div className="w-7 h-20 bg-white/5 rounded-t-lg relative flex items-end overflow-hidden">
              <div
                className="w-full rounded-t-lg transition-all duration-700 ease-out group-hover:brightness-110 shadow-sm"
                style={{
                  height: `${item.pct}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Legend list below */}
      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-xs py-0.5 hover:bg-white/5 px-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[#9AA3B8] font-medium">{item.name}</span>
            </div>
            <span className="font-mono text-[11px] text-[#F5F7FB] font-semibold">
              {item.eta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
