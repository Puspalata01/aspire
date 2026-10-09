"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowRight,
  Radio,
  LifeBuoy,
  Cpu,
  Workflow,
  MapPin,
  TrendingUp,
  Layers,
  HeartPulse,
  Home,
  CheckCircle2,
} from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#E9E9E7] text-[#4A4A4F] flex flex-col selection:bg-[#2F6FE0] selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-[#D4D4D1] bg-[#F1F1EF] sticky top-0 z-50 px-6 lg:px-12 h-16 flex items-center justify-between shadow-raise-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#F1F1EF] text-[#2F6FE0] border border-[#D4D4D1] shadow-raise-1 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-lg text-[#1D1D1F] tracking-wider">
                {APP_CONFIG.name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F1F1EF] text-[#2F6FE0] border border-[#D4D4D1] shadow-raise-1">
                AI DISASTER OS
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/authority/dashboard"
            className="px-4 py-2 rounded-full text-xs font-semibold bg-[#F1F1EF] text-[#1D1D1F] border border-[#D4D4D1] shadow-raise-1 hover:shadow-raise-2 active:shadow-sink-1 transition-all"
          >
            Authority Portal
          </Link>
          <Link
            href="/citizen/home"
            className="px-4 py-2 rounded-full text-xs font-semibold bg-[#8E8E93] hover:bg-[#9C9CA1] text-[#1D1D1F] shadow-raise-2 active:shadow-sink-1 transition-all"
          >
            Citizen Lifeline
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-6 lg:px-12 flex-1 flex flex-col justify-center">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F1F1EF] border border-[#D4D4D1] text-xs text-[#4A4A4F] shadow-raise-1">
            <span className="w-2 h-2 rounded-full bg-[#D64545] animate-ping" />
            <span className="font-mono font-semibold text-[#1D1D1F]">
              LIVE DISASTER SIMULATION:
            </span>
            <span className="text-[#D64545] font-bold">Cyclone VARUN Category 4</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#1D1D1F] leading-tight">
            From Warning <br />
            <span className="text-[#2F6FE0]">
              to Coordinated Action.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#4A4A4F] max-w-2xl mx-auto leading-relaxed">
            AI-powered spatial intelligence platform bridging state crisis command centers with frontline citizens — featuring hydrodynamic breach forecasting, automated triage, and zero-casualty evacuation routing.
          </p>

          {/* Dual Entry Action Portals */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/authority/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#8E8E93] hover:bg-[#9C9CA1] active:bg-[#E9E9E7] active:shadow-sink-1 text-[#1D1D1F] font-bold text-sm flex items-center justify-center gap-2 shadow-raise-2 transition-all cursor-pointer"
            >
              <span>Launch Authority Command HQ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/citizen/home"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#F1F1EF] hover:shadow-raise-3 text-[#D64545] border-2 border-[#D64545] font-bold text-sm flex items-center justify-center gap-2 shadow-raise-2 active:shadow-sink-1 transition-all cursor-pointer"
            >
              <LifeBuoy className="w-4 h-4 text-[#D64545]" />
              <span>Open Citizen Emergency Portal</span>
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="max-w-6xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="p-6 rounded-[24px] border border-[#D4D4D1] bg-[#F1F1EF] shadow-raise-2 space-y-3.5">
            <div className="w-11 h-11 rounded-full bg-[#F1F1EF] text-[#2F6FE0] border border-[#D4D4D1] shadow-raise-1 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F]">AI Predictive Hydrodynamics</h3>
            <p className="text-xs text-[#4A4A4F] leading-relaxed">
              Ensemble machine learning models ingest Sentinel-1 radar, Doppler velocities, and river gauges to forecast embankment breach 6.5 hours before occurrence.
            </p>
          </div>

          <div className="p-6 rounded-[24px] border border-[#D4D4D1] bg-[#F1F1EF] shadow-raise-2 space-y-3.5">
            <div className="w-11 h-11 rounded-full bg-[#F1F1EF] text-[#D64545] border border-[#D4D4D1] shadow-raise-1 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F]">Zero-Friction Citizen SOS</h3>
            <p className="text-xs text-[#4A4A4F] leading-relaxed">
              1-tap mobile GPS distress beacon with reverse geocoding, medical triage urgency scoring, and automated nearest NDRF boat team dispatch.
            </p>
          </div>

          <div className="p-6 rounded-[24px] border border-[#D4D4D1] bg-[#F1F1EF] shadow-raise-2 space-y-3.5">
            <div className="w-11 h-11 rounded-full bg-[#F1F1EF] text-[#2F6FE0] border border-[#D4D4D1] shadow-raise-1 flex items-center justify-center">
              <Workflow className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F]">Systemic Domino Cascade Analysis</h3>
            <p className="text-xs text-[#4A4A4F] leading-relaxed">
              Graph neural networks map interdependencies between electrical substations, water filtration plants, hospital backup power, and bridge scours.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#D4D4D1] bg-[#F1F1EF] py-6 px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8A8A90] gap-3">
        <p>© 2026 ASPIRE — AI Disaster Intelligence & Response Platform.</p>
        <div className="flex gap-4">
          <Link href="/authority/dashboard" className="hover:text-[#1D1D1F] transition-colors">
            HQ Dashboard
          </Link>
          <Link href="/citizen/home" className="hover:text-[#1D1D1F] transition-colors">
            Citizen Home
          </Link>
          <Link href="/authority/simulation" className="hover:text-[#1D1D1F] transition-colors">
            What-If Simulator
          </Link>
        </div>
      </footer>
    </div>
  );
}
