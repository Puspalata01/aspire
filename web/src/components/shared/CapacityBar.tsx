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
    if (percentage >= 85) return "bg-[#DC2626]";
    if (percentage >= 75) return "bg-[#EA580C]";
    if (percentage >= 50) return "bg-[#D97706]";
    return "bg-[#059669]";
  };

  const getStatusLabel = () => {
    if (percentage >= 85) return { text: "Critical Full", icon: AlertTriangle, color: "text-[#DC2626]" };
    if (percentage >= 75) return { text: "Near Capacity", icon: AlertCircle, color: "text-[#EA580C]" };
    if (percentage >= 50) return { text: "Moderate Load", icon: AlertCircle, color: "text-[#D97706]" };
    return { text: "Available", icon: ShieldCheck, color: "text-[#059669]" };
  };

  const status = getStatusLabel();
  const StatusIcon = status.icon;

  return (
    <div className={cn("w-full space-y-1.5 select-none", className)}>
      {(label || showNumbers) && (
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5">
            {label && <span className="text-[#1C1929] font-semibold">{label}</span>}
            <span className={cn("text-[10px] font-mono font-bold flex items-center gap-1", status.color)}>
              <StatusIcon className="w-3 h-3" />
              {status.text}
            </span>
          </div>
          {showNumbers && (
            <span className="font-mono text-[#5D5775] text-xs">
              <strong className="text-[#1C1929]">{current}</strong>/{total} {unit}{" "}
              <span className="font-bold text-[#1C1929]">({percentage}%)</span>
            </span>
          )}
        </div>
      )}

      {/* Visual Inset Track with Progress Segment */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E4DFD5] p-0.5 border border-[#E7E2DA]">
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
