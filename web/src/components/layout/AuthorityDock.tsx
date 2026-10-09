"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Map,
  Flame,
  TrendingUp,
  Truck,
  Home,
  HeartPulse,
  AlertTriangle,
  Cpu,
  Workflow,
  Navigation,
  BarChart3,
  Settings,
  ChevronUp,
  Pin,
  PinOff,
  LifeBuoy,
  Shield,
  Camera,
  Bell,
  BookOpen,
  ArrowRightLeft,
} from "lucide-react";

interface DockItem {
  id: string;
  label: string;
  shortLabel: string;
  href: string;
  icon: React.ElementType;
  badge?: string | null;
  gradient: string;
  iconColor: string;
}

const AUTHORITY_DOCK_ITEMS: DockItem[] = [
  {
    id: "dashboard",
    label: "Command Dashboard",
    shortLabel: "Dashboard",
    href: "/authority/dashboard",
    icon: LayoutDashboard,
    gradient: "from-[#7C3AED] to-[#6D28D9]",
    iconColor: "text-white",
  },
  {
    id: "map",
    label: "GIS Hazard Map",
    shortLabel: "GIS Map",
    href: "/authority/map",
    icon: Map,
    badge: "LIVE",
    gradient: "from-[#10B981] to-[#047857]",
    iconColor: "text-white",
  },
  {
    id: "risk",
    label: "AI Risk Engine",
    shortLabel: "Risk Matrix",
    href: "/authority/risk",
    icon: Flame,
    gradient: "from-[#F59E0B] to-[#D97706]",
    iconColor: "text-white",
  },
  {
    id: "impact",
    label: "Impact Analysis",
    shortLabel: "Loss Impact",
    href: "/authority/impact",
    icon: TrendingUp,
    gradient: "from-[#8B5CF6] to-[#6D28D9]",
    iconColor: "text-white",
  },
  {
    id: "resources",
    label: "Resource Deploy",
    shortLabel: "Resources",
    href: "/authority/resources",
    icon: Truck,
    gradient: "from-[#06B6D4] to-[#0891B2]",
    iconColor: "text-white",
  },
  {
    id: "shelters",
    label: "Shelter Capacity",
    shortLabel: "Shelters",
    href: "/authority/shelters",
    icon: Home,
    gradient: "from-[#14B8A6] to-[#0F766E]",
    iconColor: "text-white",
  },
  {
    id: "hospitals",
    label: "Hospitals & ICUs",
    shortLabel: "Hospitals",
    href: "/authority/hospitals",
    icon: HeartPulse,
    gradient: "from-[#EC4899] to-[#BE185D]",
    iconColor: "text-white",
  },
  {
    id: "sos",
    label: "Emergency SOS Queue",
    shortLabel: "SOS Triage",
    href: "/authority/sos",
    icon: AlertTriangle,
    badge: "14",
    gradient: "from-[#EF4444] to-[#B91C1C]",
    iconColor: "text-white",
  },
  {
    id: "simulation",
    label: "What-If Simulator",
    shortLabel: "Simulator",
    href: "/authority/simulation",
    icon: Cpu,
    badge: "AI",
    gradient: "from-[#6366F1] to-[#4338CA]",
    iconColor: "text-white",
  },
  {
    id: "cascade",
    label: "Cascade Failure Analysis",
    shortLabel: "Cascades",
    href: "/authority/cascade",
    icon: Workflow,
    gradient: "from-[#3B82F6] to-[#1D4ED8]",
    iconColor: "text-white",
  },
  {
    id: "evacuation",
    label: "Evacuation Planner",
    shortLabel: "Evacuation",
    href: "/authority/evacuation",
    icon: Navigation,
    gradient: "from-[#F97316] to-[#C2410C]",
    iconColor: "text-white",
  },
  {
    id: "analytics",
    label: "Historical Analytics",
    shortLabel: "Analytics",
    href: "/authority/analytics",
    icon: BarChart3,
    gradient: "from-[#A855F7] to-[#7E22CE]",
    iconColor: "text-white",
  },
];

const CITIZEN_DOCK_ITEMS: DockItem[] = [
  {
    id: "citizen-home",
    label: "Citizen Lifeline",
    shortLabel: "Lifeline",
    href: "/citizen/home",
    icon: Home,
    gradient: "from-[#7C3AED] to-[#6D28D9]",
    iconColor: "text-white",
  },
  {
    id: "citizen-map",
    label: "Live Safe Map",
    shortLabel: "Safe Map",
    href: "/citizen/map",
    icon: Map,
    badge: "LIVE",
    gradient: "from-[#10B981] to-[#047857]",
    iconColor: "text-white",
  },
  {
    id: "citizen-shelters",
    label: "Nearby Shelters",
    shortLabel: "Shelters",
    href: "/citizen/shelters",
    icon: Shield,
    badge: "GPS",
    gradient: "from-[#14B8A6] to-[#0F766E]",
    iconColor: "text-white",
  },
  {
    id: "citizen-routes",
    label: "Safe Evac Routes",
    shortLabel: "Evac Routes",
    href: "/citizen/safe-routes",
    icon: Navigation,
    gradient: "from-[#8B5CF6] to-[#6D28D9]",
    iconColor: "text-white",
  },
  {
    id: "citizen-sos",
    label: "Emergency SOS",
    shortLabel: "SOS Beacon",
    href: "/citizen/sos",
    icon: LifeBuoy,
    badge: "SOS",
    gradient: "from-[#EF4444] to-[#B91C1C]",
    iconColor: "text-white",
  },
  {
    id: "citizen-report",
    label: "Report Hazard (Photo & GPS)",
    shortLabel: "Photo Report",
    href: "/citizen/reports",
    icon: Camera,
    gradient: "from-[#06B6D4] to-[#0891B2]",
    iconColor: "text-white",
  },
  {
    id: "citizen-alerts",
    label: "Local Warnings",
    shortLabel: "Geo-Alerts",
    href: "/citizen/alerts",
    icon: Bell,
    badge: "ALERT",
    gradient: "from-[#F59E0B] to-[#D97706]",
    iconColor: "text-white",
  },
  {
    id: "citizen-guide",
    label: "Survival Guidance",
    shortLabel: "Offline Guide",
    href: "/citizen/guidance",
    icon: BookOpen,
    gradient: "from-[#6366F1] to-[#4338CA]",
    iconColor: "text-white",
  },
];

export function AuthorityDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { setRole } = useAuthStore();
  const isCitizenMode = pathname?.startsWith("/citizen");

  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeDockItems = isCitizenMode ? CITIZEN_DOCK_ITEMS : AUTHORITY_DOCK_ITEMS;

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setHoveredItem(null);
    }, 350);
  };

  useEffect(() => {
    setMounted(true);
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  if (!mounted) return null;

  const handleSwitchPortal = (target: "authority" | "citizen") => {
    if (target === "authority") {
      setRole("authority");
      router.push("/authority/dashboard");
    } else {
      setRole("citizen");
      router.push("/citizen/home");
    }
  };

  const isVisible = isPinned || isHovered;

  return (
    <>
      {/* ── Bottom UX Hover Trigger Zone & Hint Pill ── */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 transition-all pointer-events-auto",
          isVisible ? "h-24" : "h-12"
        )}
      >
        {/* Floating UX Hint Message when Dock is hidden */}
        <div
          className={cn(
            "fixed bottom-3 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 pointer-events-none select-none",
            isVisible
              ? "opacity-0 translate-y-4 scale-95 pointer-events-none"
              : "opacity-100 translate-y-0 scale-100"
          )}
        >
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-xl border border-purple-200/80 shadow-[0_8px_25px_rgba(124,58,237,0.12)] text-xs font-medium text-[#1C1929] hover:border-[#7C3AED]/50 transition-all cursor-pointer">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7C3AED] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7C3AED]" />
            </span>
            <span className="font-semibold text-xs text-[#1C1929]">
              Hover for {isCitizenMode ? "Citizen Lifeline" : "Authority HQ"} Dock
            </span>
            <ChevronUp className="w-3.5 h-3.5 text-[#7C3AED] animate-bounce" />
          </div>
        </div>
      </div>

      {/* ── Compact macOS Liquid Glass Dock (No Scrollbar, Short Hover Badges) ── */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "fixed bottom-3 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none max-w-[98vw]",
          isVisible
            ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
            : "translate-y-[calc(100%+32px)] opacity-0 scale-95 pointer-events-none"
        )}
      >
        <nav
          aria-label="Application Dock"
          className="relative flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-[22px] bg-white/95 backdrop-blur-3xl border border-[#E7E2DA] shadow-[0_12px_36px_rgba(124,58,237,0.14),0_2px_8px_rgba(0,0,0,0.04)] overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-w-full"
        >
          {/* Liquid Glass Highlight Shine */}
          <div className="absolute inset-x-4 top-0.5 h-[1px] bg-gradient-to-r from-transparent via-[#7C3AED]/30 to-transparent opacity-80 pointer-events-none" />

          {/* ── COMPACT PORTAL SWITCHER: Authority <-> Citizen ── */}
          <div className="flex items-center p-0.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] shrink-0">
            {/* Authority Command Dashboard Button */}
            <button
              type="button"
              onClick={() => handleSwitchPortal("authority")}
              onMouseEnter={() => setHoveredItem("portal-authority")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer relative",
                !isCitizenMode
                  ? "bg-[#7C3AED] text-white shadow-sm"
                  : "text-[#5D5775] hover:text-[#1C1929] hover:bg-white"
              )}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Authority</span>
              {!isCitizenMode && (
                <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5" />
              )}
            </button>

            {/* Citizen Lifeline Dashboard Button */}
            <button
              type="button"
              onClick={() => handleSwitchPortal("citizen")}
              onMouseEnter={() => setHoveredItem("portal-citizen")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer relative",
                isCitizenMode
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-[#5D5775] hover:text-[#1C1929] hover:bg-white"
              )}
            >
              <LifeBuoy className="w-3.5 h-3.5 shrink-0 animate-pulse" />
              <span className="hidden sm:inline">Citizen</span>
              {isCitizenMode && (
                <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5" />
              )}
            </button>
          </div>

          {/* Separator */}
          <div className="h-6 w-[1px] bg-[#E7E2DA] mx-0.5 shrink-0" />

          {/* ── Suite-Specific Navigation Icons (Compact & Hover Tooltip) ── */}
          <div className="flex items-center gap-1 shrink-0">
            {activeDockItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isHoveredCurrent = hoveredItem === item.id;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  className="relative flex flex-col items-center group shrink-0"
                >
                  {/* Short Crisp Hover Tooltip */}
                  <div
                    className={cn(
                      "absolute -top-9.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#1C1929] text-white text-[10px] font-bold whitespace-nowrap shadow-md border border-white/10 pointer-events-none transition-all duration-150 z-50 flex items-center gap-1",
                      isHoveredCurrent
                        ? "opacity-100 -translate-y-1 scale-100"
                        : "opacity-0 translate-y-1 scale-90"
                    )}
                  >
                    <span>{item.shortLabel}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "text-[8px] px-1 rounded font-bold font-mono",
                          item.badge === "LIVE"
                            ? "bg-emerald-500 text-white"
                            : item.badge === "GPS"
                            ? "bg-[#7C3AED] text-white"
                            : "bg-rose-500 text-white"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {/* Downward triangle pointer */}
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#1C1929] rotate-45 border-r border-b border-white/10" />
                  </div>

                  {/* Dock Icon Link */}
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex items-center justify-center rounded-xl transition-all duration-150 ease-out",
                      isActive
                        ? "w-8.5 h-8.5 bg-purple-100 border border-[#7C3AED] shadow-[0_0_10px_rgba(124,58,237,0.3)]"
                        : "w-8 h-8 bg-[#FAF8F5] hover:bg-white border border-[#E7E2DA] hover:border-[#7C3AED]/50",
                      isHoveredCurrent && "scale-110 -translate-y-0.5"
                    )}
                  >
                    <div
                      className={cn(
                        "w-6.5 h-6.5 rounded-lg flex items-center justify-center bg-gradient-to-tr shadow-xs",
                        item.gradient
                      )}
                    >
                      <Icon className={cn("w-3.5 h-3.5", item.iconColor)} />
                    </div>
                  </Link>

                  {/* Active Indicator Dot */}
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-[#7C3AED] mt-0.5 shadow-[0_0_6px_#7C3AED]" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Separator */}
          <div className="h-6 w-[1px] bg-[#E7E2DA] mx-0.5 shrink-0" />

          {/* System Settings (or Guidance) */}
          <div
            onMouseEnter={() => setHoveredItem("settings")}
            className="relative flex flex-col items-center group shrink-0"
          >
            <div
              className={cn(
                "absolute -top-9.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#1C1929] text-white text-[10px] font-bold whitespace-nowrap shadow-md border border-white/10 pointer-events-none transition-all duration-150 z-50 flex items-center gap-1",
                hoveredItem === "settings"
                  ? "opacity-100 -translate-y-1 scale-100"
                  : "opacity-0 translate-y-1 scale-90"
              )}
            >
              <span>{isCitizenMode ? "Guide" : "Settings"}</span>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#1C1929] rotate-45 border-r border-b border-white/10" />
            </div>

            <Link
              href={isCitizenMode ? "/citizen/guidance" : "/authority/settings"}
              className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-150",
                pathname === "/authority/settings" || pathname === "/citizen/guidance"
                  ? "bg-purple-100 border border-[#7C3AED] shadow-[0_0_10px_rgba(124,58,237,0.3)] text-[#7C3AED]"
                  : "bg-[#FAF8F5] hover:bg-white border border-[#E7E2DA] hover:border-[#7C3AED]/50 text-[#5D5775] hover:text-[#7C3AED]"
              )}
            >
              {isCitizenMode ? (
                <BookOpen className="w-3.5 h-3.5" />
              ) : (
                <Settings className="w-3.5 h-3.5" />
              )}
            </Link>
          </div>

          {/* Pin / Unpin Dock Toggle */}
          <div
            onMouseEnter={() => setHoveredItem("pin-dock")}
            className="relative flex flex-col items-center group shrink-0"
          >
            <div
              className={cn(
                "absolute -top-9.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#1C1929] text-white text-[10px] font-bold whitespace-nowrap shadow-md border border-white/10 pointer-events-none transition-all duration-150 z-50 flex items-center gap-1",
                hoveredItem === "pin-dock"
                  ? "opacity-100 -translate-y-1 scale-100"
                  : "opacity-0 translate-y-1 scale-90"
              )}
            >
              <span>{isPinned ? "Unpin Dock" : "Pin Dock"}</span>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#1C1929] rotate-45 border-r border-b border-white/10" />
            </div>

            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? "Unpin dock" : "Pin dock"}
              className={cn(
                "relative flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150 active:scale-95 border cursor-pointer",
                isPinned
                  ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-[0_0_8px_rgba(124,58,237,0.35)]"
                  : "bg-[#FAF8F5] border-[#E7E2DA] text-[#767092] hover:text-[#7C3AED] hover:bg-white"
              )}
            >
              {isPinned ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
