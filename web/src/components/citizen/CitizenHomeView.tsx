"use client";

import React, { useState } from "react";
import { CitizenSOSModal } from "./CitizenSOSModal";
import { MOCK_SHELTERS } from "@/lib/mock-data";
import { DangerLevelIndicator } from "@/components/shared/DangerLevelIndicator";
import { CapacityBar } from "@/components/shared/CapacityBar";
import {
  LifeBuoy,
  Shield,
  Navigation,
  PhoneCall,
  BookOpen,
  MapPin,
  Clock,
  AlertTriangle,
  ChevronRight,
  Home,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export function CitizenHomeView() {
  const [isSOSOpen, setIsSOSOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8 select-none">
      {/* 1. Critical Hazard Status Hero Banner with Danger Level Indicator */}
      <div className="rounded-[24px] border border-[#D4D4D1] bg-[#F1F1EF] p-6 sm:p-8 shadow-raise-2 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <DangerLevelIndicator
              level={4}
              label="FLASH RED ALERT: LEVEL 4"
            />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
              Cyclone VARUN Approaching Coast
            </h1>
            <p className="text-xs sm:text-sm text-[#4A4A4F] max-w-xl leading-relaxed">
              Wind speeds of 135 km/h. Sea surge expected in Puri & Konark sectors. Tidal inundation peak at 17:30 IST. Evacuate low-lying areas now.
            </p>
          </div>

          {/* Giant 1-Tap SOS Button */}
          <button
            onClick={() => setIsSOSOpen(true)}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-3 bg-[#F1F1EF] border-2 border-[#D64545] text-[#D64545] font-extrabold px-8 py-5 rounded-full shadow-raise-2 hover:shadow-raise-3 active:shadow-sink-1 transition-all cursor-pointer group"
          >
            <LifeBuoy className="w-8 h-8 animate-spin text-[#D64545]" style={{ animationDuration: "10s" }} />
            <div className="text-left">
              <span className="block text-xl font-black tracking-wider uppercase">
                PRESS SOS
              </span>
              <span className="text-[11px] text-[#4A4A4F] font-normal">
                Instant Rescue Uplink
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Quick Citizen Lifeline Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/citizen/shelters"
          className="p-4 rounded-[12px] border border-[#D4D4D1] bg-[#F1F1EF] shadow-raise-2 hover:shadow-raise-3 active:shadow-sink-1 transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 mx-auto rounded-full bg-[#F1F1EF] shadow-raise-1 text-[#2E9E6B] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Home className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#1D1D1F]">Find Shelter</h4>
          <p className="text-[10px] text-[#8A8A90]">Nearest cyclone hubs</p>
        </Link>

        <Link
          href="/citizen/safe-routes"
          className="p-4 rounded-[12px] border border-[#D4D4D1] bg-[#F1F1EF] shadow-raise-2 hover:shadow-raise-3 active:shadow-sink-1 transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 mx-auto rounded-full bg-[#F1F1EF] shadow-raise-1 text-[#2F6FE0] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Navigation className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#1D1D1F]">Safe Route</h4>
          <p className="text-[10px] text-[#8A8A90]">Unflooded high-ground</p>
        </Link>

        <Link
          href="/citizen/alerts"
          className="p-4 rounded-[12px] border border-[#D4D4D1] bg-[#F1F1EF] shadow-raise-2 hover:shadow-raise-3 active:shadow-sink-1 transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 mx-auto rounded-full bg-[#F1F1EF] shadow-raise-1 text-[#D99A1E] flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#1D1D1F]">Live Warnings</h4>
          <p className="text-[10px] text-[#8A8A90]">Official IMD & CWC</p>
        </Link>

        <Link
          href="/citizen/guidance"
          className="p-4 rounded-[12px] border border-[#D4D4D1] bg-[#F1F1EF] shadow-raise-2 hover:shadow-raise-3 active:shadow-sink-1 transition-all text-center space-y-2 group"
        >
          <div className="w-10 h-10 mx-auto rounded-full bg-[#F1F1EF] shadow-raise-1 text-[#4A4A4F] flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#1D1D1F]">Survival Guide</h4>
          <p className="text-[10px] text-[#8A8A90]">Works 100% offline</p>
        </Link>
      </div>

      {/* 3. Nearest Emergency Shelters List */}
      <div className="rounded-[24px] border border-[#D4D4D1] bg-[#F1F1EF] p-6 shadow-raise-2 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#D4D4D1]">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-[#2E9E6B]" />
            <h3 className="text-sm font-bold text-[#1D1D1F]">
              Nearest Designated Cyclone Shelters
            </h3>
          </div>
          <Link
            href="/citizen/shelters"
            className="text-xs text-[#2F6FE0] hover:underline flex items-center gap-1 font-semibold"
          >
            All Shelters <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {MOCK_SHELTERS.slice(0, 3).map((sh) => (
            <div
              key={sh.id}
              className="p-4 rounded-[16px] border border-[#D4D4D1] bg-[#F1F1EF] shadow-raise-1 hover:shadow-raise-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#1D1D1F]">{sh.name}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono shadow-raise-1 border ${
                      sh.status === "open"
                        ? "bg-[#F1F1EF] text-[#2E9E6B] border-[#2E9E6B]"
                        : "bg-[#F1F1EF] text-[#D64545] border-[#D64545]"
                    }`}
                  >
                    {sh.status}
                  </span>
                </div>
                <p className="text-[11px] text-[#4A4A4F] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#D64545]" />
                  {sh.address} • <strong className="text-[#2F6FE0]">{sh.distanceKm ?? sh.distance_km ?? 0} km away</strong>
                </p>
                <div className="flex gap-2 text-[10px] text-[#8A8A90] pt-1 flex-wrap">
                  {(sh.facilities || []).slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 rounded-full bg-[#E2E2E0] shadow-sink-1 text-[#4A4A4F]"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                <div className="w-full sm:w-44">
                  <CapacityBar
                    current={sh.currentOccupancy ?? sh.current_occupancy ?? 0}
                    total={sh.capacity}
                    label="Live Occupancy"
                    unit="ppl"
                  />
                </div>
                <a
                  href={`tel:${sh.contactPhone || sh.contact_phone || ""}`}
                  className="px-4 py-2 rounded-full bg-[#8E8E93] hover:bg-[#9C9CA1] active:shadow-sink-1 text-[#1D1D1F] text-xs font-semibold flex items-center gap-1.5 shadow-raise-1 transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call Shelter
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Emergency Government Hotlines */}
      <div className="rounded-[24px] border border-[#D4D4D1] bg-[#F1F1EF] p-5 shadow-raise-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-[#F1F1EF] text-[#2F6FE0] shadow-raise-1 border border-[#D4D4D1]">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-[#1D1D1F]">Emergency Helpline Numbers</h4>
            <p className="text-[11px] text-[#8A8A90]">Toll-free 24x7 control rooms</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href="tel:112"
            className="px-4 py-2 rounded-full bg-[#F1F1EF] hover:bg-[#E9E9E7] active:shadow-sink-1 text-[#1D1D1F] font-mono font-bold border border-[#D4D4D1] shadow-raise-1 transition-all"
          >
            National: 112
          </a>
          <a
            href="tel:1070"
            className="px-4 py-2 rounded-full bg-[#F1F1EF] hover:bg-[#E9E9E7] active:shadow-sink-1 text-[#1D1D1F] font-mono font-bold border border-[#D4D4D1] shadow-raise-1 transition-all"
          >
            State Relief: 1070
          </a>
          <a
            href="tel:1077"
            className="px-4 py-2 rounded-full bg-[#F1F1EF] hover:bg-[#E9E9E7] active:shadow-sink-1 text-[#1D1D1F] font-mono font-bold border border-[#D4D4D1] shadow-raise-1 transition-all"
          >
            District: 1077
          </a>
        </div>
      </div>

      {/* SOS Modal trigger */}
      <CitizenSOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
    </div>
  );
}
