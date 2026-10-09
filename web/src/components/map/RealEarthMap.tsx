"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import {
  Globe,
  Layers,
  ZoomIn,
  ZoomOut,
  Compass,
  Wind,
  Waves,
  Flame,
  Home,
  HeartPulse,
  Truck,
  Shield,
  Maximize2,
  Minimize2,
  Eye,
  Activity,
  MapPin,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Box,
} from "lucide-react";
import { Disaster, Shelter, Hospital, Resource } from "@/types";

export interface RealEarthMapProps {
  initialMode?: "globe" | "2d";
  initialTheme?: "satellite" | "dark" | "osm";
  initialCenter?: [number, number]; // [lng, lat]
  initialZoom?: number;
  initialPitch?: number;
  height?: string;
  disasters?: Disaster[];
  shelters?: Shelter[];
  hospitals?: Hospital[];
  resources?: Resource[];
  activeDisaster?: Disaster | null;
  onSelectEntity?: (entity: any) => void;
  showTopBar?: boolean;
  showTelemetryBar?: boolean;
  showCameraControls?: boolean;
  enableIdleRotation?: boolean;
  selectedStateCode?: string;
  onSelectState?: (stateCode: string) => void;
}

export const INDIAN_STATE_COORDINATES: Record<
  string,
  { name: string; lat: number; lng: number; zoom: number; hazards: number }
> = {
  OD: { name: "Odisha", lat: 20.29, lng: 85.82, zoom: 7.2, hazards: 3 },
  WB: { name: "West Bengal", lat: 22.57, lng: 88.36, zoom: 7, hazards: 1 },
  AP: { name: "Andhra Pradesh", lat: 16.5, lng: 80.64, zoom: 7, hazards: 1 },
  TN: { name: "Tamil Nadu", lat: 13.08, lng: 80.27, zoom: 7, hazards: 0 },
  KL: { name: "Kerala", lat: 9.93, lng: 76.26, zoom: 7, hazards: 0 },
  KA: { name: "Karnataka", lat: 12.97, lng: 77.59, zoom: 7, hazards: 0 },
  MH: { name: "Maharashtra", lat: 19.07, lng: 72.87, zoom: 6, hazards: 0 },
  GJ: { name: "Gujarat", lat: 23.02, lng: 72.57, zoom: 6, hazards: 0 },
  MP: { name: "Madhya Pradesh", lat: 23.25, lng: 77.41, zoom: 6, hazards: 0 },
  UP: { name: "Uttar Pradesh", lat: 26.84, lng: 80.94, zoom: 6, hazards: 0 },
  BR: { name: "Bihar", lat: 25.59, lng: 85.13, zoom: 7, hazards: 1 },
  AS: { name: "Assam", lat: 26.14, lng: 91.73, zoom: 7, hazards: 1 },
  DL: { name: "Delhi", lat: 28.61, lng: 77.2, zoom: 9, hazards: 0 },
  RJ: { name: "Rajasthan", lat: 26.91, lng: 75.78, zoom: 6, hazards: 0 },
};

/**
 * Universal safe coordinate extractor
 * Never returns NaN or undefined
 */
export function extractLatLng(item: any): { lat: number; lng: number } | null {
  if (!item) return null;

  // 1. coordinates: { lat, lng } or { latitude, longitude }
  if (item.coordinates && typeof item.coordinates === "object") {
    const lat = Number(item.coordinates.lat ?? item.coordinates.latitude);
    const lng = Number(item.coordinates.lng ?? item.coordinates.longitude);
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return { lat, lng };
    }
  }

  // 2. center_point: { lat, lng } (Disasters)
  if (item.center_point && typeof item.center_point === "object") {
    const lat = Number(item.center_point.lat ?? item.center_point.latitude);
    const lng = Number(item.center_point.lng ?? item.center_point.longitude);
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return { lat, lng };
    }
  }

  // 3. location: { lat, lng }
  if (item.location && typeof item.location === "object") {
    const lat = Number(item.location.lat ?? item.location.latitude);
    const lng = Number(item.location.lng ?? item.location.longitude);
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return { lat, lng };
    }
  }

  // 4. direct lat & lng properties
  const directLat = Number(item.lat ?? item.latitude);
  const directLng = Number(item.lng ?? item.longitude);
  if (!isNaN(directLat) && !isNaN(directLng) && directLat !== 0 && directLng !== 0) {
    return { lat: directLat, lng: directLng };
  }

  // 5. GeoJSON polygon or point [lng, lat]
  if (item.geometry?.coordinates) {
    const c = item.geometry.coordinates;
    if (Array.isArray(c) && typeof c[0] === "number" && typeof c[1] === "number") {
      const lng = Number(c[0]);
      const lat = Number(c[1]);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
    if (Array.isArray(c) && Array.isArray(c[0]) && Array.isArray(c[0][0])) {
      const lng = Number(c[0][0][0]);
      const lat = Number(c[0][0][1]);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
  }

  return null;
}

/**
 * Spherical coordinate projection for 3D Earth Globes
 * Maps lat/lng degrees onto a 3D sphere surface vector (x, y, z)
 */
export function latLngToVector3(lat: number, lng: number, radius = 1.0) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return { x, y, z };
}

export const INDIAN_STRATEGIC_HUBS = [
  { name: "Odisha / Puri (Hazard Ground Zero)", lat: 20.29, lng: 85.82, color: 0xff4d5e, isAlert: true },
  { name: "New Delhi (NDRF Central Command)", lat: 28.61, lng: 77.2, color: 0x3b6cff, isAlert: false },
  { name: "Kolkata (Eastern Logistics Staging)", lat: 22.57, lng: 88.36, color: 0xf5c542, isAlert: false },
  { name: "Visakhapatnam (Coast Guard Rescue Base)", lat: 17.68, lng: 83.21, color: 0xff8a3d, isAlert: false },
  { name: "Mumbai (Western Command)", lat: 19.07, lng: 72.87, color: 0x6c63ff, isAlert: false },
  { name: "Chennai (Southern Maritime Hub)", lat: 13.08, lng: 80.27, color: 0x2fd07f, isAlert: false },
];


export function RealEarthMap({
  initialMode = "2d", // 2D Tactical GIS by default for instant reliable map loading
  initialTheme = "satellite",
  initialCenter = [85.82, 20.29], // [lng, lat] (Odisha / Bay of Bengal)
  initialZoom = 7,
  height = "100%",
  disasters = [],
  shelters = [],
  hospitals = [],
  resources = [],
  activeDisaster,
  onSelectEntity,
  showTopBar = true,
  showTelemetryBar = true,
  showCameraControls = true,
  selectedStateCode,
  onSelectState,
}: RealEarthMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);

  // 3D Globe Interactive Controls Refs
  const globeCameraRef = useRef<any>(null);
  const globeEarthMeshRef = useRef<any>(null);
  const globeMaterialRef = useRef<any>(null);
  const globeTexturesRef = useRef<any>(null);
  const globeDistanceRef = useRef<number>(2.4);

  const [mode, setMode] = useState<"globe" | "2d">(initialMode);
  const [theme, setTheme] = useState<"satellite" | "dark" | "osm">(initialTheme);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({
    lat: initialCenter[1],
    lng: initialCenter[0],
    zoom: initialZoom,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const [visibleLayers, setVisibleLayers] = useState({
    hazards: true,
    shelters: true,
    hospitals: true,
    resources: true,
    states: false,
    trajectory: true,
  });

  // Sync mode with initialMode prop when parent changes
  useEffect(() => {
    if (initialMode && initialMode !== mode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  // Sync theme with initialTheme prop
  useEffect(() => {
    if (initialTheme && initialTheme !== theme) {
      setTheme(initialTheme);
    }
  }, [initialTheme]);

  // ──────────────────────────────────────────────────────────────────────────
  // 1. LEAFLET 2D/TACTICAL MAP ENGINE (100% Reliable, 0 Workers, 0 CORS blocks)
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    let LModule: any = null;

    if (!containerRef.current) return;

    import("leaflet").then((L) => {
      if (!isMounted || !containerRef.current) return;
      LModule = L.default || L;

      // Clean up existing map instance
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Safe bounds validation
      const centerLat = !isNaN(initialCenter[1]) ? initialCenter[1] : 20.29;
      const centerLng = !isNaN(initialCenter[0]) ? initialCenter[0] : 85.82;

      const map = LModule.map(containerRef.current, {
        center: [centerLat, centerLng],
        zoom: initialZoom || 7,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
      });

      mapRef.current = map;

      // Layer Group for markers
      const markerGroup = LModule.layerGroup().addTo(map);
      markerGroupRef.current = markerGroup;

      // Initial Tile Layer
      updateTileLayer(map, LModule, theme);

      // Trajectory corridor
      addTrajectoryLayer(map, LModule);

      // Render markers
      refreshMarkers(map, LModule, markerGroup);

      // Trigger size invalidation immediately and after short tick
      map.invalidateSize();
      setTimeout(() => {
        if (isMounted && mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 150);

      // Camera coordinates updates
      map.on("move", () => {
        const c = map.getCenter();
        if (c && !isNaN(c.lat) && !isNaN(c.lng)) {
          setCoords({
            lat: c.lat,
            lng: c.lng,
            zoom: map.getZoom(),
          });
        }
      });
    });

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Invalidate Leaflet size and reset view whenever mode switches to 2D
  useEffect(() => {
    if (mode === "2d" && mapRef.current) {
      const centerLat = !isNaN(initialCenter[1]) ? initialCenter[1] : 20.29;
      const centerLng = !isNaN(initialCenter[0]) ? initialCenter[0] : 85.82;
      const targetZoom = initialZoom || 7.2;

      const t1 = setTimeout(() => {
        if (!mapRef.current) return;
        mapRef.current.invalidateSize();
        mapRef.current.setView([centerLat, centerLng], targetZoom);
      }, 60);

      const t2 = setTimeout(() => {
        if (!mapRef.current) return;
        mapRef.current.invalidateSize();
      }, 250);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [mode, initialCenter, initialZoom]);

  // Update Tile Layer
  const updateTileLayer = (map: any, L: any, currentTheme: string) => {
    if (!map || !L) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = "";
    let options: any = { maxZoom: 19 };

    if (currentTheme === "satellite") {
      // ESRI World Imagery (High-res satellite)
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      options = {
        maxZoom: 18,
        attribution: "Esri, Maxar",
      };
    } else if (currentTheme === "dark") {
      // CartoDB Dark Matter with 4 CDN subdomains
      url = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      options = {
        maxZoom: 19,
        subdomains: ["a", "b", "c", "d"],
        attribution: "&copy; CARTO",
      };
    } else {
      // OpenStreetMap Streets
      url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      options = {
        maxZoom: 19,
        subdomains: ["a", "b", "c"],
        attribution: "&copy; OpenStreetMap",
      };
    }

    const layer = L.tileLayer(url, options);
    layer.addTo(map);
    tileLayerRef.current = layer;
  };

  // Change theme
  useEffect(() => {
    if (mapRef.current) {
      import("leaflet").then((L) => {
        const LMod = L.default || L;
        updateTileLayer(mapRef.current, LMod, theme);
      });
    }
  }, [theme]);

  // Landfall corridor & hazard polygon
  const addTrajectoryLayer = (map: any, L: any) => {
    if (!map || !L) return;

    // Projected trajectory line
    const trackPoints: [number, number][] = [
      [17.0, 89.5],
      [18.5, 88.2],
      [19.8, 86.8],
      [20.3, 85.8],
      [21.2, 84.5],
    ];

    L.polyline(trackPoints, {
      color: "#FF4D5E",
      weight: 4,
      dashArray: "6, 8",
      opacity: 0.9,
    }).addTo(map);

    // Landfall red zone polygon
    const hazardPolygon: [number, number][] = [
      [19.7, 85.6],
      [19.9, 86.3],
      [20.4, 86.6],
      [20.6, 86.0],
      [20.2, 85.7],
    ];

    L.polygon(hazardPolygon, {
      color: "#FF4D5E",
      fillColor: "#FF4D5E",
      fillOpacity: 0.22,
      weight: 2,
    }).addTo(map);
  };

  // Markers refresh
  const refreshMarkers = useCallback(
    (map: any, L: any, markerGroup: any) => {
      if (!map || !L || !markerGroup) return;

      markerGroup.clearLayers();

      // A. State Hub Markers (Only shown at national zoom <= 5.5 when enabled)
      if (visibleLayers.states && map.getZoom() <= 5.5) {
        Object.entries(INDIAN_STATE_COORDINATES).forEach(([code, state]) => {
          if (isNaN(state.lat) || isNaN(state.lng)) return;

          const isSelected = selectedStateCode === code;
          const hasHazards = state.hazards > 0;

          const html = `
            <div class="flex items-center gap-1 px-1.5 py-0.5 rounded-full backdrop-blur-md border shadow-sm cursor-pointer transition-transform hover:scale-110 whitespace-nowrap ${
              isSelected
                ? "bg-[#7C3AED] text-white border-white/60 shadow-[0_0_10px_rgba(124,58,237,0.6)]"
                : hasHazards
                ? "bg-white/95 text-rose-600 border-rose-300"
                : "bg-white/95 text-[#5D5775] border-[#E7E2DA]"
            }">
              <span class="w-1 h-1 rounded-full ${
                hasHazards ? "bg-[#FF4D5E]" : "bg-[#2FD07F]"
              }"></span>
              <span class="text-[9px] font-bold font-mono tracking-tight">${code}</span>
            </div>
          `;

          const icon = L.divIcon({
            html,
            className: "leaflet-custom-state-marker",
            iconSize: [36, 18],
            iconAnchor: [18, 9],
          });

          const m = L.marker([state.lat, state.lng], { icon });
          m.on("click", () => {
            if (onSelectState) onSelectState(code);
            map.flyTo([state.lat, state.lng], state.zoom, { duration: 1.2 });
          });
          markerGroup.addLayer(m);
        });
      }

      // B. Disasters (Compact Tactical Pills)
      if (visibleLayers.hazards) {
        const activeList =
          disasters.length > 0
            ? disasters
            : [
                {
                  id: "dis-cyclone-dana",
                  name: "Cyclone Dana",
                  type: "cyclone",
                  severity: "critical",
                  status: "active",
                  center_point: { lat: 19.82, lng: 86.1 },
                  affectedPopulation: 1420000,
                  metadata: { wind_speed_kmh: 165, category: "Cat 4" },
                } as any,
                {
                  id: "dis-flood-mahanadi",
                  name: "Mahanadi Flood",
                  type: "flood",
                  severity: "high",
                  status: "active",
                  center_point: { lat: 20.46, lng: 85.88 },
                  affectedPopulation: 320000,
                  metadata: { water_level_m: 28.4 },
                } as any,
              ];

        activeList.forEach((d) => {
          const pos = extractLatLng(d) || { lat: 19.82, lng: 86.1 };
          if (!pos || isNaN(pos.lat) || isNaN(pos.lng)) return;

          const isCrit = d.severity === "critical";
          const cleanName = d.name.includes("(") ? d.name.split("(")[0].trim() : d.name;
          const cat = (d as any).metadata?.category || "LIVE";

          const html = `
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 border ${
              isCrit ? "border-rose-400 shadow-md text-rose-700" : "border-amber-400 shadow-sm text-amber-800"
            } cursor-pointer hover:scale-105 transition-transform whitespace-nowrap select-none">
              <span class="w-2 h-2 rounded-full ${
                isCrit ? "bg-rose-500 animate-pulse" : "bg-amber-500"
              } shrink-0"></span>
              <span class="text-[11px] font-bold text-[#1C1929] tracking-tight leading-none">${cleanName}</span>
              <span class="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold ${
                isCrit ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
              } shrink-0">
                ${cat}
              </span>
            </div>
          `;

          const icon = L.divIcon({
            html,
            className: "leaflet-custom-hazard-marker",
            iconSize: [130, 26],
            iconAnchor: [65, 13],
          });

          const m = L.marker([pos.lat, pos.lng], { icon });
          m.on("click", () => {
            setSelectedEntity(d);
            if (onSelectEntity) onSelectEntity(d);
            map.flyTo([pos.lat, pos.lng], 8.5, { duration: 1.2 });
          });
          markerGroup.addLayer(m);
        });
      }

      // C. Shelters
      if (visibleLayers.shelters && shelters.length > 0) {
        shelters.slice(0, 30).forEach((sh) => {
          const pos = extractLatLng(sh);
          if (!pos || isNaN(pos.lat) || isNaN(pos.lng)) return;

          const html = `
            <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/95 border border-emerald-300 text-emerald-700 shadow-sm cursor-pointer hover:scale-110 transition-transform">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span class="text-[9px] font-bold text-[#1C1929]">${sh.name.split(" ")[0]} Hub</span>
            </div>
          `;

          const icon = L.divIcon({
            html,
            className: "leaflet-custom-shelter-marker",
            iconSize: [85, 20],
            iconAnchor: [42, 10],
          });

          const m = L.marker([pos.lat, pos.lng], { icon });
          m.on("click", () => {
            setSelectedEntity(sh);
            if (onSelectEntity) onSelectEntity(sh);
          });
          markerGroup.addLayer(m);
        });
      }

      // D. Hospitals
      if (visibleLayers.hospitals && hospitals.length > 0) {
        hospitals.slice(0, 25).forEach((hosp) => {
          const pos = extractLatLng(hosp);
          if (!pos || isNaN(pos.lat) || isNaN(pos.lng)) return;

          const html = `
            <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/95 border border-purple-300 text-[#7C3AED] shadow-sm cursor-pointer hover:scale-110 transition-transform">
              <span class="w-1.5 h-1.5 rounded-full bg-[#7C3AED]"></span>
              <span class="text-[9px] font-bold text-[#1C1929]">${hosp.name.split(" ")[0]} ICU</span>
            </div>
          `;

          const icon = L.divIcon({
            html,
            className: "leaflet-custom-hosp-marker",
            iconSize: [80, 20],
            iconAnchor: [40, 10],
          });

          const m = L.marker([pos.lat, pos.lng], { icon });
          m.on("click", () => {
            setSelectedEntity(hosp);
            if (onSelectEntity) onSelectEntity(hosp);
          });
          markerGroup.addLayer(m);
        });
      }

      // E. Resources
      if (visibleLayers.resources && resources.length > 0) {
        resources.slice(0, 30).forEach((res) => {
          const pos = extractLatLng(res);
          if (!pos || isNaN(pos.lat) || isNaN(pos.lng)) return;

          const html = `
            <div class="w-6 h-6 rounded-lg bg-[#FF8A3D] text-white flex items-center justify-center shadow-[0_0_10px_rgba(255,138,61,0.5)] border border-white/40 cursor-pointer hover:scale-115 transition-transform">
              <span class="text-[10px] font-bold">R</span>
            </div>
          `;

          const icon = L.divIcon({
            html,
            className: "leaflet-custom-res-marker",
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const m = L.marker([pos.lat, pos.lng], { icon });
          m.on("click", () => {
            setSelectedEntity(res);
            if (onSelectEntity) onSelectEntity(res);
          });
          markerGroup.addLayer(m);
        });
      }
    },
    [
      visibleLayers,
      selectedStateCode,
      disasters,
      shelters,
      hospitals,
      resources,
      onSelectState,
      onSelectEntity,
    ]
  );

  // Trigger marker refresh on data/layer changes
  useEffect(() => {
    if (mapRef.current && markerGroupRef.current) {
      import("leaflet").then((L) => {
        const LMod = L.default || L;
        refreshMarkers(mapRef.current, LMod, markerGroupRef.current);
      });
    }
  }, [refreshMarkers]);

  // Fly to selected state
  useEffect(() => {
    if (!selectedStateCode || !mapRef.current) return;
    const target = INDIAN_STATE_COORDINATES[selectedStateCode];
    if (target && !isNaN(target.lat) && !isNaN(target.lng)) {
      mapRef.current.flyTo([target.lat, target.lng], target.zoom, { duration: 1.5 });
    }
  }, [selectedStateCode]);

  // ──────────────────────────────────────────────────────────────────────────
  // 2. THREE.JS PHOTOREALISTIC 3D EARTH GLOBE ENGINE (Local NASA Textures)
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (globeMaterialRef.current && globeTexturesRef.current) {
      const isSat = theme === "satellite";
      const { dayTexture, nightTexture } = globeTexturesRef.current;
      globeMaterialRef.current.map = isSat ? dayTexture : nightTexture;
      globeMaterialRef.current.emissiveMap = isSat ? null : nightTexture;
      globeMaterialRef.current.emissiveIntensity = isSat ? 0 : 0.85;
      globeMaterialRef.current.needsUpdate = true;
    }
  }, [theme]);

  useEffect(() => {
    if (mode !== "globe") return;
    let isMounted = true;
    let animId: number;

    const container = globeContainerRef.current;
    if (!container) return;

    import("three").then((THREE) => {
      if (!isMounted || !container) return;

      try {
        const width = container.clientWidth || 600;
        const height = container.clientHeight || 450;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, width / (height || 1), 0.1, 1000);
        camera.position.z = globeDistanceRef.current;
        globeCameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;

        // Clean container and attach canvas
        container.innerHTML = "";
        container.appendChild(renderer.domElement);

        // 1. Cosmic Deep Space Starfield
        const starCount = 800;
        const starGeo = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount * 3; i += 3) {
          const dist = 28 + Math.random() * 20;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          starPositions[i] = dist * Math.sin(phi) * Math.cos(theta);
          starPositions[i + 1] = dist * Math.sin(phi) * Math.sin(theta);
          starPositions[i + 2] = dist * Math.cos(phi);
        }
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
        const starMat = new THREE.PointsMaterial({
          color: 0x9bc2ff,
          size: 0.14,
          transparent: true,
          opacity: 0.75,
        });
        scene.add(new THREE.Points(starGeo, starMat));

        // 2. Solar Directional & Ambient Cosmic Lighting
        const sunLight = new THREE.DirectionalLight(0xffffff, 2.6);
        sunLight.position.set(5, 3, 5);
        scene.add(sunLight);

        const ambientLight = new THREE.AmbientLight(0x16233d, 1.4);
        scene.add(ambientLight);

        // 3. High-Definition Earth Textures Loader (Zero external network, local in /public)
        const loader = new THREE.TextureLoader();
        const dayTexture = loader.load("/earth_atmos.jpg");
        const nightTexture = loader.load("/earth_night.jpg");
        const normalTexture = loader.load("/earth_normal.jpg");
        const specularTexture = loader.load("/earth_specular.jpg");
        const cloudsTexture = loader.load("/earth_clouds.png");

        dayTexture.colorSpace = THREE.SRGBColorSpace;
        nightTexture.colorSpace = THREE.SRGBColorSpace;
        globeTexturesRef.current = { dayTexture, nightTexture };

        // 4. Primary 3D Earth Mesh (Terrain Normal Bump + Ocean Specularity)
        const earthGeo = new THREE.SphereGeometry(1.0, 64, 64);
        const isSat = theme === "satellite";
        const earthMat = new THREE.MeshPhongMaterial({
          map: isSat ? dayTexture : nightTexture,
          bumpMap: normalTexture,
          bumpScale: 0.04,
          specularMap: specularTexture,
          specular: new THREE.Color(0x334466),
          shininess: 28,
          emissive: isSat ? new THREE.Color(0x000000) : new THREE.Color(0xffd580),
          emissiveMap: isSat ? null : nightTexture,
          emissiveIntensity: isSat ? 0 : 0.85,
        });
        globeMaterialRef.current = earthMat;

        const earthMesh = new THREE.Mesh(earthGeo, earthMat);
        earthMesh.rotation.y = -3.07; // Centered precisely on India and the Bay of Bengal
        earthMesh.rotation.x = 0.35;
        globeEarthMeshRef.current = earthMesh;
        scene.add(earthMesh);

        // 5. Dynamic Concentric Atmospheric Cloud Layer
        const cloudsGeo = new THREE.SphereGeometry(1.018, 64, 64);
        const cloudsMat = new THREE.MeshPhongMaterial({
          map: cloudsTexture,
          transparent: true,
          opacity: 0.44,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
        earthMesh.add(cloudsMesh);

        // 6. Atmospheric Rim Glow Horizon Halo
        const haloGeo = new THREE.SphereGeometry(1.07, 48, 48);
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0x4fb3ff,
          transparent: true,
          opacity: 0.22,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
        });
        scene.add(new THREE.Mesh(haloGeo, haloMat));

        const outerHaloGeo = new THREE.SphereGeometry(1.22, 32, 32);
        const outerHaloMat = new THREE.MeshBasicMaterial({
          color: 0x1d4ed8,
          transparent: true,
          opacity: 0.08,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
        });
        scene.add(new THREE.Mesh(outerHaloGeo, outerHaloMat));

        // 7. Live 3D Cyclone Dana Vortex in the Bay of Bengal (19.82°N, 86.1°E)
        const cycloneCenter = latLngToVector3(19.82, 86.1, 1.025);
        const cycloneGroup = new THREE.Group();
        cycloneGroup.position.set(cycloneCenter.x, cycloneCenter.y, cycloneCenter.z);
        cycloneGroup.lookAt(new THREE.Vector3(cycloneCenter.x * 2, cycloneCenter.y * 2, cycloneCenter.z * 2));

        // Swirling spiral storm particles
        const spiralCount = 140;
        const spiralGeo = new THREE.BufferGeometry();
        const spiralPos = new Float32Array(spiralCount * 3);
        const spiralCol = new Float32Array(spiralCount * 3);
        for (let i = 0; i < spiralCount; i++) {
          const arm = i % 2;
          const t = i / spiralCount;
          const angle = t * Math.PI * 5 + arm * Math.PI;
          const rad = 0.015 + t * 0.11;
          spiralPos[i * 3] = Math.cos(angle) * rad;
          spiralPos[i * 3 + 1] = Math.sin(angle) * rad;
          spiralPos[i * 3 + 2] = 0.002;

          spiralCol[i * 3] = 1.0;
          spiralCol[i * 3 + 1] = 0.25 + t * 0.55;
          spiralCol[i * 3 + 2] = 0.25;
        }
        spiralGeo.setAttribute("position", new THREE.BufferAttribute(spiralPos, 3));
        spiralGeo.setAttribute("color", new THREE.BufferAttribute(spiralCol, 3));
        const spiralMat = new THREE.PointsMaterial({
          size: 0.016,
          vertexColors: true,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
        });
        const cycloneParticles = new THREE.Points(spiralGeo, spiralMat);
        cycloneGroup.add(cycloneParticles);

        // Concentric radar pulsing ring
        const pingRingGeo = new THREE.RingGeometry(0.02, 0.065, 32);
        const pingRingMat = new THREE.MeshBasicMaterial({
          color: 0xff4d5e,
          transparent: true,
          opacity: 0.75,
          side: THREE.DoubleSide,
        });
        const pingRing = new THREE.Mesh(pingRingGeo, pingRingMat);
        cycloneGroup.add(pingRing);
        earthMesh.add(cycloneGroup);

        // 8. 3D Tactical Evacuation & Air Dispatch Arcs
        const createArc = (start: [number, number], end: [number, number], color: number, heightMult = 1.22) => {
          const p1 = latLngToVector3(start[0], start[1], 1.015);
          const p2 = latLngToVector3(end[0], end[1], 1.015);
          const v1 = new THREE.Vector3(p1.x, p1.y, p1.z);
          const v2 = new THREE.Vector3(p2.x, p2.y, p2.z);
          const mid = v1.clone().add(v2).multiplyScalar(0.5);
          mid.normalize().multiplyScalar(heightMult);

          const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
          const pts = curve.getPoints(36);
          const geo = new THREE.BufferGeometry().setFromPoints(pts);
          const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 });
          return new THREE.Line(geo, mat);
        };

        earthMesh.add(createArc([28.61, 77.2], [20.29, 85.82], 0x3b6cff, 1.24)); // New Delhi -> Bhubaneswar
        earthMesh.add(createArc([20.29, 85.82], [19.81, 85.83], 0x2fd07f, 1.08)); // Bhubaneswar -> Puri
        earthMesh.add(createArc([17.68, 83.21], [20.31, 86.61], 0xff8a3d, 1.16)); // Vizag -> Paradip
        earthMesh.add(createArc([22.57, 88.36], [20.29, 85.82], 0xf5c542, 1.12)); // Kolkata -> Bhubaneswar

        // 9. 3D Strategic Disaster Hub Pins on Indian Landmass
        INDIAN_STRATEGIC_HUBS.forEach((hub) => {
          const p = latLngToVector3(hub.lat, hub.lng, 1.018);
          const pinGeo = new THREE.SphereGeometry(0.014, 16, 16);
          const pinMat = new THREE.MeshBasicMaterial({ color: hub.color });
          const pinMesh = new THREE.Mesh(pinGeo, pinMat);
          pinMesh.position.set(p.x, p.y, p.z);
          earthMesh.add(pinMesh);

          const ringGeo = new THREE.RingGeometry(0.018, 0.032, 24);
          const ringMat = new THREE.MeshBasicMaterial({
            color: hub.color,
            transparent: true,
            opacity: hub.isAlert ? 0.9 : 0.45,
            side: THREE.DoubleSide,
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.position.set(p.x * 1.002, p.y * 1.002, p.z * 1.002);
          ringMesh.lookAt(new THREE.Vector3(p.x * 2, p.y * 2, p.z * 2));
          earthMesh.add(ringMesh);
        });

        // 10. Smooth Inertial Orbit & Mouse Drag Controls
        let isDragging = false;
        let prevX = 0;
        let prevY = 0;

        const onMouseDown = (e: MouseEvent) => {
          isDragging = true;
          prevX = e.clientX;
          prevY = e.clientY;
        };

        const onMouseMove = (e: MouseEvent) => {
          if (!isDragging) return;
          const deltaX = e.clientX - prevX;
          const deltaY = e.clientY - prevY;
          prevX = e.clientX;
          prevY = e.clientY;
          earthMesh.rotation.y += deltaX * 0.005;
          earthMesh.rotation.x = Math.max(-1.1, Math.min(1.1, earthMesh.rotation.x + deltaY * 0.005));
        };

        const onMouseUp = () => {
          isDragging = false;
        };

        const onWheel = (e: WheelEvent) => {
          e.preventDefault();
          globeDistanceRef.current = Math.max(1.45, Math.min(4.2, globeDistanceRef.current + e.deltaY * 0.0018));
        };

        container.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        container.addEventListener("wheel", onWheel, { passive: false });

        // 11. 60 FPS Render & Animation Loop
        let ringScale = 1.0;
        const animate = () => {
          if (!isMounted) return;

          // Camera zoom damping
          camera.position.z += (globeDistanceRef.current - camera.position.z) * 0.12;

          // Gentle idle planetary rotation when not dragging
          if (!isDragging) {
            earthMesh.rotation.y += 0.0006;
          }

          // Atmospheric cloud layer rotation
          cloudsMesh.rotation.y += 0.0009;

          // Cyclone Dana vortex rotation
          cycloneParticles.rotation.z += 0.016;

          // Radar pulse ring
          ringScale += 0.012;
          if (ringScale > 2.2) ringScale = 0.8;
          pingRing.scale.set(ringScale, ringScale, 1);
          (pingRing.material as any).opacity = Math.max(0, 0.85 - (ringScale - 0.8) / 1.4);

          renderer.render(scene, camera);
          animId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
          if (!container || !renderer || !camera) return;
          const w = container.clientWidth;
          const h = container.clientHeight;
          if (w > 0 && h > 0) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
          }
        };
        window.addEventListener("resize", handleResize);

        return () => {
          isMounted = false;
          cancelAnimationFrame(animId);
          window.removeEventListener("resize", handleResize);
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("mouseup", onMouseUp);
          container.removeEventListener("wheel", onWheel);
          if (renderer && renderer.domElement) {
            renderer.dispose();
          }
        };
      } catch (err) {
        console.warn("[Three.js Globe] Fallback to 2D tactical map due to WebGL:", err);
        setMode("2d");
      }
    });

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
    };
  }, [mode]);

  // Camera Actions (Unified for 2D Tactical GIS and 3D Real Earth)
  const handleZoomIn = () => {
    if (mode === "2d" && mapRef.current) {
      mapRef.current.zoomIn(1);
    } else if (mode === "globe") {
      globeDistanceRef.current = Math.max(1.45, globeDistanceRef.current - 0.35);
    }
  };

  const handleZoomOut = () => {
    if (mode === "2d" && mapRef.current) {
      mapRef.current.zoomOut(1);
    } else if (mode === "globe") {
      globeDistanceRef.current = Math.min(4.2, globeDistanceRef.current + 0.35);
    }
  };

  const handleResetCamera = () => {
    if (mode === "2d" && mapRef.current) {
      mapRef.current.flyTo([initialCenter[1], initialCenter[0]], initialZoom, {
        duration: 1.2,
      });
    } else if (mode === "globe" && globeEarthMeshRef.current) {
      globeDistanceRef.current = 2.4;
      globeEarthMeshRef.current.rotation.y = -3.07;
      globeEarthMeshRef.current.rotation.x = 0.35;
    }
  };

  const toggleLayer = (key: keyof typeof visibleLayers) => {
    setVisibleLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-[#F5F3ED] select-none flex flex-col"
      style={{ height }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TOP FLOATING CONTROL BAR (Mode, Tile Theme, Layer Toggles)
         ───────────────────────────────────────────────────────────── */}
      {showTopBar && (
        <div className="absolute top-3 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Left: 3D Globe / 2D Tactical Pill Bar */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/95 border border-[#E7E2DA] backdrop-blur-xl shadow-[0_8px_20px_rgba(124,58,237,0.08)] pointer-events-auto">
            <button
              type="button"
              onClick={() => setMode("2d")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === "2d"
                  ? "bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] border border-[#7C3AED]"
                  : "text-[#5D5775] hover:text-[#1C1929] hover:bg-[#F3E8FF]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Tactical GIS</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("globe")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === "globe"
                  ? "bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] border border-[#7C3AED]"
                  : "text-[#5D5775] hover:text-[#1C1929] hover:bg-[#F3E8FF]"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>3D Real Earth</span>
            </button>
          </div>

          {/* Center/Right: Satellite vs Dark Theme + Layer Toggles */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Tile Layer Style Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-white/95 border border-[#E7E2DA] backdrop-blur-xl shadow-[0_8px_20px_rgba(124,58,237,0.08)]">
              <button
                type="button"
                onClick={() => setTheme("satellite")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  theme === "satellite"
                    ? "bg-[#059669]/15 text-[#059669] border border-[#059669]/30"
                    : "text-[#5D5775] hover:text-[#1C1929]"
                }`}
              >
                Satellite
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  theme === "dark"
                    ? "bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30"
                    : "text-[#5D5775] hover:text-[#1C1929]"
                }`}
              >
                Light Vector
              </button>
              <button
                type="button"
                onClick={() => setTheme("osm")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  theme === "osm"
                    ? "bg-[#7C3AED] text-white shadow-sm"
                    : "text-[#5D5775] hover:text-[#1C1929]"
                }`}
              >
                Streets
              </button>
            </div>

            {/* Quick Layer Filter Badges */}
            <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-white/95 border border-[#E7E2DA] backdrop-blur-xl shadow-[0_8px_20px_rgba(124,58,237,0.08)] text-[10px]">
              <button
                type="button"
                onClick={() => toggleLayer("hazards")}
                className={`px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                  visibleLayers.hazards ? "bg-[#DC2626]/15 text-[#DC2626]" : "text-[#767092] hover:text-[#1C1929]"
                }`}
              >
                Hazards
              </button>
              <button
                type="button"
                onClick={() => toggleLayer("shelters")}
                className={`px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                  visibleLayers.shelters ? "bg-[#059669]/15 text-[#059669]" : "text-[#767092] hover:text-[#1C1929]"
                }`}
              >
                Shelters
              </button>
              <button
                type="button"
                onClick={() => toggleLayer("hospitals")}
                className={`px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                  visibleLayers.hospitals ? "bg-[#7C3AED]/15 text-[#7C3AED]" : "text-[#767092] hover:text-[#1C1929]"
                }`}
              >
                Hospitals
              </button>
              <button
                type="button"
                onClick={() => toggleLayer("resources")}
                className={`px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                  visibleLayers.resources ? "bg-[#EA580C]/15 text-[#EA580C]" : "text-[#767092] hover:text-[#1C1929]"
                }`}
              >
                NDRF Fleets
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. MAP SURFACES: LEAFLET GIS CANVAS & THREE.JS 3D GLOBE
         ───────────────────────────────────────────────────────────── */}
      {/* A. Leaflet 2D Tactical GIS Surface */}
      <div
        ref={containerRef}
        className={`absolute inset-0 w-full h-full bg-[#F5F3ED] transition-opacity duration-200 ${
          mode === "2d" ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 pointer-events-none z-0"
        }`}
      />

      {/* B. Three.js 3D Real Earth Globe Surface */}
      <div
        ref={globeContainerRef}
        className={`absolute inset-0 w-full h-full bg-[#030612] flex items-center justify-center cursor-grab active:cursor-grabbing transition-opacity duration-200 ${
          mode === "globe" ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 pointer-events-none z-0"
        }`}
      />

      {/* ─────────────────────────────────────────────────────────────
          3. FLOATING CAMERA ZOOM & ROTATION BUTTONS
         ───────────────────────────────────────────────────────────── */}
      {showCameraControls && (
        <div className="absolute bottom-6 right-4 z-[400] flex flex-col gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-9 h-9 rounded-xl bg-white/95 text-[#5D5775] hover:text-[#7C3AED] hover:bg-[#F3E8FF] flex items-center justify-center transition-all border border-[#E7E2DA] backdrop-blur-md shadow-[0_8px_20px_rgba(124,58,237,0.08)] cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-9 h-9 rounded-xl bg-white/95 text-[#5D5775] hover:text-[#7C3AED] hover:bg-[#F3E8FF] flex items-center justify-center transition-all border border-[#E7E2DA] backdrop-blur-md shadow-[0_8px_20px_rgba(124,58,237,0.08)] cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetCamera}
            className="w-9 h-9 rounded-xl bg-white/95 text-[#7C3AED] hover:text-white hover:bg-[#7C3AED] flex items-center justify-center transition-all border border-[#E7E2DA] backdrop-blur-md shadow-[0_8px_20px_rgba(124,58,237,0.08)] cursor-pointer"
            title="Reset Camera to India"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. BOTTOM GIS TELEMETRY READOUT
         ───────────────────────────────────────────────────────────── */}
      {showTelemetryBar && (
        <div className="absolute bottom-4 left-4 z-[400] flex items-center gap-2.5 text-[11px] font-mono text-[#5D5775] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#E7E2DA] shadow-[0_8px_20px_rgba(124,58,237,0.08)] pointer-events-none">
          <span>LAT: {coords.lat.toFixed(4)}°N</span>
          <span>LON: {coords.lng.toFixed(4)}°E</span>
          <span>ZOOM: {coords.zoom.toFixed(1)}</span>
          <span className="text-[#059669] font-bold">● WGS-84 ACTIVE</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. CLICKED ENTITY INSPECTOR DRAWER (Modal on Pin Click)
         ───────────────────────────────────────────────────────────── */}
      {selectedEntity && (
        <div className="absolute top-16 left-4 z-[500] max-w-sm rounded-[22px] border border-[#E7E2DA] bg-white/98 backdrop-blur-2xl p-4 text-[#1C1929] shadow-[0_20px_50px_rgba(124,58,237,0.14)] animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start justify-between gap-3 pb-2 border-b border-[#E7E2DA]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#7C3AED] font-bold">
                GIS Entity Telemetry
              </span>
              <h4 className="text-sm font-bold text-[#1C1929] mt-0.5">
                {selectedEntity.name || selectedEntity.requesterName || selectedEntity.id}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setSelectedEntity(null)}
              className="w-6 h-6 rounded-full bg-[#F8F7F4] hover:bg-[#F3E8FF] text-[#5D5775] hover:text-[#7C3AED] flex items-center justify-center text-xs transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-2.5 space-y-2 text-xs">
            {selectedEntity.type && (
              <div className="flex justify-between text-[11px]">
                <span className="text-[#5D5775]">Type:</span>
                <span className="font-semibold text-[#1C1929] capitalize">{selectedEntity.type}</span>
              </div>
            )}
            {selectedEntity.severity && (
              <div className="flex justify-between text-[11px]">
                <span className="text-[#5D5775]">Severity:</span>
                <span
                  className={`font-bold uppercase ${
                    selectedEntity.severity === "critical"
                      ? "text-[#DC2626]"
                      : selectedEntity.severity === "high"
                      ? "text-[#EA580C]"
                      : "text-[#059669]"
                  }`}
                >
                  {selectedEntity.severity}
                </span>
              </div>
            )}
            {(selectedEntity.affectedPopulation || selectedEntity.affected_population) && (
              <div className="flex justify-between text-[11px]">
                <span className="text-[#5D5775]">Affected Pop:</span>
                <span className="font-mono font-bold text-[#1C1929]">
                  {(selectedEntity.affectedPopulation || selectedEntity.affected_population).toLocaleString()}
                </span>
              </div>
            )}
            {selectedEntity.capacity && (
              <div className="flex justify-between text-[11px]">
                <span className="text-[#5D5775]">Occupancy:</span>
                <span className="font-mono text-[#059669] font-bold">
                  {selectedEntity.currentOccupancy ?? selectedEntity.current_occupancy ?? 0} /{" "}
                  {selectedEntity.capacity}
                </span>
              </div>
            )}
            {extractLatLng(selectedEntity) && (
              <div className="flex justify-between text-[11px]">
                <span className="text-[#5D5775]">Coordinates:</span>
                <span className="font-mono text-[#7C3AED] font-semibold">
                  {extractLatLng(selectedEntity)!.lat.toFixed(4)}°N,{" "}
                  {extractLatLng(selectedEntity)!.lng.toFixed(4)}°E
                </span>
              </div>
            )}
            {selectedEntity.description && (
              <p className="text-[11px] text-[#5D5775] pt-1 border-t border-[#E7E2DA]">
                {selectedEntity.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
