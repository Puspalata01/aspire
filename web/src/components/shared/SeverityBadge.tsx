import React from "react";
import { SeverityLevel } from "@/types";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from "lucide-react";

interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
  showIcon?: boolean;
}

export function SeverityBadge({
  severity,
  className,
  showIcon = true,
}: SeverityBadgeProps) {
  const getStyles = () => {
    switch (severity) {
      case "critical":
        return {
          text: "text-[#FF4D5E]",
          bg: "bg-[#FF4D5E]/15",
          border: "border-[#FF4D5E]/30",
          icon: <ShieldAlert className="w-3.5 h-3.5 text-[#FF4D5E]" />,
        };
      case "high":
        return {
          text: "text-[#FF8A3D]",
          bg: "bg-[#FF8A3D]/15",
          border: "border-[#FF8A3D]/30",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-[#FF8A3D]" />,
        };
      case "medium":
        return {
          text: "text-[#F5C542]",
          bg: "bg-[#F5C542]/15",
          border: "border-[#F5C542]/30",
          icon: <AlertCircle className="w-3.5 h-3.5 text-[#F5C542]" />,
        };
      case "low":
      default:
        return {
          text: "text-[#2FD07F]",
          bg: "bg-[#2FD07F]/15",
          border: "border-[#2FD07F]/30",
          icon: <Info className="w-3.5 h-3.5 text-[#2FD07F]" />,
        };
    }
  };

  const style = getStyles();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border select-none",
        style.text,
        style.bg,
        style.border,
        className
      )}
    >
      {showIcon && style.icon}
      <span>{severity}</span>
    </span>
  );
}
