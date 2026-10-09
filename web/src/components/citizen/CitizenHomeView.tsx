"use client";

import React, { useEffect, useState } from "react";
import { CitizenSOSModal } from "./CitizenSOSModal";
import { api } from "@/lib/api";
import { Shelter } from "@/types";
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
  Wind,
  Waves,
} from "lucide-react";
import Link from "next/link";

export function CitizenHomeView() {
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [shelters, setShelters] = useState<Shelter[]>([]);

  useEffect(() => {
    api.getShelters().then((data) => {
      if (data && data.length > 0) {
        setShelters(data);
      }
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 select-none">
      {/* 1. Critical Hazard Status Hero Banner with Danger Level Indicator */}
      <div className="rounded-[24px] border border-[#FF4D5E]/30 bg-gradient-to-br from-[#121B2E] via-[#0E1524] to-[#0A0F1D] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF4D5E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <DangerLevelIndicator
              level={4}
              label="FLASH RED ALERT: LEVEL 4"
            />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FB] tracking-tight">
              Cyclone Dana Approaching Coast
            </h1>
            <p className="text-xs sm:text-sm text-[#8E99AF] max-w-xl leading-relaxed">
              Category 4 equivalent storm with sustained winds of 145 km/h. High storm surge expected in Puri & Konark sectors. Immediate evacuation mandated within 5km shoreline.
            </p>
          </div>

          {/* Giant 1-Tap SOS Button */}
          <button
            onClick={() => setIsSOSOpen(true)}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-3 bg-[#FF4D5E]/15 hover:bg-[#FF4D5E]/25 border-2 border-[#FF4D5E] text-[#FF4D5E] hover:text-white font-extrabold px-8 py-5 rounded-2xl shadow-[0_0_30px_rgba(255,77,94,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <LifeBuoy className="w-8 h-8 animate-spin text-[#FF4D5E] group-hover:text-white" style={{ animationDuration: "10s" }} />
            <div className="text-left">
              <span className="block text-xl font-black tracking-wider uppercase leading-none">
                PRESS SOS
              </span>
              <span className="text-[11px] text-[#CBD5E1] font-normal leading-tight mt-1 block">
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
          className="p-4 rounded-[18px] border border-white/10 bg-[#101624]/80 hover:bg-[#161D2E] hover:border-[#2FD07F]/40 shadow-lg transition-all text-center space-y-2 group cursor-pointer"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-[#2FD07F]/15 text-[#2FD07F] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Home className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#F5F7FB]">Find Shelter</h4>
          <p className="text-[10px] text-[#8E99AF]">Nearest cyclone hubs</p>
        </Link>

        <Link
          href="/citizen/safe-routes"
          className="p-4 rounded-[18px] border border-white/10 bg-[#101624]/80 hover:bg-[#161D2E] hover:border-[#3B6CFF]/40 shadow-lg transition-all text-center space-y-2 group cursor-pointer"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-[#3B6CFF]/15 text-[#4FB3FF] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Navigation className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#F5F7FB]">Safe Route</h4>
          <p className="text-[10px] text-[#8E99AF]">Unflooded high-ground</p>
        </Link>

        <Link
          href="/citizen/alerts"
          className="p-4 rounded-[18px] border border-white/10 bg-[#101624]/80 hover:bg-[#161D2E] hover:border-[#F5C542]/40 shadow-lg transition-all text-center space-y-2 group cursor-pointer"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-[#F5C542]/15 text-[#F5C542] flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#F5F7FB]">Live Warnings</h4>
          <p className="text-[10px] text-[#8E99AF]">Official IMD & OSDMA</p>
        </Link>

        <Link
          href="/citizen/guidance"
          className="p-4 rounded-[18px] border border-white/10 bg-[#101624]/80 hover:bg-[#161D2E] hover:border-white/20 shadow-lg transition-all text-center space-y-2 group cursor-pointer"
        >
          <div className="w-10 h-10 mx-auto rounded-xl bg-white/10 text-[#CBD5E1] flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#F5F7FB]">Survival Guide</h4>
          <p className="text-[10px] text-[#8E99AF]">Works offline</p>
        </Link>
      </div>

      {/* 3. Nearest Emergency Shelters List */}
      <div className="rounded-[24px] border border-white/10 bg-[#0E1524]/80 p-6 backdrop-blur-2xl shadow-[0_16px_36px_rgba(0,0,0,0.5)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-[#2FD07F]" />
            <h3 className="text-sm font-bold text-[#F5F7FB]">
              Nearest Designated Cyclone Shelters
            </h3>
          </div>
          <Link
            href="/citizen/shelters"
            className="text-xs text-[#4FB3FF] hover:underline flex items-center gap-1 font-semibold"
          >
            All Shelters <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {shelters.slice(0, 3).map((sh) => (
            <div
              key={sh.id}
              className="p-4 rounded-xl border border-white/5 bg-[#080D19]/80 hover:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#F5F7FB]">{sh.name}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border ${
                      sh.status === "open"
                        ? "bg-[#2FD07F]/20 text-[#2FD07F] border-[#2FD07F]/40"
                        : "bg-[#FF4D5E]/20 text-[#FF4D5E] border-[#FF4D5E]/40"
                    }`}
                  >
                    {sh.status}
                  </span>
                </div>
                <p className="text-[11px] text-[#8E99AF] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#FF4D5E]" />
                  {sh.address} • <strong className="text-[#4FB3FF]">{sh.distanceKm ?? sh.distance_km ?? 0} km away</strong>
                </p>
                <div className="flex gap-2 text-[10px] text-[#6B7488] pt-1 flex-wrap">
                  {(sh.facilities || []).slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 rounded-full bg-white/5 text-[#8E99AF] border border-white/5"
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
                  className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F7FB] text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call Shelter
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Emergency Government Hotlines */}
      <div className="rounded-[24px] border border-white/10 bg-[#0E1524]/80 p-5 backdrop-blur-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#3B6CFF]/20 text-[#4FB3FF] border border-[#3B6CFF]/30">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-[#F5F7FB]">Emergency Helpline Numbers</h4>
            <p className="text-[11px] text-[#8E99AF]">Toll-free 24x7 state control rooms</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href="tel:112"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F7FB] font-mono font-bold border border-white/10 shadow-sm transition-all"
          >
            National: 112
          </a>
          <a
            href="tel:1070"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F7FB] font-mono font-bold border border-white/10 shadow-sm transition-all"
          >
            State Relief: 1070
          </a>
          <a
            href="tel:1077"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#F5F7FB] font-mono font-bold border border-white/10 shadow-sm transition-all"
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
