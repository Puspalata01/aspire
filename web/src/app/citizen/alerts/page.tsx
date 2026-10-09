"use client";

import React from "react";
import { useDisasterStore } from "@/stores/useDisasterStore";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { formatDateTime } from "@/lib/utils";
import { Bell, Radio, ExternalLink } from "lucide-react";

export default function CitizenAlertsPage() {
  const { alerts } = useDisasterStore();

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1F]">Official Emergency Warnings</h1>
        <p className="text-xs text-[#8A8A90] mt-1">
          Direct broadcasts from IMD, Central Water Commission, and State Emergency Operation Center.
        </p>
      </div>

      <div className="space-y-4">
        {alerts.map((alt) => (
          <div
            key={alt.id}
            className="p-6 rounded-[24px] border border-[#D4D4D1] bg-[#F1F1EF] shadow-raise-2 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <SeverityBadge severity={alt.severity} />
                <span className="text-[11px] font-mono text-[#8A8A90]">
                  {(alt.hazardType || alt.type || "ALERT").toUpperCase()}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#8A8A90]">
                {formatDateTime(alt.issuedAt || alt.created_at || new Date().toISOString())}
              </span>
            </div>

            <h3 className="text-sm font-bold text-[#1D1D1F]">{alt.title}</h3>
            <p className="text-xs text-[#4A4A4F] leading-relaxed">{alt.message}</p>

            <div className="pt-2 border-t border-[#D4D4D1] text-[11px] text-[#8A8A90] flex items-center justify-between">
              <span>Authority: {alt.source || "SDMA Odisha / ASPIRE"}</span>
              <span className="text-[#2E9E6B] font-semibold">● Verified Broadcast</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
