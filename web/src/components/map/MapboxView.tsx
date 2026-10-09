"use client";

import React, { useEffect, useState } from "react";
import { useMapStore } from "@/stores/useMapStore";
import { api } from "@/lib/api";
import { SOSRequest, Shelter, Hospital, Resource } from "@/types";
import { LayerControls } from "./LayerControls";

import {
  ShieldAlert,
  Home,
  HeartPulse,
  Truck,
  Waves,
  Navigation,
  ZoomIn,
  ZoomOut,
  Compass,
} from "lucide-react";

export function MapboxView({ height = "100%" }: { height?: string }) {
  const { center, zoom, layers, setSelectedEntity, setViewport } = useMapStore();
  const [activeItem, setActiveItem] = useState<any>(null);
  const [sosList, setSosList] = useState<SOSRequest[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.getSOSRequests(),
      api.getShelters(),
      api.getHospitals(),
      api.getResources(),
    ]).then(([s, sh, h, r]) => {
      if (!isMounted) return;
      if (s && s.length > 0) setSosList(s);
      if (sh && sh.length > 0) setShelters(sh);
      if (h && h.length > 0) setHospitals(h);
      if (r && r.length > 0) setResources(r);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Fallback interactive vector canvas coordinates mapping
  // Map bounds: lat [19.65 -> 20.0], lng [85.6 -> 86.15]
  const minLat = 19.65;
  const maxLat = 20.05;
  const minLng = 85.55;
  const maxLng = 86.18;


  const projectToPct = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-[#05070D] border border-white/10 rounded-[20px] shadow-2xl p-1 select-none"
      style={{ height }}
    >
      {/* Top right layer controls */}
      <LayerControls />

      {/* Map Camera Zoom Overlay Buttons (Round Zoom Buttons) */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => setViewport(center, zoom + 0.5)}
          className="w-9 h-9 rounded-xl bg-[#101624]/85 text-[#9AA3B8] hover:text-white flex items-center justify-center transition-all border border-white/10 backdrop-blur-md shadow-lg cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewport(center, Math.max(2, zoom - 0.5))}
          className="w-9 h-9 rounded-xl bg-[#101624]/85 text-[#9AA3B8] hover:text-white flex items-center justify-center transition-all border border-white/10 backdrop-blur-md shadow-lg cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewport({ lat: 19.8135, lng: 85.8312 }, 9.5)}
          className="w-9 h-9 rounded-xl bg-[#101624]/85 text-[#3B6CFF] hover:text-white hover:bg-[#3B6CFF] flex items-center justify-center transition-all border border-white/10 backdrop-blur-md shadow-lg cursor-pointer"
          title="Reset Camera"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* GIS Coordinate Pill */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2.5 text-[11px] font-mono text-[#9AA3B8] bg-[#101624]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
        <span>LAT: {center.lat.toFixed(4)}°N</span>
        <span>LON: {center.lng.toFixed(4)}°E</span>
        <span>ZOOM: {zoom.toFixed(1)}</span>
        <span className="text-[#2FD07F] font-semibold">● WGS-84 ACTIVE</span>
      </div>

      {/* Interactive Map Visual Surface */}
      <div className="w-full h-full relative overflow-hidden bg-[#0A0E17]">
        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(#3B6CFF 1px, transparent 1px), radial-gradient(#161D2E 1px, #0A0E17 1px)`,
            backgroundSize: `36px 36px`,
          }}
        />

        {/* Coastal Contour & Inundation Zone (SVG Representation) */}
        {layers.floodZones && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
            <defs>
              <radialGradient id="cycloneSurge" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#D64545" stopOpacity="0.3" />
                <stop offset="60%" stopColor="#2F6FE0" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#8E8E93" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Surge Zone */}
            <circle cx="55%" cy="48%" r="180" fill="url(#cycloneSurge)" />
            {/* River Daya Delta Inundation Corridor */}
            <path
              d="M 220 180 Q 340 240 480 320 T 720 480"
              stroke="#2F6FE0"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              className="opacity-60 animate-pulse"
            />
          </svg>
        )}

        {/* Cyclone Eye & Track */}
        {layers.cycloneTrack && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: "60%",
              top: "45%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="relative flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border border-[#8E8E93]/40 animate-spin" style={{ animationDuration: "12s" }} />
              <div className="absolute w-32 h-32 rounded-full border border-[#2F6FE0]/40 animate-spin" style={{ animationDuration: "6s" }} />
              <div className="absolute w-8 h-8 rounded-full bg-[#F1F1EF] border border-[#2F6FE0] flex items-center justify-center shadow-raise-1">
                <span className="text-[9px] font-mono font-bold text-[#2F6FE0]">EYE</span>
              </div>
            </div>
          </div>
        )}

        {/* Coloured Zone Circles (Puri, Konark, Brahmagiri) */}
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ left: "45%", top: "52%" }}
        >
          <div className="w-36 h-36 rounded-full border-2 border-[#FF4D5E]/60 bg-[#FF4D5E]/10 animate-pulse" />
          <span className="absolute -top-3 px-2 py-0.5 rounded-full bg-[#101624] border border-[#FF4D5E] text-[#FF4D5E] text-[9px] font-mono font-bold shadow-lg">
            Puri Shoreline (Critical)
          </span>
        </div>

        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ left: "70%", top: "42%" }}
        >
          <div className="w-28 h-28 rounded-full border-2 border-[#FF8A3D]/60 bg-[#FF8A3D]/10" />
          <span className="absolute -top-3 px-2 py-0.5 rounded-full bg-[#101624] border border-[#FF8A3D] text-[#FF8A3D] text-[9px] font-mono font-bold shadow-lg">
            Konark Delta (High)
          </span>
        </div>

        {/* SOS Incident Word-Labelled Pill Markers */}
        {layers.sosMarkers &&
          sosList.map((sos) => {
            const { x, y } = projectToPct(sos.location.lat, sos.location.lng);

            return (
              <div
                key={sos.id}
                onClick={() => {
                  setActiveItem(sos);
                  setSelectedEntity({ type: "sos", id: sos.id, data: sos });
                }}
                className="absolute z-10 cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {/* Word-Labelled Pill Marker */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#101624]/90 border border-[#FF4D5E] shadow-[0_0_12px_rgba(255,77,94,0.3)] hover:scale-110 transition-transform">
                  <span className="w-2 h-2 rounded-full bg-[#FF4D5E] animate-ping" />
                  <span className="text-[10px] font-mono font-bold text-[#FF4D5E]">
                    SOS #{sos.id.slice(-3)} ({sos.peopleCount}p)
                  </span>
                </div>

                {/* Marker tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 min-w-[160px] p-2.5 rounded-[12px] bg-[#101624] border border-white/15 text-[#F5F7FB] shadow-2xl text-left pointer-events-none">
                  <p className="font-bold text-xs text-[#FF4D5E] uppercase tracking-wide">
                    SOS #{sos.id.toUpperCase()}
                  </p>
                  <p className="text-[11px] font-semibold text-[#F5F7FB] truncate">
                    {sos.requesterName} ({sos.peopleCount} ppl)
                  </p>
                  <p className="text-[10px] text-[#9AA3B8] truncate">{sos.address}</p>
                </div>
              </div>
            );
          })}

        {/* Shelter Word-Labelled Pill Markers */}
        {layers.shelters &&
          shelters.map((sh) => {
            const { x, y } = projectToPct(sh.location.lat, sh.location.lng);
            return (
              <div
                key={sh.id}
                onClick={() => {
                  setActiveItem(sh);
                  setSelectedEntity({ type: "shelter", id: sh.id, data: sh });
                }}
                className="absolute z-10 cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {/* Word-Labelled Pill Marker */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#101624]/90 border border-[#2FD07F] shadow-[0_0_12px_rgba(47,208,127,0.3)] hover:scale-110 transition-transform text-[#2FD07F]">
                  <Home className="w-3.5 h-3.5 text-[#2FD07F]" />
                  <span className="text-[10px] font-bold text-[#F5F7FB]">
                    {sh.name.split(" ")[0]} Hub
                  </span>
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 min-w-[150px] p-2.5 rounded-[12px] bg-[#101624] border border-white/15 text-[#F5F7FB] shadow-2xl pointer-events-none">
                  <p className="font-bold text-xs text-[#2FD07F]">Shelter Hub</p>
                  <p className="text-[11px] font-semibold text-[#F5F7FB] truncate">{sh.name}</p>
                  <p className="text-[10px] text-[#9AA3B8]">
                    Cap: {sh.currentOccupancy ?? sh.current_occupancy ?? 0}/{sh.capacity}
                  </p>
                </div>
              </div>
            );
          })}

        {/* Hospital Word-Labelled Pill Markers */}
        {layers.hospitals &&
          hospitals.map((hosp) => {
            const { x, y } = projectToPct(hosp.location.lat, hosp.location.lng);
            return (
              <div
                key={hosp.id}
                onClick={() => {
                  setActiveItem(hosp);
                  setSelectedEntity({ type: "hospital", id: hosp.id, data: hosp });
                }}
                className="absolute z-10 cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {/* Word-Labelled Pill Marker */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#101624]/90 border border-[#3B6CFF] shadow-[0_0_12px_rgba(59,108,255,0.3)] hover:scale-110 transition-transform text-[#3B6CFF]">
                  <HeartPulse className="w-3.5 h-3.5 text-[#3B6CFF]" />
                  <span className="text-[10px] font-bold text-[#F5F7FB]">
                    {hosp.name.split(" ")[0]} ICU
                  </span>
                </div>
              </div>
            );
          })}

        {/* NDRF Rescue Boats & Assets */}
        {layers.ndrfUnits &&
          resources.map((res) => {
            const { x, y } = projectToPct(res.location.lat, res.location.lng);
            return (
              <div
                key={res.id}
                onClick={() => {
                  setActiveItem(res);
                  setSelectedEntity({ type: "resource", id: res.id, data: res });
                }}
                className="absolute z-10 cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className="w-6 h-6 rounded-[8px] bg-[#F1F1EF] border border-[#8E8E93] text-[#4A4A4F] flex items-center justify-center shadow-raise-1 hover:scale-125 transition-transform">
                  <Truck className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}

        {/* Floating Details Drawer if an item is clicked */}
        {activeItem && (
          <div className="absolute top-4 left-4 z-20 max-w-sm rounded-[24px] border border-[#D4D4D1] bg-[#F1F1EF] p-5 shadow-raise-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#2F6FE0] font-bold">
                  GIS Element Inspector
                </span>
                <h4 className="text-sm font-bold text-[#1D1D1F] mt-0.5">
                  {activeItem.name || activeItem.requesterName || activeItem.id}
                </h4>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="w-7 h-7 rounded-full bg-[#F1F1EF] shadow-raise-1 hover:shadow-raise-2 active:shadow-sink-1 text-[#4A4A4F] flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#4A4A4F] mt-2">
              {activeItem.description || activeItem.address || activeItem.capacity || "Operational Status: Active"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
