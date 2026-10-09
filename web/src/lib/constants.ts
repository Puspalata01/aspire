import { HazardType, SeverityLevel } from "@/types";

export const APP_CONFIG = {
  name: "ASPIRE",
  fullName: "AI-Powered Disaster Intelligence & Response Platform",
  tagline: "From Warning to Action.",
  version: "1.0.0",
  defaultCenter: {
    lat: 19.8135,
    lng: 85.8312, // Puri, Odisha coast (cyclone & flood prone)
    zoom: 9.5,
  },
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoiZGV2LWFzcGlyZSIsImEiOiJjbTJhY2MwMDIwMGN5MnJzM21xcnB3dGNkIn0.test",
};

export const AUTHORITY_NAV_ITEMS = [
  { label: "Dashboard", href: "/authority/dashboard", icon: "LayoutDashboard", badge: null },
  { label: "GIS Live Map", href: "/authority/map", icon: "Map", badge: "LIVE" },
  { label: "AI Risk Engine", href: "/authority/risk", icon: "Flame", badge: null },
  { label: "Impact Analysis", href: "/authority/impact", icon: "TrendingUp", badge: null },
  { label: "Resource Deploy", href: "/authority/resources", icon: "Truck", badge: null },
  { label: "Shelters", href: "/authority/shelters", icon: "Home", badge: null },
  { label: "Hospitals & ICUs", href: "/authority/hospitals", icon: "HeartPulse", badge: null },
  { label: "Emergency SOS", href: "/authority/sos", icon: "AlertTriangle", badge: "12" },
  { label: "Disaster Simulator", href: "/authority/simulation", icon: "Cpu", badge: "AI" },
  { label: "Cascade Failures", href: "/authority/cascade", icon: "Workflow", badge: null },
  { label: "Evacuation Planner", href: "/authority/evacuation", icon: "Navigation", badge: null },
  { label: "Historical Trends", href: "/authority/analytics", icon: "BarChart3", badge: null },
  { label: "Settings", href: "/authority/settings", icon: "Settings", badge: null },
];

export const CITIZEN_NAV_ITEMS = [
  { label: "Home", href: "/citizen/home", icon: "Home" },
  { label: "Live Map", href: "/citizen/map", icon: "Map" },
  { label: "Find Shelter", href: "/citizen/shelters", icon: "Shield" },
  { label: "Safe Routes", href: "/citizen/safe-routes", icon: "Navigation" },
  { label: "Emergency SOS", href: "/citizen/sos", icon: "LifeBuoy", highlight: true },
  { label: "Submit Report", href: "/citizen/reports", icon: "FileText" },
  { label: "Alerts", href: "/citizen/alerts", icon: "Bell" },
  { label: "Survival Guide", href: "/citizen/guidance", icon: "BookOpen" },
];

export const HAZARD_METADATA: Record<HazardType, { label: string; icon: string; color: string; description: string }> = {
  flood: {
    label: "Flood Inundation",
    icon: "Waves",
    color: "#3B82F6",
    description: "Rising river basins, dam discharges and coastal surges.",
  },
  cyclone: {
    label: "Tropical Cyclone",
    icon: "Wind",
    color: "#8B5CF6",
    description: "High-velocity gale winds, storm surges, and precipitation bands.",
  },
  heatwave: {
    label: "Severe Heatwave",
    icon: "SunMedium",
    color: "#F59E0B",
    description: "Extreme surface thermal anomalies exceeding critical thresholds.",
  },
  landslide: {
    label: "Landslide Risk",
    icon: "Mountain",
    color: "#A16207",
    description: "Slope saturation and debris flow vulnerability.",
  },
  earthquake: {
    label: "Seismic Event",
    icon: "Activity",
    color: "#DC2626",
    description: "Ground shaking and structural collapse probability.",
  },
  tsunami: {
    label: "Tsunami Warning",
    icon: "WavesLadder",
    color: "#0284C7",
    description: "Subsea seismic wave generation targeting coastlines.",
  },
  wildfire: {
    label: "Wildfire Active",
    icon: "Flame",
    color: "#EA580C",
    description: "Thermal hotspots with rapid dry-canopy spread rates.",
  },
  drought: {
    label: "Agricultural Drought",
    icon: "CloudOff",
    color: "#D97706",
    description: "Severe soil moisture deficit and reservoir depletion.",
  },
};

export const SEVERITY_ORDER: Record<SeverityLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};
