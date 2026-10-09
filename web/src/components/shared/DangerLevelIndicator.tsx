"use client";

import React from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
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
    { num: 1, name: "Low", color: "bg-[#2FD07F]", glow: "shadow-[0_0_8px_#2FD07F]" },
    { num: 2, name: "Moderate", color: "bg-[#F5C542]", glow: "shadow-[0_0_8px_#F5C542]" },
    { num: 3, name: "High", color: "bg-[#FF8A3D]", glow: "shadow-[0_0_8px_#FF8A3D]" },
    { num: 4, name: "Critical", color: "bg-[#FF4D5E]", glow: "shadow-[0_0_8px_#FF4D5E]" },
  ];

  const currentStep = steps[numericLevel - 1] || steps[3];

  return (
    <div
      className={cn(
        "rounded-[16px] bg-[#101624]/85 border border-white/10 p-2 sm:p-2.5 inline-flex flex-wrap items-center gap-2.5 sm:gap-3 select-none backdrop-blur-md",
        className
      )}
    >
      {/* ── Traffic-Light Graphic Housing ── */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#05070D] border border-white/10"
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
                  : "bg-white/10 opacity-30"
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
            numericLevel === 4 && "bg-[#FF4D5E]/20 text-[#FF4D5E] border-[#FF4D5E]/30",
            numericLevel === 3 && "bg-[#FF8A3D]/20 text-[#FF8A3D] border-[#FF8A3D]/30",
            numericLevel === 2 && "bg-[#F5C542]/20 text-[#F5C542] border-[#F5C542]/30",
            numericLevel === 1 && "bg-[#2FD07F]/20 text-[#2FD07F] border-[#2FD07F]/30"
          )}
        >
          {label}
        </span>
      </div>

      {/* ── 4-Step Progress Track ── */}
      {showBar && (
        <div className="w-24 sm:w-28 flex gap-1 h-2 rounded-full overflow-hidden bg-[#05070D] p-0.5 border border-white/10">
          {steps.map((s) => (
            <div
              key={s.num}
              className={cn(
                "flex-1 h-full rounded-sm transition-all",
                s.num <= numericLevel ? s.color : "bg-white/5"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
