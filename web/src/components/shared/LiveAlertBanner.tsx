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
      <div className="max-w-7xl mx-auto rounded-full bg-[#101624]/90 border border-[#FF4D5E]/30 backdrop-blur-xl shadow-lg px-5 py-2 flex items-center justify-between gap-4 text-xs transition-all duration-160">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF4D5E]/20 text-[#FF4D5E] font-bold uppercase tracking-wider text-[11px] border border-[#FF4D5E]/40 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            LIVE ALERT
          </div>
          <SeverityBadge severity={topAlert.severity} />
          <span className="font-semibold text-[#F5F7FB] truncate max-w-[200px] sm:max-w-md md:max-w-xl">
            {topAlert.title}
          </span>
          <span className="text-[#8E99AF] hidden lg:inline-block truncate">
            — {topAlert.message}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/authority/sos"
            className="hidden sm:inline-flex items-center gap-1 text-[#4FB3FF] font-semibold hover:underline"
          >
            Take Action <ChevronRight className="w-3 h-3" />
          </Link>
          <button
            onClick={() => dismissAlert(topAlert.id)}
            className="p-1 rounded-full text-[#8E99AF] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Dismiss alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
