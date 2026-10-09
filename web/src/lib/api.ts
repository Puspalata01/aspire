import {
  MOCK_ACTIVE_DISASTER,
  MOCK_KPIS,
  MOCK_SOS_REQUESTS,
  MOCK_SHELTERS,
  MOCK_HOSPITALS,
  MOCK_RESOURCES,
  MOCK_ROADS,
  MOCK_ALERTS,
  MOCK_AI_INSIGHTS,
  MOCK_CASCADE_GRAPH,
} from "./mock-data";
import {
  Disaster,
  DashboardKPIs,
  SOSRequest,
  Shelter,
  Hospital,
  Resource,
  RoadSegment,
  Alert,
  AIInsight,
  CascadeGraph,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

async function fetchWithFallback<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 15 },
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export const api = {
  // Disasters & KPIs
  getActiveDisaster: async (): Promise<Disaster> => {
    return fetchWithFallback<Disaster>("/disasters/active", MOCK_ACTIVE_DISASTER);
  },

  getKPIs: async (): Promise<DashboardKPIs> => {
    return fetchWithFallback<DashboardKPIs>("/kpis", MOCK_KPIS);
  },

  // SOS Requests
  getSOSRequests: async (): Promise<SOSRequest[]> => {
    return fetchWithFallback<SOSRequest[]>("/sos", MOCK_SOS_REQUESTS);
  },

  submitSOS: async (payload: Partial<SOSRequest>): Promise<SOSRequest> => {
    try {
      const res = await fetch(`${API_BASE}/sos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const newRequest: SOSRequest = {
      id: `sos-${Date.now().toString(36)}`,
      requesterName: payload.requesterName || "Anonymous Citizen",
      phone: payload.phone || "Not provided",
      location: payload.location || { lat: 19.8135, lng: 85.8312 },
      address: payload.address || "Live GPS location",
      type: payload.type || "rescue",
      urgency: payload.urgency || "critical",
      status: "received",
      peopleCount: payload.peopleCount || 1,
      specialNeeds: payload.specialNeeds || [],
      description: payload.description || "Emergency assistance requested.",
      createdAt: new Date().toISOString(),
      assignedTeam: null,
      estimatedReachMinutes: null,
    };
    return newRequest;
  },

  updateSOSStatus: async (
    id: string,
    status: SOSRequest["status"],
    team?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/sos/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, team }),
      });
      return res.ok;
    } catch {
      return true;
    }
  },

  // Infrastructure & Resources
  getShelters: async (): Promise<Shelter[]> => {
    return fetchWithFallback<Shelter[]>("/shelters", MOCK_SHELTERS);
  },

  getHospitals: async (): Promise<Hospital[]> => {
    return fetchWithFallback<Hospital[]>("/hospitals", MOCK_HOSPITALS);
  },

  getResources: async (): Promise<Resource[]> => {
    return fetchWithFallback<Resource[]>("/resources", MOCK_RESOURCES);
  },

  getRoads: async (): Promise<RoadSegment[]> => {
    return fetchWithFallback<RoadSegment[]>("/roads", MOCK_ROADS);
  },

  // Intelligence & Alerts
  getAlerts: async (): Promise<Alert[]> => {
    return fetchWithFallback<Alert[]>("/alerts", MOCK_ALERTS);
  },

  getAIInsights: async (): Promise<AIInsight[]> => {
    return fetchWithFallback<AIInsight[]>("/insights", MOCK_AI_INSIGHTS);
  },

  getCascadeGraph: async (): Promise<CascadeGraph> => {
    return fetchWithFallback<CascadeGraph>("/cascade", MOCK_CASCADE_GRAPH);
  },
};
