"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  trendGood?: boolean;
  icon?: LucideIcon;
  variant?: "default" | "critical" | "warning" | "success" | "accent";
  className?: string;
  displayType?: "count" | "percentage" | "trend" | "standard";
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  trend,
  trendGood = true,
  icon: Icon,
  variant = "default",
  className,
  displayType,
}: MetricCardProps) {
  const strVal = String(value);
  const isPercentage = displayType === "percentage" || strVal.includes("%");
  const numVal = typeof value === "number" ? value : parseFloat(strVal.replace(/[^0-9.]/g, ""));
  const isCount =
    displayType === "count" ||
    (!isPercentage && !isNaN(numVal) && numVal > 0 && numVal <= 30 && (title.toLowerCase().includes("sos") || title.toLowerCase().includes("team") || title.toLowerCase().includes("ticket")));
  const isTrend = displayType === "trend" || (!isPercentage && !isCount && Boolean(change));

  const getTrendColor = () => {
    if (!trend || trend === "neutral") return "text-[#5D5775] border-[#E7E2DA] bg-[#F8F7F4]";
    if (trendGood) {
      return trend === "up"
        ? "text-[#059669] border-[#A7F3D0] bg-[#ECFDF5]"
        : "text-[#DC2626] border-[#FECACA] bg-[#FEF2F2]";
    }
    return trend === "up"
      ? "text-[#DC2626] border-[#FECACA] bg-[#FEF2F2]"
      : "text-[#059669] border-[#A7F3D0] bg-[#ECFDF5]";
  };

  const getStatusColor = () => {
    if (variant === "critical") return "#DC2626";
    if (variant === "warning") return "#EA580C";
    if (variant === "success") return "#059669";
    if (variant === "accent") return "#7C3AED";
    return "#7C3AED";
  };

  // SVG Ring Chart calculation
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const pctValue = isNaN(numVal) ? 75 : Math.min(Math.max(numVal, 0), 100);
  const strokeDashoffset = circumference - (pctValue / 100) * circumference;

  return (
    <div
      className={cn(
        "relative rounded-[18px] bg-white/95 p-4 border border-[#E7E2DA] backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)] flex flex-col justify-between h-full min-h-[160px] select-none hover:border-[#7C3AED]/30 transition-all",
        className
      )}
    >
      {/* ── Top Header ── */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold text-[#5D5775] uppercase tracking-wider">
          {title}
        </p>
        {Icon && (
          <div className="rounded-xl p-2 bg-[#F8F7F4] border border-[#E7E2DA] text-[#7C3AED] shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* ── Middle Visual Data Section ── */}
      <div className="my-2 flex-1 flex flex-col justify-center">
        {/* CASE 1: PERCENTAGE RING CHART with Inset Centre */}
        {isPercentage ? (
          <div className="flex items-center gap-3.5">
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 54 54">
                <circle
                  cx="27"
                  cy="27"
                  r={radius}
                  stroke="#E7E2DA"
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  cx="27"
                  cy="27"
                  r={radius}
                  stroke={pctValue > 80 ? "#DC2626" : pctValue > 60 ? "#EA580C" : "#059669"}
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-1 rounded-full bg-[#F8F7F4] flex items-center justify-center">
                <span className="font-mono font-bold text-xs text-[#1C1929]">
                  {value}
                </span>
              </div>
            </div>
            {change && (
              <div className="space-y-0.5">
                <span className={cn("inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono", getTrendColor())}>
                  {change}
                </span>
                <p className="text-[9px] text-[#767092]">Telemetry Trend</p>
              </div>
            )}
          </div>
        ) : isCount ? (
          /* CASE 2: COUNTS (SOS, teams): Large Number + One Coloured Dot Per Item */
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <h4 className="font-mono text-2xl lg:text-3xl font-extrabold tracking-tight text-[#1C1929]">
                {value}
              </h4>
              {change && (
                <span className={cn("inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono", getTrendColor())}>
                  {change}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-[#F8F7F4] border border-[#E7E2DA] max-w-[200px]">
              {Array.from({ length: Math.min(Math.round(numVal), 24) }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full shadow-xs transition-transform hover:scale-125",
                    variant === "critical"
                      ? "bg-[#DC2626]"
                      : variant === "accent"
                      ? "bg-[#7C3AED]"
                      : variant === "success"
                      ? "bg-[#059669]"
                      : "bg-[#7C3AED]"
                  )}
                  title={`Unit ${i + 1}`}
                />
              ))}
            </div>
          </div>
        ) : isTrend ? (
          /* CASE 3: TRENDS: Smooth Sparkline with Soft Gradient Fill + Small +/- Pill */
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="font-mono text-2xl font-bold tracking-tight text-[#1C1929]">
                {value}
              </h4>
              {change && (
                <span className={cn("inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono shrink-0", getTrendColor())}>
                  {trend === "up" && <TrendingUp className="w-3 h-3 mr-0.5" />}
                  {trend === "down" && <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {trend === "neutral" && <Minus className="w-3 h-3 mr-0.5" />}
                  {change}
                </span>
              )}
            </div>
            <div className="w-full h-7 overflow-hidden rounded-lg bg-[#F8F7F4] border border-[#E7E2DA] p-0.5">
              <svg className="w-full h-full" viewBox="0 0 100 28" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`spark-${title.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={getStatusColor()} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={getStatusColor()} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,22 Q 25,6 50,18 T 100,8 L 100,28 L 0,28 Z"
                  fill={`url(#spark-${title.replace(/\s+/g, "")})`}
                />
                <path
                  d="M 0,22 Q 25,6 50,18 T 100,8"
                  fill="none"
                  stroke={getStatusColor()}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        ) : (
          /* CASE 4: STANDARD / PROGRESS METRIC */
          <div className="flex items-baseline gap-2">
            <h4 className="font-mono text-2xl font-bold tracking-tight text-[#1C1929]">
              {value}
            </h4>
            {change && (
              <span className={cn("inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono", getTrendColor())}>
                {change}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Subtitle / Metadata (Baseline aligned) ── */}
      {subtitle && (
        <p className="text-[10px] text-[#767092] leading-tight pt-1 border-t border-[#E7E2DA]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
