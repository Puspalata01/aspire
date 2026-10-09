import { create } from "zustand";
import { APP_CONFIG } from "@/lib/constants";

export interface MapLayerVisibility {
  floodZones: boolean;
  cycloneTrack: boolean;
  sosMarkers: boolean;
  shelters: boolean;
  hospitals: boolean;
  roadNetwork: boolean;
  ndrfUnits: boolean;
  satelliteWeather: boolean;
}

interface MapState {
  center: { lat: number; lng: number };
  zoom: number;
  pitch: number;
  bearing: number;
  style: "dark" | "satellite" | "streets";
  layers: MapLayerVisibility;
  selectedEntity: {
    type: "sos" | "shelter" | "hospital" | "hazard" | "resource" | "road";
    id: string;
    data: any;
  } | null;
  setViewport: (center: { lat: number; lng: number }, zoom?: number) => void;
  toggleLayer: (layer: keyof MapLayerVisibility) => void;
  setAllLayers: (visible: boolean) => void;
  setStyle: (style: "dark" | "satellite" | "streets") => void;
  setSelectedEntity: (
    entity: {
      type: "sos" | "shelter" | "hospital" | "hazard" | "resource" | "road";
      id: string;
      data: any;
    } | null
  ) => void;
  resetView: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: { lat: APP_CONFIG.defaultCenter.lat, lng: APP_CONFIG.defaultCenter.lng },
  zoom: APP_CONFIG.defaultCenter.zoom,
  pitch: 35,
  bearing: -10,
  style: "dark",
  layers: {
    floodZones: true,
    cycloneTrack: true,
    sosMarkers: true,
    shelters: true,
    hospitals: true,
    roadNetwork: true,
    ndrfUnits: true,
    satelliteWeather: false,
  },
  selectedEntity: null,

  setViewport: (center, zoom) =>
    set((state) => ({
      center,
      zoom: zoom !== undefined ? zoom : state.zoom,
    })),

  toggleLayer: (layer) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: !state.layers[layer],
      },
    })),

  setAllLayers: (visible) =>
    set((state) => ({
      layers: {
        floodZones: visible,
        cycloneTrack: visible,
        sosMarkers: visible,
        shelters: visible,
        hospitals: visible,
        roadNetwork: visible,
        ndrfUnits: visible,
        satelliteWeather: visible,
      },
    })),

  setStyle: (style) => set({ style }),

  setSelectedEntity: (entity) => set({ selectedEntity: entity }),

  resetView: () =>
    set({
      center: { lat: APP_CONFIG.defaultCenter.lat, lng: APP_CONFIG.defaultCenter.lng },
      zoom: APP_CONFIG.defaultCenter.zoom,
      pitch: 35,
      bearing: -10,
    }),
}));
