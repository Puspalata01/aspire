"use client";

import React from "react";
import { useSOSStore } from "@/stores/useSOSStore";
import { LifeBuoy, ChevronRight, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function EmergencyFeed() {
  const { requests, setSelectedRequest } = useSOSStore();

  return (
    <div className="rounded-[24px] bg-[#F1F1EF] p-5 shadow-raise-2 flex flex-col h-full border border-[#D4D4D1]/40 select-none">
      <div className="flex items-center justify-between pb-3 border-b border-[#D4D4D1]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D64545] animate-ping" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F]">
            Live Emergency SOS Feed
          </h3>
        </div>
        <Link
          href="/authority/sos"
          className="text-xs text-[#2F6FE0] font-semibold flex items-center gap-1 hover:underline"
        >
          View All ({requests.length}) <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Feed Rows: Inset Row with Round Icon, 1 Bold Line, 1 Grey Line, Status Pill ── */}
      <div className="flex-1 overflow-y-auto space-y-2.5 mt-3 pr-1 scrollbar-thin">
        {requests.map((sos) => {
          const isCritical = sos.urgency === "critical";
          return (
            <div
              key={sos.id}
              onClick={() => setSelectedRequest(sos)}
              className="p-3 rounded-[16px] bg-[#E2E2E0] shadow-sink-1 border border-[#D4D4D1] hover:bg-[#DCDCDA] transition-all duration-160 cursor-pointer flex items-center justify-between gap-3 group"
            >
              {/* Round Icon */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full bg-[#F1F1EF] shadow-raise-1 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform",
                  isCritical ? "text-[#D64545]" : "text-[#D99A1E]"
                )}
              >
                {isCritical ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <LifeBuoy className="w-4 h-4" />
                )}
              </div>

              {/* Text: 1 Bold Line + 1 Grey Line */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <h4 className="text-xs font-bold text-[#1D1D1F] truncate group-hover:text-[#2F6FE0] transition-colors">
                  {sos.requesterName} <span className="font-mono font-medium text-[#8A8A90]">({sos.peopleCount} ppl)</span> • #{sos.id.toUpperCase()}
                </h4>
                <p className="text-[11px] text-[#4A4A4F] truncate">
                  {sos.description} • {sos.address}
                </p>
              </div>

              {/* Status Pill */}
              <div className="shrink-0">
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold font-mono shadow-raise-1 border shrink-0",
                    isCritical
                      ? "bg-[#F1F1EF] text-[#D64545] border-[#D64545]"
                      : "bg-[#F1F1EF] text-[#D99A1E] border-[#D99A1E]"
                  )}
                >
                  {sos.urgency.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
