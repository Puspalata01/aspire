"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe2,
  MapPin,
  Layers,
  FileText,
  Radio,
  LogOut,
  Menu,
  ShieldAlert,
  BarChart3,
  Sliders,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Command Center", href: "/authority/dashboard", icon: Globe2 },
  { id: "map", label: "GIS Hazard Map", href: "/authority/map", icon: MapPin },
  { id: "risk", label: "Risk Matrix", href: "/authority/risk", icon: Layers },
  { id: "sos", label: "SOS Incident Queue", href: "/authority/sos", icon: Radio },
  { id: "analytics", label: "Impact Analytics", href: "/authority/analytics", icon: BarChart3 },
  { id: "settings", label: "System Config", href: "/authority/settings", icon: Sliders },
];

export function DarkGlobeRail() {
  const pathname = usePathname();

  return (
    <aside
      className="w-16 min-w-16 h-screen sticky top-0 flex flex-col items-center justify-between py-5 border-r border-white/10 z-30 select-none"
      style={{ backgroundColor: "#1B1A33" }}
      aria-label="Sidebar Navigation"
    >
      {/* Top: Brand Logo / Grid Icon */}
      <div className="flex flex-col items-center gap-6">
        <Link
          href="/authority/dashboard"
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center text-white transition-all shadow-sm group relative"
          title="ASPIRE Platform"
        >
          <ShieldAlert className="w-5 h-5 text-[#3B6CFF] group-hover:scale-105 transition-transform" />
          <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#101624] text-[#F5F7FB] border border-white/10 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
            ASPIRE Crisis Core
          </div>
        </Link>

        {/* Divider */}
        <div className="w-8 h-px bg-white/10" />

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/authority/dashboard"
                ? pathname === "/authority/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className="group relative flex items-center justify-center"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-white text-[#0A0E17] shadow-[0_0_16px_rgba(255,255,255,0.4)] font-bold scale-105"
                      : "text-[#9AA3B8] hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.75} />
                </div>

                {/* Tooltip */}
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#101624] text-[#F5F7FB] border border-white/10 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Settings / Menu & Logout */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          className="w-10 h-10 rounded-full text-[#9AA3B8] hover:text-white hover:bg-white/10 flex items-center justify-center transition-all group relative cursor-pointer"
          title="Operations Menu"
        >
          <Menu className="w-5 h-5" strokeWidth={1.75} />
          <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#101624] text-[#F5F7FB] border border-white/10 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
            Quick Actions
          </div>
        </button>

        <Link
          href="/login"
          className="w-10 h-10 rounded-full text-[#9AA3B8] hover:text-[#FF4D5E] hover:bg-red-500/10 flex items-center justify-center transition-all group relative"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.75} />
          <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#101624] text-[#FF4D5E] border border-white/10 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
            Exit Session
          </div>
        </Link>
      </div>
    </aside>
  );
}
