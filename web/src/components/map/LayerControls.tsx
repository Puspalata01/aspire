"use client";

import React from "react";
import { useMapStore, MapLayerVisibility } from "@/stores/useMapStore";
import { Layers, Eye, EyeOff } from "lucide-react";

const LAYER_CONFIGS: { key: keyof MapLayerVisibility; label: string; color: string }[] = [
  { key: "floodZones", label: "Flood Inundation Polygons", color: "#7C3AED" },
  { key: "cycloneTrack", label: "Cyclone Track & Gale Wind", color: "#DC2626" },
  { key: "sosMarkers", label: "Live SOS Incident Pins", color: "#DC2626" },
  { key: "shelters", label: "Active Shelter Hubs", color: "#059669" },
  { key: "hospitals", label: "Critical Care Hospitals", color: "#D97706" },
  { key: "roadNetwork", label: "Submerged & Blocked Roads", color: "#EA580C" },
  { key: "ndrfUnits", label: "NDRF Boats & Rescue Units", color: "#7C3AED" },
];

export function LayerControls() {
  const { layers, toggleLayer, setAllLayers, style, setStyle } = useMapStore();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="absolute top-4 right-4 z-20 pointer-events-auto select-none">
      <div className="rounded-[18px] bg-white/95 backdrop-blur-xl border border-[#E7E2DA] p-3.5 min-w-[260px] shadow-[0_12px_36px_rgba(124,58,237,0.08)] text-[#1C1929]">
        {/* Toggle header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#E7E2DA]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1C1929] uppercase tracking-wider">
            <Layers className="w-4 h-4 text-[#7C3AED]" />
            <span>GIS Map Layers</span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-[11px] text-[#7C3AED] hover:text-[#6D28D9] font-semibold px-2 py-0.5 rounded-full bg-[#F8F7F4] hover:bg-[#F3E8FF] border border-[#E7E2DA] transition-all cursor-pointer shadow-xs"
          >
            {isOpen ? "Minimize" : "Configure"}
          </button>
        </div>

        {isOpen && (
          <div className="mt-3 space-y-3">
            {/* Base Map Style */}
            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E7E2DA]">
              <span className="text-[#5D5775] text-[11px] font-medium">Map Style:</span>
              <div className="flex gap-1 bg-[#F8F7F4] p-1 rounded-full border border-[#E7E2DA]">
                {(["dark", "satellite", "streets"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize transition-all cursor-pointer ${
                      style === s
                        ? "bg-[#7C3AED] text-white shadow-xs font-bold"
                        : "text-[#5D5775] hover:text-[#1C1929]"
                    }`}
                  >
                    {s === "dark" ? "light" : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick bulk actions */}
            <div className="flex items-center justify-between text-[11px] text-[#5D5775] pb-1 font-medium">
              <span>Data Overlays</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAllLayers(true)}
                  className="text-[#7C3AED] hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                >
                  <Eye className="w-3 h-3" /> All
                </button>
                <button
                  type="button"
                  onClick={() => setAllLayers(false)}
                  className="text-[#767092] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <EyeOff className="w-3 h-3" /> Clear
                </button>
              </div>
            </div>

            {/* Layer checkboxes */}
            <div className="space-y-1.5">
              {LAYER_CONFIGS.map(({ key, label, color }) => {
                const isChecked = layers[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleLayer(key)}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#F8F7F4] transition-all text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-[#1C1929] font-medium">{label}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isChecked
                          ? "bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE]"
                          : "bg-[#F8F7F4] text-[#767092]"
                      }`}
                    >
                      {isChecked ? "ON" : "OFF"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
