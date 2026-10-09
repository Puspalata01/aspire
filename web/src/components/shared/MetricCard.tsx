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
    if (!trend || trend === "neutral") return "text-[#9AA3B8] border-white/10 bg-white/5";
    if (trendGood) {
      return trend === "up"
        ? "text-[#2FD07F] border-[#2FD07F]/40 bg-[#2FD07F]/10"
        : "text-[#FF4D5E] border-[#FF4D5E]/40 bg-[#FF4D5E]/10";
    }
    return trend === "up"
      ? "text-[#FF4D5E] border-[#FF4D5E]/40 bg-[#FF4D5E]/10"
      : "text-[#2FD07F] border-[#2FD07F]/40 bg-[#2FD07F]/10";
  };

  const getStatusColor = () => {
    if (variant === "critical") return "#FF4D5E";
    if (variant === "warning") return "#FF8A3D";
    if (variant === "success") return "#2FD07F";
    if (variant === "accent") return "#3B6CFF";
    return "#4FB3FF";
  };

  // SVG Ring Chart calculation
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const pctValue = isNaN(numVal) ? 75 : Math.min(Math.max(numVal, 0), 100);
  const strokeDashoffset = circumference - (pctValue / 100) * circumference;

  return (
    <div
      className={cn(
        "relative rounded-[18px] bg-[#101624]/75 p-4 border border-white/10 backdrop-blur-xl shadow-lg flex flex-col justify-between h-full min-h-[160px] select-none",
        className
      )}
    >
      {/* ── Top Header ── */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold text-[#9AA3B8] uppercase tracking-wider">
          {title}
        </p>
        {Icon && (
          <div className="rounded-xl p-2 bg-white/5 border border-white/10 text-[#4FB3FF] shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* ── Middle Visual Data Section (Pictures Instead of Text) ── */}
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
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  cx="27"
                  cy="27"
                  r={radius}
                  stroke={pctValue > 80 ? "#FF4D5E" : pctValue > 60 ? "#FF8A3D" : "#2FD07F"}
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-1 rounded-full bg-[#161D2E] flex items-center justify-center">
                <span className="font-mono font-bold text-xs text-[#F5F7FB]">
                  {value}
                </span>
              </div>
            </div>
            {change && (
              <div className="space-y-0.5">
                <span className={cn("inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono", getTrendColor())}>
                  {change}
                </span>
                <p className="text-[9px] text-[#6B7488]">Telemetry Trend</p>
              </div>
            )}
          </div>
        ) : isCount ? (
          /* CASE 2: COUNTS (SOS, teams): Large Number + One Coloured Dot Per Item */
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <h4 className="font-mono text-2xl lg:text-3xl font-extrabold tracking-tight text-[#F5F7FB]">
                {value}
              </h4>
              {change && (
                <span className={cn("inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono", getTrendColor())}>
                  {change}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-[#161D2E]/80 border border-white/5 max-w-[200px]">
              {Array.from({ length: Math.min(Math.round(numVal), 24) }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full shadow-sm transition-transform hover:scale-125",
                    variant === "critical"
                      ? "bg-[#FF4D5E]"
                      : variant === "accent"
                      ? "bg-[#3B6CFF]"
                      : variant === "success"
                      ? "bg-[#2FD07F]"
                      : "bg-[#4FB3FF]"
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
              <h4 className="font-mono text-2xl font-bold tracking-tight text-[#F5F7FB]">
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
            <div className="w-full h-7 overflow-hidden rounded-lg bg-[#161D2E]/60 p-0.5">
              <svg className="w-full h-full" viewBox="0 0 100 28" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`spark-${title.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={getStatusColor()} stopOpacity="0.35" />
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
            <h4 className="font-mono text-2xl font-bold tracking-tight text-[#F5F7FB]">
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
        <p className="text-[10px] text-[#6B7488] leading-tight pt-1 border-t border-white/5">
          {subtitle}
        </p>
      )}
    </div>
  );
}
