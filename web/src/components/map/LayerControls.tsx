"use client";

import React from "react";
import { useMapStore, MapLayerVisibility } from "@/stores/useMapStore";
import { Layers, Eye, EyeOff } from "lucide-react";

const LAYER_CONFIGS: { key: keyof MapLayerVisibility; label: string; color: string }[] = [
  { key: "floodZones", label: "Flood Inundation Polygons", color: "#3B6CFF" },
  { key: "cycloneTrack", label: "Cyclone Track & Gale Wind", color: "#FF4D5E" },
  { key: "sosMarkers", label: "Live SOS Incident Pins", color: "#FF4D5E" },
  { key: "shelters", label: "Active Shelter Hubs", color: "#2FD07F" },
  { key: "hospitals", label: "Critical Care Hospitals", color: "#F5C542" },
  { key: "roadNetwork", label: "Submerged & Blocked Roads", color: "#FF8A3D" },
  { key: "ndrfUnits", label: "NDRF Boats & Rescue Units", color: "#4FB3FF" },
];

export function LayerControls() {
  const { layers, toggleLayer, setAllLayers, style, setStyle } = useMapStore();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="absolute top-4 right-4 z-20 pointer-events-auto">
      <div className="rounded-[18px] bg-[#101624]/90 backdrop-blur-xl border border-white/15 p-3.5 min-w-[260px] shadow-2xl text-[#F5F7FB]">
        {/* Toggle header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5F7FB] uppercase tracking-wider">
            <Layers className="w-4 h-4 text-[#3B6CFF]" />
            <span>GIS Map Layers</span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-[11px] text-[#3B6CFF] hover:text-white font-semibold px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
          >
            {isOpen ? "Minimize" : "Configure"}
          </button>
        </div>

        {isOpen && (
          <div className="mt-3 space-y-3">
            {/* Base Map Style */}
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
              <span className="text-[#9AA3B8] text-[11px]">Map Style:</span>
              <div className="flex gap-1 bg-[#161D2E] p-1 rounded-full border border-white/5">
                {(["dark", "satellite", "streets"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize transition-all cursor-pointer ${
                      style === s
                        ? "bg-[#3B6CFF] text-white shadow-sm font-bold"
                        : "text-[#9AA3B8] hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick bulk actions */}
            <div className="flex items-center justify-between text-[11px] text-[#9AA3B8] pb-1">
              <span>Data Overlays</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAllLayers(true)}
                  className="text-[#3B6CFF] hover:underline flex items-center gap-0.5 font-semibold cursor-pointer"
                >
                  <Eye className="w-3 h-3" /> All
                </button>
                <button
                  type="button"
                  onClick={() => setAllLayers(false)}
                  className="text-[#9AA3B8] hover:underline flex items-center gap-0.5 cursor-pointer"
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
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-all text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-[#F5F7FB] font-medium">{label}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isChecked
                          ? "bg-[#3B6CFF]/20 text-[#3B6CFF] border border-[#3B6CFF]/40"
                          : "bg-white/5 text-[#6B7488]"
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
