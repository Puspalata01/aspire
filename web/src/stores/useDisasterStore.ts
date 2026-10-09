import { create } from "zustand";
import { Disaster, DashboardKPIs, Alert, AIInsight } from "@/types";
import {
  MOCK_ACTIVE_DISASTER,
  MOCK_KPIS,
  MOCK_ALERTS,
  MOCK_AI_INSIGHTS,
} from "@/lib/mock-data";

interface DisasterState {
  disaster: Disaster;
  kpis: DashboardKPIs;
  alerts: Alert[];
  insights: AIInsight[];
  simulationRainfallMm: number;
  simulationWindSpeedKmh: number;
  simulationTideHeightM: number;
  isSimulating: boolean;
  setDisaster: (disaster: Disaster) => void;
  setKPIs: (kpis: DashboardKPIs) => void;
  dismissAlert: (id: string) => void;
  setSimulationParam: (key: "simulationRainfallMm" | "simulationWindSpeedKmh" | "simulationTideHeightM", val: number) => void;
  runSimulation: () => void;
  resetSimulation: () => void;
}

export const useDisasterStore = create<DisasterState>((set) => ({
  disaster: MOCK_ACTIVE_DISASTER,
  kpis: MOCK_KPIS,
  alerts: MOCK_ALERTS,
  insights: MOCK_AI_INSIGHTS,
  simulationRainfallMm: 320,
  simulationWindSpeedKmh: 140,
  simulationTideHeightM: 2.2,
  isSimulating: false,

  setDisaster: (disaster) => set({ disaster }),
  setKPIs: (kpis) => set({ kpis }),
  dismissAlert: (id) =>
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),

  setSimulationParam: (key, val) =>
    set((state) => ({
      ...state,
      [key]: val,
    })),

  runSimulation: () => {
    set({ isSimulating: true });
    setTimeout(() => {
      set((state) => ({
        isSimulating: false,
        kpis: {
          ...state.kpis,
          totalAffected: Math.round(state.kpis.totalAffected * (1 + state.simulationRainfallMm / 1000)),
          criticalSOSCount: Math.round(state.kpis.criticalSOSCount + state.simulationTideHeightM * 2),
        },
      }));
    }, 1200);
  },

  resetSimulation: () =>
    set({
      simulationRainfallMm: 320,
      simulationWindSpeedKmh: 140,
      simulationTideHeightM: 2.2,
      kpis: MOCK_KPIS,
    }),
}));
