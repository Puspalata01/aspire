"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, AlertCircle, AlertTriangle } from "lucide-react";

interface CapacityBarProps {
  current: number;
  total: number;
  label?: string;
  showNumbers?: boolean;
  unit?: string;
  className?: string;
}

export function CapacityBar({
  current,
  total,
  label,
  showNumbers = true,
  unit = "",
  className,
}: CapacityBarProps) {
  const percentage = Math.min(Math.round((current / (total || 1)) * 100), 100);

  const getBarColor = () => {
    if (percentage >= 85) return "bg-[#FF4D5E] shadow-[0_0_12px_rgba(255,77,94,0.5)]";
    if (percentage >= 75) return "bg-[#FF8A3D] shadow-[0_0_12px_rgba(255,138,61,0.5)]";
    if (percentage >= 50) return "bg-[#F5C542] shadow-[0_0_12px_rgba(245,197,66,0.5)]";
    return "bg-[#2FD07F] shadow-[0_0_12px_rgba(47,208,127,0.5)]";
  };

  const getStatusLabel = () => {
    if (percentage >= 85) return { text: "Critical Full", icon: AlertTriangle, color: "text-[#FF4D5E]" };
    if (percentage >= 75) return { text: "Near Capacity", icon: AlertCircle, color: "text-[#FF8A3D]" };
    if (percentage >= 50) return { text: "Moderate Load", icon: AlertCircle, color: "text-[#F5C542]" };
    return { text: "Available", icon: ShieldCheck, color: "text-[#2FD07F]" };
  };

  const status = getStatusLabel();
  const StatusIcon = status.icon;

  return (
    <div className={cn("w-full space-y-1.5 select-none", className)}>
      {(label || showNumbers) && (
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5">
            {label && <span className="text-[#F5F7FB] font-semibold">{label}</span>}
            <span className={cn("text-[10px] font-mono font-bold flex items-center gap-1", status.color)}>
              <StatusIcon className="w-3 h-3" />
              {status.text}
            </span>
          </div>
          {showNumbers && (
            <span className="font-mono text-[#9AA3B8] text-xs">
              <strong className="text-[#F5F7FB]">{current}</strong>/{total} {unit}{" "}
              <span className="font-bold text-white">({percentage}%)</span>
            </span>
          )}
        </div>
      )}

      {/* Visual Inset Track with Glowing Progress Segment */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-[#161D2E] p-0.5 border border-white/10 shadow-inner">
        <div
          className={cn(
            "h-full transition-all duration-300 rounded-full",
            getBarColor()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
