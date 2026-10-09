import { create } from "zustand";
import { Disaster, DashboardKPIs, Alert, AIInsight } from "@/types";
import { api } from "@/lib/api";

const INITIAL_DISASTER: Disaster = {
  id: "dis-001-cyclone-dana",
  name: "Cyclone Dana (Very Severe Cyclonic Storm)",
  type: "cyclone",
  severity: "critical",
  status: "active",
  description: "Category 4 equivalent cyclone packing sustained winds of 145 km/h. Landfall projected between Dhamra and Puri.",
  center: { lat: 19.8135, lng: 85.8312 },
  center_point: { lat: 19.8135, lng: 85.8312 },
  radiusKm: 95,
  affectedPopulation: 342000,
  estimatedDamageInr: 450000000,
  startedAt: "2026-10-08T02:00:00Z",
  zones: [
    { id: "z1", name: "Puri Coastal Zone", severity: "critical", population: 145000, evacuatedCount: 92000, coordinates: [[85.75, 19.75], [86.25, 19.85]] },
    { id: "z2", name: "Jagatsinghpur Sector", severity: "high", population: 98000, evacuatedCount: 61000, coordinates: [[86.25, 19.85], [86.55, 20.35]] },
  ],
};

const INITIAL_KPIS: DashboardKPIs = {
  totalAffected: 48723,
  totalEvacuated: 124500,
  activeSOSCount: 4,
  criticalSOSCount: 2,
  resolvedSOSCount: 128,
  deployedNDRFTeams: 142,
  activeSheltersCount: 86,
  shelterOccupancyRate: 78,
  hospitalICUCapacityRate: 84,
  safeRoadCoveragePct: 79,
  aiConfidenceScore: 94.2,
};

const INITIAL_ALERTS: Alert[] = [
  {
    id: "alt-01",
    title: "RED ALERT: Cyclone Dana Landfall Imminent",
    message: "Landfall expected within 18 hrs along Puri-Jagatsinghpur coast. 145 km/h gusts with 2.4m storm surge.",
    severity: "critical",
    hazardType: "cyclone",
    issuedAt: "2026-10-09T04:00:00Z",
    source: "IMD & OSDMA Command Center",
  },
  {
    id: "alt-02",
    title: "Mahanadi & Daya River Level Flash Warning",
    message: "River Daya gauge at Kanas reached 11.2m (0.8m above Danger Level). Evacuate flood plains.",
    severity: "critical",
    hazardType: "flood",
    issuedAt: "2026-10-09T03:30:00Z",
    source: "Central Water Commission (CWC)",
  },
  {
    id: "alt-03",
    title: "CRITICAL INFRASTRUCTURE: SH-35 Marine Drive Closed",
    message: "Marine Drive closed from Balighai to Konark due to 1.2m tidal water ingress and fallen electric poles.",
    severity: "high",
    hazardType: "cyclone",
    issuedAt: "2026-10-09T02:15:00Z",
    source: "Odisha State Police & NDRF",
  },
];

const INITIAL_INSIGHTS: AIInsight[] = [
  {
    id: "ins-01",
    title: "Storm Surge Landfall Corridor Risk",
    confidencePct: 96,
    impactSummary: "2.4m storm surge peak expected in Puri-Astaranga sector at 18:00 IST coincident with astronomical high tide.",
    recommendedAction: "Pre-position NDRF boats along NH-316 corridor and restrict marine drive movement immediately.",
    priority: "critical",
  },
  {
    id: "ins-02",
    title: "Daya River Embankment Vulnerability",
    confidencePct: 88,
    impactSummary: "Saturated soil structure near Kanas block risks breaching if discharge exceeds 12,000 cusecs.",
    recommendedAction: "Dispatch sandbag reinforcement teams and prepare 3 village community centers for rapid evacuation.",
    priority: "high",
  },
];

interface DisasterState {
  disaster: Disaster;
  kpis: DashboardKPIs;
  alerts: Alert[];
  insights: AIInsight[];
  simulationRainfallMm: number;
  simulationWindSpeedKmh: number;
  simulationTideHeightM: number;
  isSimulating: boolean;
  isLoading: boolean;
  fetchLatestData: () => Promise<void>;
  setDisaster: (disaster: Disaster) => void;
  setKPIs: (kpis: DashboardKPIs) => void;
  dismissAlert: (id: string) => void;
  setSimulationParam: (key: "simulationRainfallMm" | "simulationWindSpeedKmh" | "simulationTideHeightM", val: number) => void;
  runSimulation: () => Promise<void>;
  resetSimulation: () => void;
}

export const useDisasterStore = create<DisasterState>((set, get) => ({
  disaster: INITIAL_DISASTER,
  kpis: INITIAL_KPIS,
  alerts: INITIAL_ALERTS,
  insights: INITIAL_INSIGHTS,
  simulationRainfallMm: 320,
  simulationWindSpeedKmh: 140,
  simulationTideHeightM: 2.2,
  isSimulating: false,
  isLoading: false,

  fetchLatestData: async () => {
    set({ isLoading: true });
    try {
      const [disaster, kpis, alerts, insights] = await Promise.all([
        api.getActiveDisaster(),
        api.getKPIs(),
        api.getAlerts(),
        api.getAIInsights(),
      ]);
      set({
        disaster: disaster || get().disaster,
        kpis: kpis || get().kpis,
        alerts: alerts && alerts.length > 0 ? alerts : get().alerts,
        insights: insights && insights.length > 0 ? insights : get().insights,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  setDisaster: (disaster) => set({ disaster }),
  setKPIs: (kpis) => set({ kpis }),
  dismissAlert: (id) =>
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),

  setSimulationParam: (key, val) =>
    set((state) => ({
      ...state,
      [key]: val,
    })),

  runSimulation: async () => {
    set({ isSimulating: true });
    try {
      // Connect to backend cascade / ML simulation
      await api.getCascadeGraph("cyclone", 24);
      set((state) => ({
        isSimulating: false,
        kpis: {
          ...state.kpis,
          totalAffected: Math.round(state.kpis.totalAffected * (1 + state.simulationRainfallMm / 1000)),
          criticalSOSCount: Math.round(state.kpis.criticalSOSCount + state.simulationTideHeightM * 2),
        },
      }));
    } catch {
      set({ isSimulating: false });
    }
  },

  resetSimulation: () =>
    set({
      simulationRainfallMm: 320,
      simulationWindSpeedKmh: 140,
      simulationTideHeightM: 2.2,
      kpis: INITIAL_KPIS,
    }),
}));
