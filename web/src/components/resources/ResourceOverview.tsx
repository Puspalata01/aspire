"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Resource } from "@/types";
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
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    api.getResources().then((data) => {
      if (data && data.length > 0) {
        setResources(data);
      }
    });
  }, []);

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

  const filtered = resources.filter((r) => {
    if (filterType === "all") return true;
    return r.type === filterType;
  });

  return (
    <div className="space-y-4 select-none">
      {/* Type Filter Bar */}
      <div className="flex items-center justify-between bg-white/95 p-3 rounded-[16px] border border-[#E7E2DA] shadow-[0_8px_20px_rgba(124,58,237,0.04)] backdrop-blur-xl">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#5D5775]">Fleet Category:</span>
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
                  ? "bg-[#7C3AED] text-white shadow-[0_4px_14px_rgba(124,58,237,0.3)]"
                  : "bg-[#F8F7F4] text-[#5D5775] hover:text-[#1C1929]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-[#767092] font-mono">
          <span>🟢 Deployed</span>
          <span>🟡 In Transit</span>
          <span>🟣 Available</span>
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
              className="p-5 rounded-[18px] bg-white/95 border border-[#E7E2DA] backdrop-blur-xl shadow-[0_8px_24px_rgba(124,58,237,0.04)] flex flex-col justify-between gap-4 hover:border-[#7C3AED]/30 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F8F7F4] border border-[#E7E2DA] flex items-center justify-center text-[#7C3AED] shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1C1929] leading-tight">
                      {res.name}
                    </h4>
                    <p className="text-[10px] text-[#767092] font-mono mt-0.5">
                      Assigned: {res.assignedTo}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border shrink-0 ${
                    res.status === "deployed"
                      ? "bg-emerald-50 text-[#059669] border-emerald-200"
                      : res.status === "in_transit"
                      ? "bg-amber-50 text-[#D97706] border-amber-200"
                      : "bg-purple-50 text-[#7C3AED] border-purple-200"
                  }`}
                >
                  {res.status.replace("_", " ")}
                </span>
              </div>

              {/* Visual Logistics Details */}
              <div className="bg-[#F8F7F4] p-3.5 rounded-[14px] border border-[#E7E2DA] space-y-2.5 text-xs">
                {/* Capacity */}
                <div className="flex items-center justify-between text-[#5D5775]">
                  <span className="text-[11px] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#7C3AED]" /> Load Payload:
                  </span>
                  <span className="font-bold text-[#1C1929]">{res.capacity}</span>
                </div>

                {/* Visual Battery / Fuel Tank Meter */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#5D5775] flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5 text-[#D97706]" /> Fuel / Battery:
                    </span>
                    <span className={`font-mono font-bold ${
                      isLowFuel ? "text-[#DC2626]" : isMidFuel ? "text-[#D97706]" : "text-[#059669]"
                    }`}>
                      {fuel}%
                    </span>
                  </div>

                  {/* Segmented Fuel Bar */}
                  <div className="h-2 w-full bg-[#E4DFD5] rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isLowFuel
                          ? "bg-[#DC2626]"
                          : isMidFuel
                          ? "bg-[#D97706]"
                          : "bg-[#059669]"
                      }`}
                      style={{ width: `${fuel}%` }}
                    />
                  </div>
                </div>

                {/* Telemetry Ping */}
                <div className="flex justify-between items-center text-[10px] text-[#767092] pt-1 border-t border-[#E7E2DA]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#7C3AED]" /> GPS Ping: {res.lastPing}
                  </span>
                  <span className="text-[#059669] font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                    Live Link
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleDeploy(res.name)}
                className="w-full py-2 rounded-xl bg-[#F8F7F4] hover:bg-[#7C3AED] text-[#1C1929] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#E7E2DA] hover:border-transparent shadow-xs"
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
