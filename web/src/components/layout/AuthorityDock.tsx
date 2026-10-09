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
    href: "/authority/dashboard",
    icon: LayoutDashboard,
    gradient: "from-[#3B6CFF] to-[#1D4ED8]",
    iconColor: "text-white",
  },
  {
    id: "map",
    label: "GIS Hazard Map",
    href: "/authority/map",
    icon: Map,
    badge: "LIVE",
    gradient: "from-[#10B981] to-[#047857]",
    iconColor: "text-white",
  },
  {
    id: "risk",
    label: "AI Risk Engine",
    href: "/authority/risk",
    icon: Flame,
    gradient: "from-[#F59E0B] to-[#D97706]",
    iconColor: "text-white",
  },
  {
    id: "impact",
    label: "Impact Analysis",
    href: "/authority/impact",
    icon: TrendingUp,
    gradient: "from-[#8B5CF6] to-[#6D28D9]",
    iconColor: "text-white",
  },
  {
    id: "resources",
    label: "Resource Deploy",
    href: "/authority/resources",
    icon: Truck,
    gradient: "from-[#06B6D4] to-[#0891B2]",
    iconColor: "text-white",
  },
  {
    id: "shelters",
    label: "Shelter Capacity",
    href: "/authority/shelters",
    icon: Home,
    gradient: "from-[#14B8A6] to-[#0F766E]",
    iconColor: "text-white",
  },
  {
    id: "hospitals",
    label: "Hospitals & ICUs",
    href: "/authority/hospitals",
    icon: HeartPulse,
    gradient: "from-[#EC4899] to-[#BE185D]",
    iconColor: "text-white",
  },
  {
    id: "sos",
    label: "Emergency SOS Queue",
    href: "/authority/sos",
    icon: AlertTriangle,
    badge: "14",
    gradient: "from-[#EF4444] to-[#B91C1C]",
    iconColor: "text-white",
  },
  {
    id: "simulation",
    label: "What-If Simulator",
    href: "/authority/simulation",
    icon: Cpu,
    badge: "AI",
    gradient: "from-[#6366F1] to-[#4338CA]",
    iconColor: "text-white",
  },
  {
    id: "cascade",
    label: "Cascade Failure Analysis",
    href: "/authority/cascade",
    icon: Workflow,
    gradient: "from-[#3B82F6] to-[#1D4ED8]",
    iconColor: "text-white",
  },
  {
    id: "evacuation",
    label: "Evacuation Planner",
    href: "/authority/evacuation",
    icon: Navigation,
    gradient: "from-[#F97316] to-[#C2410C]",
    iconColor: "text-white",
  },
  {
    id: "analytics",
    label: "Historical Analytics",
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
    href: "/citizen/home",
    icon: Home,
    gradient: "from-[#3B6CFF] to-[#1D4ED8]",
    iconColor: "text-white",
  },
  {
    id: "citizen-map",
    label: "Live Safe Map",
    href: "/citizen/map",
    icon: Map,
    badge: "LIVE",
    gradient: "from-[#10B981] to-[#047857]",
    iconColor: "text-white",
  },
  {
    id: "citizen-shelters",
    label: "Nearby Shelters",
    href: "/citizen/shelters",
    icon: Shield,
    badge: "GPS",
    gradient: "from-[#14B8A6] to-[#0F766E]",
    iconColor: "text-white",
  },
  {
    id: "citizen-routes",
    label: "Safe Evac Routes",
    href: "/citizen/safe-routes",
    icon: Navigation,
    gradient: "from-[#8B5CF6] to-[#6D28D9]",
    iconColor: "text-white",
  },
  {
    id: "citizen-sos",
    label: "Emergency SOS",
    href: "/citizen/sos",
    icon: LifeBuoy,
    badge: "SOS",
    gradient: "from-[#EF4444] to-[#B91C1C]",
    iconColor: "text-white",
  },
  {
    id: "citizen-report",
    label: "Report Hazard (Photo & GPS)",
    href: "/citizen/reports",
    icon: Camera,
    gradient: "from-[#06B6D4] to-[#0891B2]",
    iconColor: "text-white",
  },
  {
    id: "citizen-alerts",
    label: "Local Warnings",
    href: "/citizen/alerts",
    icon: Bell,
    badge: "ALERT",
    gradient: "from-[#F59E0B] to-[#D97706]",
    iconColor: "text-white",
  },
  {
    id: "citizen-guide",
    label: "Survival Guidance",
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
          isVisible ? "h-28" : "h-14"
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
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#101624]/90 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-xs font-medium text-[#F5F7FB] hover:border-[#3B6CFF]/50 transition-all cursor-pointer">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B6CFF] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3B6CFF]" />
            </span>
            <span className="font-semibold text-xs text-[#F5F7FB]">
              Hover here for {isCitizenMode ? "Citizen Lifeline" : "Authority HQ"} Dock
            </span>
            <ChevronUp className="w-3.5 h-3.5 text-[#3B6CFF] animate-bounce" />
          </div>
        </div>
      </div>

      {/* ── macOS Liquid Glass Dock ── */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none max-w-[96vw]",
          isVisible
            ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
            : "translate-y-[calc(100%+32px)] opacity-0 scale-95 pointer-events-none"
        )}
      >
        <nav
          aria-label="Application Dock"
          className="relative flex items-center gap-1.5 sm:gap-2 px-3 py-2.5 rounded-[28px] bg-[#101624]/90 backdrop-blur-3xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_1px_1px_rgba(255,255,255,0.1)_inset] overflow-x-auto max-w-full"
        >
          {/* Liquid Glass Highlight Shine */}
          <div className="absolute inset-x-4 top-0.5 h-[1px] bg-gradient-to-r from-transparent via-[#4FB3FF]/40 to-transparent opacity-80 pointer-events-none" />

          {/* ── PROMINENT PORTAL SWITCHER: Authority HQ <-> Citizen Lifeline ── */}
          <div className="flex items-center p-1 rounded-2xl bg-black/40 border border-white/10 shrink-0">
            {/* Authority Command Dashboard Button */}
            <button
              type="button"
              onClick={() => handleSwitchPortal("authority")}
              onMouseEnter={() => setHoveredItem("portal-authority")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative",
                !isCitizenMode
                  ? "bg-[#3B6CFF] text-white shadow-[0_0_15px_rgba(59,108,255,0.6)]"
                  : "text-[#8E99AF] hover:text-white hover:bg-white/5"
              )}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Authority HQ</span>
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
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative",
                isCitizenMode
                  ? "bg-[#2FD07F] text-[#05070D] shadow-[0_0_15px_rgba(47,208,127,0.6)]"
                  : "text-[#8E99AF] hover:text-white hover:bg-white/5"
              )}
            >
              <LifeBuoy className="w-4 h-4 shrink-0 animate-pulse" />
              <span className="hidden md:inline">Citizen Lifeline</span>
              {isCitizenMode && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#05070D] ml-0.5" />
              )}
            </button>
          </div>

          {/* Separator */}
          <div className="h-8 w-[1px] bg-white/15 mx-1 shrink-0" />

          {/* ── Suite-Specific Navigation Icons ── */}
          <div className="flex items-center gap-1.5 shrink-0">
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
                  {/* Tooltip */}
                  <div
                    className={cn(
                      "absolute -top-11 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#05070D]/95 backdrop-blur-md text-[#F5F7FB] text-[11px] font-semibold whitespace-nowrap shadow-xl border border-white/10 pointer-events-none transition-all duration-150 z-50 flex items-center gap-1.5",
                      isHoveredCurrent
                        ? "opacity-100 -translate-y-1 scale-100"
                        : "opacity-0 translate-y-1 scale-90"
                    )}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "text-[9px] px-1.5 py-0.2 rounded-full font-bold font-mono",
                          item.badge === "LIVE"
                            ? "bg-[#2FD07F] text-[#05070D]"
                            : item.badge === "GPS"
                            ? "bg-[#3B6CFF] text-white"
                            : "bg-[#FF4D5E] text-white"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Dock Icon Link */}
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex items-center justify-center rounded-2xl transition-all duration-200 ease-out",
                      isActive
                        ? "w-11 h-11 bg-white/20 border border-white/30 shadow-[0_0_16px_rgba(59,108,255,0.5)]"
                        : "w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15",
                      isHoveredCurrent && "scale-115 -translate-y-1"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-tr shadow-sm",
                        item.gradient
                      )}
                    >
                      <Icon className={cn("w-4 h-4", item.iconColor)} />
                    </div>
                  </Link>

                  {/* Active Indicator Dot */}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3B6CFF] mt-1 shadow-[0_0_8px_#3B6CFF]" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Separator */}
          <div className="h-8 w-[1px] bg-white/15 mx-1 shrink-0" />

          {/* System Settings (or Guidance) */}
          <div
            onMouseEnter={() => setHoveredItem("settings")}
            className="relative flex flex-col items-center group shrink-0"
          >
            <div
              className={cn(
                "absolute -top-11 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#05070D]/95 backdrop-blur-md text-[#F5F7FB] text-[11px] font-semibold whitespace-nowrap shadow-xl border border-white/10 pointer-events-none transition-all duration-150 z-50",
                hoveredItem === "settings"
                  ? "opacity-100 -translate-y-1 scale-100"
                  : "opacity-0 translate-y-1 scale-90"
              )}
            >
              {isCitizenMode ? "Emergency Guidance" : "System Settings"}
            </div>

            <Link
              href={isCitizenMode ? "/citizen/guidance" : "/authority/settings"}
              className={cn(
                "relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200",
                pathname === "/authority/settings" || pathname === "/citizen/guidance"
                  ? "bg-white/15 border border-white/20 shadow-[0_0_12px_rgba(59,108,255,0.4)]"
                  : "bg-white/5 hover:bg-white/10 border border-white/10"
              )}
            >
              {isCitizenMode ? (
                <BookOpen className="w-4 h-4 text-[#9AA3B8] hover:text-white" />
              ) : (
                <Settings className="w-4 h-4 text-[#9AA3B8] hover:text-white" />
              )}
            </Link>
          </div>

          {/* Pin / Unpin Dock Toggle */}
          <div
            onMouseEnter={() => setHoveredItem("pin-dock")}
            className="relative flex flex-col items-center group ml-1 shrink-0"
          >
            <div
              className={cn(
                "absolute -top-11 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#05070D]/95 backdrop-blur-md text-[#F5F7FB] text-[11px] font-semibold whitespace-nowrap shadow-xl border border-white/10 pointer-events-none transition-all duration-150 z-50",
                hoveredItem === "pin-dock"
                  ? "opacity-100 -translate-y-1 scale-100"
                  : "opacity-0 translate-y-1 scale-90"
              )}
            >
              {isPinned ? "Unpin (Auto-hide)" : "Pin Dock Always Visible"}
            </div>

            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? "Unpin dock" : "Pin dock"}
              className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 active:scale-95 border cursor-pointer",
                isPinned
                  ? "bg-[#3B6CFF] text-white border-[#3B6CFF] shadow-[0_0_12px_rgba(59,108,255,0.5)]"
                  : "bg-white/5 border-white/10 text-[#9AA3B8] hover:text-white"
              )}
            >
              {isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
