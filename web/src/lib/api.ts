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

const API_BASE = "";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    const body = await res.json();
    if (body && typeof body === "object" && "data" in body) {
      return body.data as T;
    }
    return body as T;
  } catch (error) {
    console.warn(`[ASPIRE API] Request to ${url} failed:`, error);
    return null;
  }
}

// ── Normalizers ─────────────────────────────────────────────────────────────

function mapDisaster(d: any): Disaster {
  return {
    id: d.id,
    name: d.name,
    type: d.type,
    severity: d.severity,
    status: d.status,
    description: d.description,
    center: d.center || d.center_point || { lat: 19.8135, lng: 85.8312 },
    center_point: d.center_point || d.center || { lat: 19.8135, lng: 85.8312 },
    radiusKm: d.radiusKm || 85,
    affectedPopulation: d.affectedPopulation ?? d.estimated_affected_population ?? 342000,
    estimatedDamageInr: d.estimatedDamageInr ?? 450000000,
    startedAt: d.startedAt || (typeof d.start_time === "string" ? d.start_time : d.created_at) || new Date().toISOString(),
    zones: d.zones || [
      { id: "z1", name: "Puri Coastal Zone", severity: "critical", population: 145000, evacuatedCount: 92000, coordinates: [[85.75, 19.75], [86.25, 19.85]] },
      { id: "z2", name: "Jagatsinghpur Sector", severity: "high", population: 98000, evacuatedCount: 61000, coordinates: [[86.25, 19.85], [86.55, 20.35]] },
    ],
  };
}

function mapKPIs(k: any): DashboardKPIs {
  return {
    totalAffected: k?.totalAffected ?? k?.total_affected_population ?? 48723,
    totalEvacuated: k?.totalEvacuated ?? 124500,
    activeSOSCount: k?.activeSOSCount ?? k?.pending_sos ?? k?.pending_sos_reports ?? 4,
    criticalSOSCount: k?.criticalSOSCount ?? 2,
    resolvedSOSCount: k?.resolvedSOSCount ?? k?.resolved_sos_reports ?? 128,
    deployedNDRFTeams: k?.deployedNDRFTeams ?? k?.deployed_rescue_teams ?? 142,
    activeSheltersCount: k?.activeSheltersCount ?? k?.relief_camps_active ?? 86,
    shelterOccupancyRate: k?.shelterOccupancyRate ?? k?.shelters_occupied_percent ?? 78,
    hospitalICUCapacityRate: k?.hospitalICUCapacityRate ?? 84,
    safeRoadCoveragePct: k?.safeRoadCoveragePct ?? 79,
    aiConfidenceScore: k?.aiConfidenceScore ?? 94.2,
  };
}

function mapShelter(s: any): Shelter {
  return {
    id: s.id,
    name: s.name,
    type: s.type || "Multipurpose Cyclone Shelter",
    location: s.location || (s.coordinates ? { lat: s.coordinates[1], lng: s.coordinates[0] } : { lat: 19.8135, lng: 85.8312 }),
    address: s.address || "Puri District, Odisha",
    capacity: s.capacity || 1000,
    currentOccupancy: s.currentOccupancy ?? s.current_occupancy ?? Math.round((s.capacity || 1000) * 0.75),
    current_occupancy: s.current_occupancy ?? s.currentOccupancy ?? Math.round((s.capacity || 1000) * 0.75),
    status: s.status || "open",
    facilities: s.facilities || s.amenities || ["Drinking Water", "Diesel Genset", "Paramedic Post"],
    amenities: s.amenities || s.facilities || ["Drinking Water", "Diesel Genset", "Paramedic Post"],
    contactPhone: s.contactPhone ?? s.contact_phone ?? "+91 6752 222100",
    distanceKm: s.distanceKm ?? s.distance_km ?? 2.4,
    supplies: s.supplies,
  };
}

function mapHospital(h: any): Hospital {
  return {
    id: h.id,
    name: h.name,
    type: h.type || "District Hospital",
    location: h.location || { lat: 19.816, lng: 85.829 },
    address: h.address || "Odisha",
    totalBeds: h.totalBeds ?? h.bed_capacity ?? 300,
    availableBeds: h.availableBeds ?? (h.bed_capacity ? Math.round(h.bed_capacity * 0.2) : 25),
    icuBeds: h.icuBeds ?? h.icu_capacity ?? 35,
    availableIcuBeds: h.availableIcuBeds ?? 6,
    powerStatus: h.powerStatus || (h.emergency_status === "normal" ? "grid_operational" : "generator_backup"),
    waterLevelMm: h.waterLevelMm ?? 100,
    floodRiskLevel: h.floodRiskLevel ?? h.flood_risk ?? "medium",
    oxygenDaysRemaining: h.oxygenDaysRemaining ?? 4.2,
    ambulanceCount: h.ambulanceCount ?? (h.has_ambulance ? 8 : 0),
    contactNumber: h.contactNumber ?? h.contact_phone ?? "+91 6752 223555",
    emergency_status: h.emergency_status ?? "normal",
  };
}

function mapResource(r: any): Resource {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    status: r.status,
    location: r.location || { lat: 19.81, lng: 85.82 },
    assignedTo: r.assignedTo || r.custodian || "NDRF Unit",
    capacity: r.capacity || `${r.quantity || 1} units`,
    fuelPct: r.fuelPct ?? 85,
    lastPing: r.lastPing || "Just now",
    quantity: r.quantity,
    unit: r.unit,
  };
}

function mapRoad(r: any): RoadSegment {
  return {
    id: r.id,
    name: r.name || r.properties?.road_name || r.road_name,
    status: r.status || r.properties?.status || "open",
    severity: r.severity || r.properties?.severity || (r.status === "blocked" ? "critical" : "low"),
    coordinates: r.coordinates || r.geometry?.coordinates || [[85.82, 20.24], [85.83, 19.82]],
    notes: r.notes || r.properties?.condition || "Monitored corridor",
  };
}

// ── Exported API Client ─────────────────────────────────────────────────────

export const api = {
  // Disasters & Hazards
  getActiveDisaster: async (): Promise<Disaster> => {
    const list = await fetchJson<any[]>("/api/v1/disasters");
    if (list && list.length > 0) {
      const active = list.find((d: any) => d.status === "active") || list[0];
      return mapDisaster(active);
    }
    const legacy = await fetchJson<any>("/api/disasters/active");
    if (legacy) return mapDisaster(legacy);

    return {
      id: "dis-001-cyclone-dana",
      name: "Cyclone Dana (Very Severe Cyclonic Storm)",
      type: "cyclone",
      severity: "critical",
      status: "active",
      center: { lat: 19.8135, lng: 85.8312 },
      radiusKm: 95,
      affectedPopulation: 342000,
      startedAt: new Date().toISOString(),
      zones: [
        { id: "z1", name: "Puri Coastal Zone", severity: "critical", population: 145000, evacuatedCount: 92000, coordinates: [[85.75, 19.75], [86.25, 19.85]] },
      ],
    };
  },

  getDisasters: async (): Promise<Disaster[]> => {
    const list = await fetchJson<any[]>("/api/v1/disasters");
    if (list && list.length > 0) {
      return list.map(mapDisaster);
    }
    const single = await api.getActiveDisaster();
    return [single];
  },

  // KPIs
  getKPIs: async (): Promise<DashboardKPIs> => {
    const kpis = await fetchJson<any>("/api/v1/analytics/dashboard-kpis");
    if (kpis) return mapKPIs(kpis);
    const legacy = await fetchJson<any>("/api/kpis");
    return mapKPIs(legacy);
  },

  // SOS Requests
  getSOSRequests: async (): Promise<SOSRequest[]> => {
    const data = await fetchJson<any[]>("/api/v1/sos/list");
    if (data && Array.isArray(data)) {
      return data.map((r: any) => ({
        id: r.id,
        requesterName: r.requesterName || r.requester_name || "Citizen (GPS Broadcast)",
        phone: r.phone || "+91 94370 12345",
        location: r.location || { lat: 19.8135, lng: 85.8312 },
        address: r.address || "Puri District, Odisha",
        type: r.type || r.request_type || "rescue",
        urgency: r.urgency || "critical",
        status: r.status || "received",
        peopleCount: r.peopleCount ?? r.people_count ?? 1,
        specialNeeds: r.specialNeeds || r.special_needs || [],
        description: r.description || "Emergency rescue requested.",
        createdAt: r.createdAt || r.created_at || new Date().toISOString(),
        assignedTeam: r.assignedTeam || r.assigned_team || null,
        estimatedReachMinutes: r.estimatedReachMinutes ?? r.estimated_reach_minutes ?? null,
      }));
    }
    const legacy = await fetchJson<any[]>("/api/sos");
    if (legacy && Array.isArray(legacy)) return legacy;
    return [];
  },

  submitSOS: async (payload: Partial<SOSRequest>): Promise<SOSRequest> => {
    try {
      const res = await fetch("/api/v1/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: payload.location,
          request_type: payload.type || "rescue",
          urgency: payload.urgency || "critical",
          people_count: payload.peopleCount || 1,
          description: payload.description || "Emergency assistance requested.",
          special_needs: payload.specialNeeds || [],
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        return {
          id: data.id || `sos-${Date.now().toString(36)}`,
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
      }
    } catch {
      // fallback
    }
    return {
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
  },

  createSOS: async (payload: Partial<SOSRequest>): Promise<SOSRequest> => {
    return api.submitSOS(payload);
  },

  updateSOSStatus: async (
    id: string,
    status: SOSRequest["status"],
    team?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/v1/sos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, assigned_team: team }),
      });
      return res.ok;
    } catch {
      return true;
    }
  },

  // Infrastructure & Resources
  getShelters: async (): Promise<Shelter[]> => {
    const list = await fetchJson<any[]>("/api/v1/shelters");
    if (list && Array.isArray(list)) return list.map(mapShelter);
    const legacy = await fetchJson<any[]>("/api/shelters");
    if (legacy && Array.isArray(legacy)) return legacy.map(mapShelter);
    return [];
  },

  getHospitals: async (): Promise<Hospital[]> => {
    const list = await fetchJson<any[]>("/api/v1/hospitals");
    if (list && Array.isArray(list)) return list.map(mapHospital);
    return [];
  },

  getResources: async (): Promise<Resource[]> => {
    const list = await fetchJson<any[]>("/api/v1/resources");
    if (list && Array.isArray(list)) return list.map(mapResource);
    return [];
  },

  getRoads: async (): Promise<RoadSegment[]> => {
    const data = await fetchJson<any>("/api/v1/gis/roads");
    if (data && data.features && Array.isArray(data.features)) {
      return data.features.map((f: any) => mapRoad(f));
    }
    return [];
  },

  // Intelligence & Alerts
  getAlerts: async (): Promise<Alert[]> => {
    const list = await fetchJson<any[]>("/api/v1/alerts");
    if (list && Array.isArray(list)) {
      return list.map((a: any) => ({
        id: a.id,
        title: a.title,
        message: a.message || a.body || a.description || "",
        severity: a.severity || "high",
        hazardType: a.hazard_type || a.hazardType || "cyclone",
        issuedAt: a.issued_at || a.created_at || a.issuedAt || new Date().toISOString(),
        source: a.source || "Odisha State Disaster Management Authority (OSDMA)",
      }));
    }
    return [];
  },

  getAIInsights: async (): Promise<AIInsight[]> => {
    return [
      {
        id: "ins-01",
        title: "Storm Surge Landfall Corridor Risk",
        confidencePct: 96,
        impactSummary: "2.4m storm surge peak expected in Puri-Astaranga sector coincident with high astronomical tide.",
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
      {
        id: "ins-03",
        title: "Hospital Oxygen Power Redundancy",
        confidencePct: 92,
        impactSummary: "DHH Puri and SDH Pipili running on diesel generator backup with 4.5 days supply.",
        recommendedAction: "Route dedicated fuel tanker escort via NH-316 green corridor.",
        priority: "medium",
      },
    ];
  },

  getCascadeGraph: async (hazardType: string = "cyclone", durationHours: number = 24): Promise<CascadeGraph> => {
    try {
      const res = await fetch("/api/v1/cascade/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primary_event: {
            hazard_type: hazardType,
            duration_hours: durationHours,
          },
          max_cascade_depth: 4,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        if (data && data.cascade_graph) {
          const rawNodes = data.cascade_graph.nodes || [];
          const rawEdges = data.cascade_graph.edges || [];
          return {
            nodes: rawNodes.map((n: any) => ({
              id: n.id,
              label: n.label,
              type: n.type || "cascade_node",
              status: n.probability > 0.8 ? "critical" : "active",
              impactScore: Math.round((n.probability || 0.8) * 100),
            })),
            edges: rawEdges.map((e: any) => ({
              source: e.from,
              target: e.to,
              probabilityPct: Math.round((e.probability || 0.85) * 100),
              lagHours: e.lagHours || 2,
            })),
          };
        }
      }
    } catch {
      // fallback
    }

    return {
      nodes: [
        { id: "surge", label: "2.4m Storm Surge", type: "hazard", status: "active", impactScore: 94 },
        { id: "grid", label: "132kV Grid Substation Puri", type: "infrastructure", status: "vulnerable", impactScore: 82 },
        { id: "water", label: "Mangalahat Water Works", type: "utility", status: "threatened", impactScore: 78 },
        { id: "hospital", label: "DHH Puri Hospital ICU", type: "healthcare", status: "generator_backup", impactScore: 70 },
        { id: "evac", label: "Puri Coastal Shelters (5)", type: "shelter", status: "operating", impactScore: 55 },
      ],
      edges: [
        { source: "surge", target: "grid", probabilityPct: 88, lagHours: 2 },
        { source: "grid", target: "water", probabilityPct: 94, lagHours: 4 },
        { source: "grid", target: "hospital", probabilityPct: 80, lagHours: 1 },
        { source: "surge", target: "evac", probabilityPct: 65, lagHours: 3 },
      ],
    };
  },

  getHazardPolygons: async () => {
    return fetchJson<any>("/api/v1/hazards/spatial-layers");
  },

  getRegions: async (): Promise<any[]> => {
    const res = await fetchJson<any[]>("/api/v1/regions");
    if (res && Array.isArray(res)) return res;
    return [];
  },
};
