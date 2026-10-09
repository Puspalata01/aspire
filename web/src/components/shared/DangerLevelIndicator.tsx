"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DangerLevelIndicatorProps {
  level: 1 | 2 | 3 | 4 | "low" | "medium" | "high" | "critical";
  label?: string;
  className?: string;
  showBar?: boolean;
}

export function DangerLevelIndicator({
  level,
  label = "INCIDENT LEVEL 4 ACTIVE",
  className,
  showBar = true,
}: DangerLevelIndicatorProps) {
  let numericLevel = 4;
  if (typeof level === "number") {
    numericLevel = level;
  } else if (level === "low") {
    numericLevel = 1;
  } else if (level === "medium") {
    numericLevel = 2;
  } else if (level === "high") {
    numericLevel = 3;
  } else if (level === "critical") {
    numericLevel = 4;
  }

  const steps = [
    { num: 1, name: "Low", color: "bg-[#059669]", glow: "shadow-[0_0_8px_#059669]" },
    { num: 2, name: "Moderate", color: "bg-[#D97706]", glow: "shadow-[0_0_8px_#D97706]" },
    { num: 3, name: "High", color: "bg-[#EA580C]", glow: "shadow-[0_0_8px_#EA580C]" },
    { num: 4, name: "Critical", color: "bg-[#DC2626]", glow: "shadow-[0_0_8px_#DC2626]" },
  ];

  return (
    <div
      className={cn(
        "rounded-[16px] bg-white/95 border border-[#E7E2DA] p-2 sm:p-2.5 inline-flex flex-wrap items-center gap-2.5 sm:gap-3 select-none backdrop-blur-md shadow-xs",
        className
      )}
    >
      {/* ── Traffic-Light Graphic Housing ── */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8F7F4] border border-[#E7E2DA]"
        title={`Danger Level ${numericLevel} / 4`}
      >
        {steps.map((s) => {
          const isLit = s.num === numericLevel;
          return (
            <span
              key={s.num}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                isLit
                  ? cn(s.color, s.glow, "scale-125")
                  : "bg-[#E4DFD5] opacity-50"
              )}
            />
          );
        })}
      </div>

      {/* ── Label Tag ── */}
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full border",
            numericLevel === 4 && "bg-red-50 text-[#DC2626] border-red-200",
            numericLevel === 3 && "bg-orange-50 text-[#EA580C] border-orange-200",
            numericLevel === 2 && "bg-amber-50 text-[#D97706] border-amber-200",
            numericLevel === 1 && "bg-emerald-50 text-[#059669] border-emerald-200"
          )}
        >
          {label}
        </span>
      </div>

      {/* ── 4-Step Progress Track ── */}
      {showBar && (
        <div className="w-24 sm:w-28 flex gap-1 h-2 rounded-full overflow-hidden bg-[#F8F7F4] p-0.5 border border-[#E7E2DA]">
          {steps.map((s) => (
            <div
              key={s.num}
              className={cn(
                "flex-1 h-full rounded-xs transition-all",
                s.num <= numericLevel ? s.color : "bg-[#E4DFD5]"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
