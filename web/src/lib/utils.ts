import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SeverityLevel, HazardType } from "@/types";

/**
 * Combines Tailwind classes with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format numbers with comma separator
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

/**
 * Format timestamp into relative or human readable string
 */
export function formatTimeAgo(timestamp: string | Date): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

/**
 * Format exact date and time in 24hr or 12hr format
 */
export function formatDateTime(timestamp: string | Date): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  return date.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Returns color classes and hex values based on severity
 */
export function getSeverityStyles(severity: SeverityLevel): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  glow: string;
  hex: string;
} {
  switch (severity) {
    case "critical":
      return {
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/30",
        badge: "bg-red-500/20 text-red-300 border-red-500/40",
        glow: "shadow-[0_0_15px_rgba(239,68,68,0.4)]",
        hex: "#EF4444",
      };
    case "high":
      return {
        bg: "bg-orange-500/10",
        text: "text-orange-400",
        border: "border-orange-500/30",
        badge: "bg-orange-500/20 text-orange-300 border-orange-500/40",
        glow: "shadow-[0_0_15px_rgba(249,115,22,0.4)]",
        hex: "#F97316",
      };
    case "medium":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/30",
        badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        glow: "shadow-[0_0_15px_rgba(234,179,8,0.3)]",
        hex: "#EAB308",
      };
    case "low":
    default:
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/30",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        glow: "shadow-[0_0_15px_rgba(34,197,94,0.3)]",
        hex: "#22C55E",
      };
  }
}

/**
 * Returns hazard display colors
 */
export function getHazardColor(type: HazardType): string {
  switch (type) {
    case "flood":
      return "#3B82F6";
    case "cyclone":
      return "#8B5CF6";
    case "heatwave":
      return "#F59E0B";
    case "landslide":
      return "#A16207";
    case "earthquake":
      return "#DC2626";
    case "tsunami":
      return "#0284C7";
    case "wildfire":
      return "#EA580C";
    default:
      return "#2563EB";
  }
}

/**
 * Haversine formula to calculate approximate distance in kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}
