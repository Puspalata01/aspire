import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

export interface CitizenSector {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zone: string;
  district: string;
}

export const CITIZEN_SECTORS: CitizenSector[] = [
  { id: "puri_beach", name: "Puri Shoreline Sector", lat: 19.7983, lng: 85.8249, zone: "Coastal Critical", district: "Puri" },
  { id: "konark", name: "Konark Delta Sector", lat: 19.8876, lng: 86.0945, zone: "Coastal High Risk", district: "Puri" },
  { id: "bhubaneswar", name: "Bhubaneswar Central", lat: 20.2961, lng: 85.8245, zone: "Inland Moderate", district: "Khordha" },
  { id: "cuttack", name: "Cuttack Mahanadi Basin", lat: 20.4625, lng: 85.8830, zone: "Flood Watch", district: "Cuttack" },
  { id: "paradip", name: "Paradip Port Shoreline", lat: 20.3164, lng: 86.6114, zone: "Coastal Critical", district: "Jagatsinghpur" },
  { id: "kendrapara", name: "Kendrapara Coastal", lat: 20.5000, lng: 86.4200, zone: "Surge Watch", district: "Kendrapara" },
  { id: "baleswar", name: "Baleswar Coast", lat: 21.4934, lng: 86.9135, zone: "High Wind Watch", district: "Baleswar" },
];

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return 0;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

interface CitizenLocationState {
  lat: number;
  lng: number;
  locationName: string;
  sectorId: string;
  isGPS: boolean;
  accuracyMeters: number | null;
  isLocating: boolean;
  maxDistanceFilterKm: number; // For filtering shelters/alerts: 5, 15, 30, or 999 (all)
  notificationsEnabled: boolean;
  setSector: (sectorId: string) => void;
  setCoordinates: (lat: number, lng: number, name?: string) => void;
  setMaxDistanceFilterKm: (km: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  detectGPS: () => Promise<void>;
}

export const useCitizenLocationStore = create<CitizenLocationState>()(
  persist(
    (set, get) => ({
      lat: CITIZEN_SECTORS[0].lat,
      lng: CITIZEN_SECTORS[0].lng,
      locationName: CITIZEN_SECTORS[0].name,
      sectorId: CITIZEN_SECTORS[0].id,
      isGPS: false,
      accuracyMeters: null,
      isLocating: false,
      maxDistanceFilterKm: 15, // Default: show facilities within 15 km
      notificationsEnabled: false,

      setSector: (sectorId: string) => {
        const sector = CITIZEN_SECTORS.find((s) => s.id === sectorId);
        if (sector) {
          set({
            sectorId: sector.id,
            lat: sector.lat,
            lng: sector.lng,
            locationName: sector.name,
            isGPS: false,
            accuracyMeters: null,
          });
          toast.info(`Active area switched to ${sector.name}. Facilities & alerts updated.`);
        }
      },

      setCoordinates: (lat: number, lng: number, name = "Custom GPS Coordinates") => {
        set({ lat, lng, locationName: name, isGPS: true });
      },

      setMaxDistanceFilterKm: (km: number) => {
        set({ maxDistanceFilterKm: km });
      },

      setNotificationsEnabled: (enabled: boolean) => {
        set({ notificationsEnabled: enabled });
      },

      detectGPS: async () => {
        if (typeof window === "undefined" || !navigator.geolocation) {
          toast.error("Geolocation is not supported by your browser.");
          return;
        }

        set({ isLocating: true });
        toast.loading("Acquiring GPS satellite telemetry...", { id: "gps-fetch" });

        return new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude, accuracy } = position.coords;
              set({
                lat: latitude,
                lng: longitude,
                locationName: "My Real-Time GPS Location",
                isGPS: true,
                accuracyMeters: Math.round(accuracy),
                isLocating: false,
              });
              toast.success(
                `GPS Acquired: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E (±${Math.round(accuracy)}m). Local facilities updated!`,
                { id: "gps-fetch" }
              );
              resolve();
            },
            (error) => {
              set({ isLocating: false });
              toast.error(
                "Unable to obtain GPS signal. Reverting to Puri Shoreline Sector.",
                { id: "gps-fetch" }
              );
              resolve();
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
          );
        });
      },
    }),
    {
      name: "aspire-citizen-location-storage",
      partialize: (state) => ({
        lat: state.lat,
        lng: state.lng,
        locationName: state.locationName,
        sectorId: state.sectorId,
        isGPS: state.isGPS,
        maxDistanceFilterKm: state.maxDistanceFilterKm,
        notificationsEnabled: state.notificationsEnabled,
      }),
    }
  )
);
