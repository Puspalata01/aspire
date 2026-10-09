"use client";

import React from "react";
import { useDisasterStore } from "@/stores/useDisasterStore";
import { Sparkles, ArrowRight, Zap } from "lucide-react";
import { toast } from "sonner";

export function AIInsightsPanel() {
  const { insights } = useDisasterStore();

  const handleExecute = (title: string) => {
    toast.success(`Action initiated for: ${title}`);
  };

  return (
    <div className="rounded-[24px] bg-[#F1F1EF] p-5 shadow-raise-2 flex flex-col h-full border border-[#D4D4D1]/40 select-none">
      <div className="flex items-center justify-between pb-3 border-b border-[#D4D4D1]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#F1F1EF] shadow-raise-1 flex items-center justify-center text-[#2F6FE0]">
            <Sparkles className="w-4 h-4 text-[#2F6FE0]" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F]">
              AI Predictive Engine
            </h3>
            <p className="text-[10px] text-[#8A8A90] font-mono">
              Hydrodynamic + Sensor Ensemble
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#F1F1EF] shadow-raise-1 text-[#2F6FE0] font-bold border border-[#2F6FE0]/30">
          94.2% ACCURACY
        </span>
      </div>

      {/* ── Predictions: Countdown/Confidence Ring + 1 Bold Sentence + 1 Big Button ── */}
      <div className="space-y-4 mt-3 flex-1 overflow-y-auto pr-1 scrollbar-thin">
        {insights.map((ins, idx) => {
          const radius = 18;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (ins.confidencePct / 100) * circumference;
          const countdown = idx === 0 ? "T-3h" : idx === 1 ? "T-4.5h" : "T-18h";

          return (
            <div
              key={ins.id}
              className="p-4 rounded-[20px] bg-[#F1F1EF] shadow-raise-1 border border-[#D4D4D1]/60 space-y-3"
            >
              {/* Prediction Visual Header: Ring + Bold Sentence */}
              <div className="flex items-start gap-3.5">
                {/* Countdown / Confidence Ring with Inset Centre */}
                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 46 46">
                    <circle
                      cx="23"
                      cy="23"
                      r={radius}
                      stroke="#D4D4D1"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="23"
                      cy="23"
                      r={radius}
                      stroke={ins.priority === "critical" ? "#D64545" : "#2F6FE0"}
                      strokeWidth="4"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute inset-1 rounded-full bg-[#E2E2E0] shadow-sink-1 flex flex-col items-center justify-center">
                    <span className="font-mono font-bold text-[10px] text-[#1D1D1F]">
                      {countdown}
                    </span>
                    <span className="text-[8px] font-mono text-[#8A8A90]">
                      {ins.confidencePct}%
                    </span>
                  </div>
                </div>

                {/* 1 Bold Sentence */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1D1D1F] leading-snug">
                    {ins.impactSummary}
                  </p>
                  <p className="text-[10px] text-[#8A8A90] mt-1 truncate">
                    {ins.title}
                  </p>
                </div>
              </div>

              {/* Inset Recommendation Box */}
              <div className="p-2.5 rounded-[12px] bg-[#E2E2E0] shadow-sink-1 text-[11px] text-[#1D1D1F] flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 text-[#2F6FE0] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#2F6FE0]">Action:</strong> {ins.recommendedAction}
                </span>
              </div>

              {/* 1 Big Raised Button */}
              <button
                type="button"
                onClick={() => handleExecute(ins.title)}
                className="w-full h-10 rounded-full bg-[#8E8E93] hover:bg-[#9C9CA1] active:bg-[#E9E9E7] text-[#1D1D1F] shadow-raise-2 active:shadow-sink-1 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#D4D4D1]"
              >
                <span>Execute Action Plan</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#1D1D1F]" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
