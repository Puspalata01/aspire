"use client";

import React from "react";
import { useDisasterStore } from "@/stores/useDisasterStore";
import { SeverityBadge } from "./SeverityBadge";
import { AlertTriangle, X, ChevronRight } from "lucide-react";
import Link from "next/link";

export function LiveAlertBanner() {
  const { alerts, dismissAlert } = useDisasterStore();

  if (!alerts || alerts.length === 0) return null;

  const topAlert = alerts[0];

  return (
    <div className="relative z-30 px-4 py-2">
      <div className="max-w-7xl mx-auto rounded-full bg-white/95 border border-red-200 backdrop-blur-xl shadow-[0_10px_25px_rgba(220,38,38,0.08)] px-5 py-2 flex items-center justify-between gap-4 text-xs transition-all duration-160">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#DC2626] font-bold uppercase tracking-wider text-[11px] border border-red-200 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            LIVE ALERT
          </div>
          <SeverityBadge severity={topAlert.severity} />
          <span className="font-semibold text-[#1C1929] truncate max-w-[200px] sm:max-w-md md:max-w-xl">
            {topAlert.title}
          </span>
          <span className="text-[#5D5775] hidden lg:inline-block truncate">
            — {topAlert.message}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/authority/sos"
            className="hidden sm:inline-flex items-center gap-1 text-[#7C3AED] font-semibold hover:underline"
          >
            Take Action <ChevronRight className="w-3 h-3" />
          </Link>
          <button
            onClick={() => dismissAlert(topAlert.id)}
            className="p-1 rounded-full text-[#5D5775] hover:text-[#1C1929] hover:bg-[#F3E8FF] transition-all cursor-pointer"
            title="Dismiss alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
