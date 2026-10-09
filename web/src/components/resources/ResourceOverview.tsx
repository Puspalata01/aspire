"use client";

import React, { useState } from "react";
import { MOCK_RESOURCES } from "@/lib/mock-data";
import {
  Truck,
  Fuel,
  Clock,
  LifeBuoy,
  Radio,
  HeartPulse,
  Send,
  Droplets,
  Users,
} from "lucide-react";
import { toast } from "sonner";

export function ResourceOverview() {
  const [filterType, setFilterType] = useState<string>("all");

  const handleDeploy = (name: string) => {
    toast.success(`Priority deployment transmitted: ${name}`);
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "rescue_boat":
        return LifeBuoy;
      case "helicopter":
        return Radio;
      case "water_tanker":
        return Droplets;
      case "medical_team":
        return HeartPulse;
      default:
        return Truck;
    }
  };

  const filtered = MOCK_RESOURCES.filter((r) => {
    if (filterType === "all") return true;
    return r.type === filterType;
  });

  return (
    <div className="space-y-4 select-none">
      {/* Type Filter Bar */}
      <div className="flex items-center justify-between bg-[#101624]/75 p-3 rounded-[16px] border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#9AA3B8]">Fleet Category:</span>
          {[
            { id: "all", label: "All Assets (5)" },
            { id: "rescue_boat", label: "Boats 🚤" },
            { id: "helicopter", label: "Airlift 🚁" },
            { id: "water_tanker", label: "Tankers 💧" },
            { id: "medical_team", label: "Trauma Teams 🩺" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === tab.id
                  ? "bg-[#3B6CFF] text-white shadow-[0_0_12px_rgba(59,108,255,0.4)]"
                  : "bg-[#161D2E] text-[#9AA3B8] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-[#6B7488] font-mono">
          <span>🟢 Deployed</span>
          <span>🟡 In Transit</span>
          <span>🔵 Available</span>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((res) => {
          const Icon = getVehicleIcon(res.type);
          const fuel = res.fuelPct ?? 100;
          const isLowFuel = fuel < 40;
          const isMidFuel = fuel >= 40 && fuel < 75;

          return (
            <div
              key={res.id}
              className="p-5 rounded-[18px] bg-[#101624]/75 border border-white/10 backdrop-blur-xl shadow-lg flex flex-col justify-between gap-4 hover:border-white/20 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#3B6CFF] shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#F5F7FB] leading-tight">
                      {res.name}
                    </h4>
                    <p className="text-[10px] text-[#6B7488] font-mono mt-0.5">
                      Assigned: {res.assignedTo}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border shrink-0 ${
                    res.status === "deployed"
                      ? "bg-[#2FD07F]/20 text-[#2FD07F] border-[#2FD07F]/40"
                      : res.status === "in_transit"
                      ? "bg-[#F5C542]/20 text-[#F5C542] border-[#F5C542]/40"
                      : "bg-[#3B6CFF]/20 text-[#3B6CFF] border-[#3B6CFF]/40"
                  }`}
                >
                  {res.status.replace("_", " ")}
                </span>
              </div>

              {/* Visual Logistics Details (Show Don't Tell) */}
              <div className="bg-[#161D2E]/80 p-3.5 rounded-[14px] border border-white/5 space-y-2.5 text-xs">
                {/* Capacity */}
                <div className="flex items-center justify-between text-[#9AA3B8]">
                  <span className="text-[11px] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#3B6CFF]" /> Load Payload:
                  </span>
                  <span className="font-bold text-[#F5F7FB]">{res.capacity}</span>
                </div>

                {/* Visual Battery / Fuel Tank Meter */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#9AA3B8] flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5 text-[#F5C542]" /> Fuel / Battery:
                    </span>
                    <span className={`font-mono font-bold ${
                      isLowFuel ? "text-[#FF4D5E]" : isMidFuel ? "text-[#F5C542]" : "text-[#2FD07F]"
                    }`}>
                      {fuel}%
                    </span>
                  </div>

                  {/* Segmented Fuel Bar */}
                  <div className="h-2 w-full bg-[#101624] rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isLowFuel
                          ? "bg-[#FF4D5E] shadow-[0_0_8px_#FF4D5E]"
                          : isMidFuel
                          ? "bg-[#F5C542]"
                          : "bg-[#2FD07F] shadow-[0_0_8px_#2FD07F]"
                      }`}
                      style={{ width: `${fuel}%` }}
                    />
                  </div>
                </div>

                {/* Telemetry Ping */}
                <div className="flex justify-between items-center text-[10px] text-[#6B7488] pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#3B6CFF]" /> GPS Ping: {res.lastPing}
                  </span>
                  <span className="text-[#2FD07F] font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2FD07F] animate-pulse" />
                    Live Link
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleDeploy(res.name)}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-[#3B6CFF] text-[#F5F7FB] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10 hover:border-transparent"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {res.status === "deployed" ? "Retask Coordinates" : "Mobilize Asset"}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
