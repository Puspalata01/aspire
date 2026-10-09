// ─────────────────────────────────────────────
//  ASPIRE — Core TypeScript Type Definitions
// ─────────────────────────────────────────────

// ── Enums ──────────────────────────────────────────────────────────────────

export type SeverityLevel = "low" | "medium" | "high" | "critical";

export type HazardType =
  | "flood"
  | "cyclone"
  | "heatwave"
  | "landslide"
  | "earthquake"
  | "tsunami"
  | "drought"
  | "wildfire";

export type DisasterStatus =
  | "monitoring"
  | "active"
  | "resolving"
  | "resolved"
  | "archived";

export type UserRole = "citizen" | "authority" | "admin" | "super_admin";

export type SOSRequestType =
  | "rescue"
  | "food"
  | "water"
  | "medicine"
  | "shelter"
  | "medical_emergency"
  | "other";

export type SOSStatus =
  | "received"
  | "verified"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "rejected"
  | "duplicate";

export type ResourceType =
  | "rescue_boat"
  | "rescue_team"
  | "ambulance"
  | "helicopter"
  | "food_packet"
  | "water_tanker"
  | "medicine_kit"
  | "tent"
  | "blanket"
  | "generator"
  | "fuel"
  | "communication_kit"
  | "medical_team"
  | "police_force"
  | "fire_engine"
  | "other";

export type ResourceStatus =
  | "available"
  | "deployed"
  | "in_transit"
  | "maintenance"
  | "depleted";

export type ShelterStatus = "open" | "closed" | "full" | "damaged" | "preparing";

export type AccessibilityStatus = "accessible" | "limited" | "inaccessible";

export type RoadStatus =
  | "open"
  | "partially_blocked"
  | "blocked"
  | "destroyed"
  | "under_water";

// ── Geometry ────────────────────────────────────────────────────────────────

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeoFeature {
  type: "Feature";
  id?: string;
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
  properties: Record<string, unknown>;
}

export interface GeoFeatureCollection {
  type: "FeatureCollection";
  features: GeoFeature[];
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  region_id?: string;
  agency?: string;
  permissions: string[];
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  user: User;
}

// ── Disaster ─────────────────────────────────────────────────────────────────

export interface DisasterZone {
  id: string;
  name: string;
  severity: SeverityLevel | string;
  population: number;
  evacuatedCount: number;
  coordinates: number[][];
}

export interface Disaster {
  id: string;
  name: string;
  type: HazardType;
  severity: SeverityLevel;
  status: DisasterStatus;
  region_id?: string;
  start_time?: string;
  end_time?: string;
  description?: string;
  center_point?: GeoPoint;
  center?: GeoPoint;
  radiusKm?: number;
  affectedPopulation?: number;
  estimatedDamageInr?: number;
  startedAt?: string;
  updatedAt?: string;
  zones?: DisasterZone[];
  estimated_affected_population?: number;
  estimated_damage_score?: number;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

// ── Risk Assessment ──────────────────────────────────────────────────────────

export interface ContributingFactor {
  factor: string;
  value: string;
  numeric_value: number;
  unit: string;
  weight: number;
  contribution_score: number;
  description: string;
}

export interface RiskAssessment {
  id: string;
  region_id: string;
  hazard_type: HazardType;
  risk_level: SeverityLevel;
  risk_score: number; // 0-1
  confidence: number; // 0-1
  contributing_factors: ContributingFactor[];
  model_version: string;
  model_name: string;
  explanation?: string;
  recommended_actions: string[];
  previous_score?: number;
  score_trend: "increasing" | "decreasing" | "stable";
  valid_from: string;
  valid_until: string;
  created_at: string;
}

// ── Impact Estimates ─────────────────────────────────────────────────────────

export interface ImpactEstimate {
  id: string;
  disaster_id: string;
  region_id: string;
  population_affected?: number;
  buildings_at_risk?: number;
  roads_at_risk?: number;
  hospitals_at_risk?: number;
  shelters_at_pressure?: number;
  estimated_rescue_demand?: number;
  estimated_medical_demand?: number;
  estimated_food_demand_kg?: number;
  estimated_water_demand_l?: number;
  economic_damage_estimate?: number;
  impact_severity: SeverityLevel;
  impact_score: number; // 0-1
  confidence: number;
  model_name: string;
  created_at: string;
}

// ── Cascade Analysis ─────────────────────────────────────────────────────────

export interface CascadeNode {
  id: string;
  label: string;
  probability: number;
  time_offset_hrs: number;
  type: string;
  affected_systems: string[];
  severity: SeverityLevel;
}

export interface CascadeEdge {
  from: string;
  to: string;
  causality: string;
}

export interface CascadeAnalysis {
  id: string;
  disaster_id: string;
  region_id: string;
  primary_hazard: HazardType;
  cascade_graph: {
    nodes: CascadeNode[];
    edges: CascadeEdge[];
  };
  total_cascade_steps: number;
  max_risk_amplification?: number;
  overall_cascade_score: number;
  confidence: number;
  model_name: string;
  critical_interventions?: Array<{
    intervention: string;
    mitigation_target: string;
    cascade_risk_reduction: string;
  }>;
  created_at: string;
}

// ── Shelter ──────────────────────────────────────────────────────────────────

export interface Shelter {
  id: string;
  name: string;
  type?: string;
  location: GeoPoint;
  address?: string;
  region_id?: string;
  capacity: number;
  current_occupancy?: number;
  currentOccupancy?: number;
  status: ShelterStatus;
  accessibility?: AccessibilityStatus;
  amenities?: string[];
  facilities?: string[];
  contact_phone?: string;
  contactPhone?: string;
  contact_person?: string;
  flood_risk?: SeverityLevel;
  nearest_hospital_km?: number;
  distance_km?: number; // set by API when doing proximity search
  distanceKm?: number;
  supplies?: {
    food_packets_days?: number;
    potable_water_liters?: number;
    generator_fuel_hours?: number;
    medical_staff_on_duty?: number;
  };
  updated_at?: string;
}

// ── Hospital ─────────────────────────────────────────────────────────────────

export interface Hospital {
  id: string;
  name: string;
  type?: string;
  location: GeoPoint;
  address?: string;
  region_id?: string;
  totalBeds?: number;
  availableBeds?: number;
  bed_capacity?: number;
  icuBeds?: number;
  icu_capacity?: number;
  availableIcuBeds?: number;
  current_occupancy?: number;
  powerStatus?: string;
  waterLevelMm?: number;
  floodRiskLevel?: string;
  oxygenDaysRemaining?: number;
  ambulanceCount?: number;
  contactNumber?: string;
  emergency_status?: "normal" | "high_load" | "critical" | "overwhelmed";
  accessibility?: AccessibilityStatus;
  isolation_risk?: SeverityLevel;
  has_emergency_dept?: boolean;
  has_ambulance?: boolean;
  specialties?: string[];
  contact_phone?: string;
  updated_at?: string;
}

// ── Resource ─────────────────────────────────────────────────────────────────

export interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  quantity?: number;
  unit?: string;
  capacity?: string;
  assignedTo?: string;
  fuelPct?: number;
  lastPing?: string;
  location: GeoPoint;
  region_id?: string;
  status: ResourceStatus;
  assigned_disaster_id?: string;
  condition?: string;
  estimated_cost?: number;
  custodian?: string;
  contact_phone?: string;
  updated_at?: string;
}

export interface ResourceDeployment {
  id: string;
  resource_id: string;
  disaster_id: string;
  quantity_deployed: number;
  source_location: GeoPoint;
  destination_location: GeoPoint;
  destination_shelter_id?: string;
  status: "planned" | "approved" | "in_transit" | "delivered" | "returned" | "cancelled";
  priority: SeverityLevel;
  priority_score?: number;
  estimated_travel_time_min?: number;
  actual_travel_time_min?: number;
  ai_recommended: boolean;
  deployed_at: string;
  delivered_at?: string;
  notes?: string;
}

// ── SOS Report ───────────────────────────────────────────────────────────────

export interface SOSReport {
  id: string;
  user_id?: string;
  location: GeoPoint;
  request_type: SOSRequestType;
  urgency: SeverityLevel;
  priority_score?: number;
  people_count: number;
  description?: string;
  media_urls: string[];
  status: SOSStatus;
  cluster_id?: string;
  is_duplicate: boolean;
  assigned_resource_id?: string;
  resolved_at?: string;
  resolution_notes?: string;
  response_time_min?: number;
  disaster_id?: string;
  region_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SOSCluster {
  id: string;
  centroid: GeoPoint;
  region_id: string;
  disaster_id?: string;
  report_count: number;
  dominant_request_type: SOSRequestType;
  avg_urgency_score: number;
  priority_score: number;
  radius_km: number;
  is_hotspot: boolean;
  status: "active" | "addressed" | "dissolved";
  recommended_resources: ResourceType[];
  updated_at: string;
}

// ── Road ─────────────────────────────────────────────────────────────────────

export interface Road {
  id: string;
  name: string;
  road_type: "highway" | "primary" | "secondary" | "tertiary" | "local" | "bridge";
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  region_id: string;
  status: RoadStatus;
  blockage_level: number; // 0-1
  blockage_reason?: string;
  accessibility: AccessibilityStatus;
  flood_risk?: SeverityLevel;
  connects_hospital: boolean;
  connects_shelter: boolean;
  last_status_update: string;
}

// ── Alert ────────────────────────────────────────────────────────────────────

export interface Alert {
  id: string;
  disaster_id?: string;
  type?: string;
  hazardType?: string;
  severity: SeverityLevel;
  title: string;
  message: string;
  issuedAt?: string;
  source?: string;
  target_audience?: "authority" | "citizen" | "all";
  target_region_id?: string;
  status?: "active" | "acknowledged" | "resolved" | "expired";
  auto_generated?: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  expires_at?: string;
  created_at?: string;
}

// ── Dashboard & Operations ──────────────────────────────────────────────────

export interface DashboardKPIs {
  totalAffected: number;
  totalEvacuated: number;
  activeSOSCount: number;
  criticalSOSCount: number;
  resolvedSOSCount: number;
  deployedNDRFTeams: number;
  activeSheltersCount: number;
  shelterOccupancyRate: number;
  hospitalICUCapacityRate: number;
  safeRoadCoveragePct: number;
  aiConfidenceScore: number;
}

export interface SOSRequest {
  id: string;
  requesterName: string;
  phone: string;
  location: GeoPoint;
  address: string;
  type: SOSRequestType;
  urgency: SeverityLevel;
  status: SOSStatus;
  peopleCount: number;
  specialNeeds: string[];
  description: string;
  createdAt: string;
  assignedTeam: string | null;
  estimatedReachMinutes: number | null;
}

export interface RoadSegment {
  id: string;
  name: string;
  status: RoadStatus | "open" | "blocked" | "under_water";
  severity: SeverityLevel;
  coordinates: [number, number][];
  notes?: string;
}

export interface AIInsight {
  id: string;
  title: string;
  confidencePct: number;
  impactSummary: string;
  recommendedAction: string;
  priority: SeverityLevel;
}

export interface CascadeGraphNode {
  id: string;
  label: string;
  type: string;
  status: string;
  impactScore: number;
}

export interface CascadeGraphEdge {
  source: string;
  target: string;
  probabilityPct: number;
  lagHours: number;
}

export interface CascadeGraph {
  nodes: CascadeGraphNode[];
  edges: CascadeGraphEdge[];
}

// ── Simulation ───────────────────────────────────────────────────────────────

export interface SimulationParams {
  rainfall_pct_change: number; // percentage change from baseline
  wind_speed_pct_change: number;
  roads_closed_count: number;
  shelter_capacity_pct_change: number;
  temperature_pct_change: number;
}

export interface SimulationResult {
  metric_name: string;
  baseline_value: number;
  simulated_value: number;
  change_pct: number;
  unit: string;
}

export interface Simulation {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  disaster_id?: string;
  base_hazard_type: HazardType;
  status: "draft" | "running" | "completed" | "failed";
  params: SimulationParams;
  results: SimulationResult[];
  llm_interpretation?: string;
  execution_time_ms?: number;
  created_at: string;
  completed_at?: string;
}

// ── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: "alert" | "sos_update" | "resource" | "system" | "weather" | "risk_change";
  channel: "in_app" | "push" | "sms" | "email";
  title: string;
  message: string;
  severity?: SeverityLevel;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  sent_at: string;
}

// ── KPI ──────────────────────────────────────────────────────────────────────

export interface KPIData {
  overall_risk_level: SeverityLevel;
  overall_risk_score: number;
  affected_population: number;
  active_sos_count: number;
  critical_sos_count: number;
  shelter_utilization_pct: number;
  shelters_near_capacity: number;
  total_shelters: number;
  roads_blocked: number;
  total_roads: number;
  hospitals_at_risk: number;
  resources_deployed: number;
  total_resources: number;
  active_disasters: number;
}

// ── AI Recommendation ────────────────────────────────────────────────────────

export interface AIRecommendation {
  id: string;
  priority: SeverityLevel;
  title: string;
  description: string;
  action_type: "deploy" | "evacuate" | "alert" | "monitor" | "simulate";
  confidence: number;
  affected_area?: string;
  resource_requirements?: string;
  status: "pending" | "accepted" | "rejected" | "modified";
  created_at: string;
}

// ── Evacuation Route ─────────────────────────────────────────────────────────

export interface EvacuationRoute {
  route_geojson: GeoFeature;
  distance_meters: number;
  estimated_time_minutes: number;
  risk_index: number; // 0-1
  elevation_profile: number[];
  hazard_crossings: number;
  turn_by_turn_instructions: Array<{
    step: number;
    instruction: string;
    distance_m: number;
  }>;
  alternatives: Array<{
    label: string;
    time_min: number;
    risk_index: number;
  }>;
}

// ── API Response Wrappers ────────────────────────────────────────────────────

export interface APISuccess<T> {
  status: "success";
  data: T;
  meta: {
    timestamp: string;
    request_id: string;
    processing_time_ms?: number;
  };
}

export interface APIError {
  status: "error";
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; issue: string }>;
  };
  meta: {
    timestamp: string;
    request_id: string;
  };
}

export interface PaginatedResponse<T> {
  status: "success";
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total_records: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  meta: {
    timestamp: string;
    request_id: string;
  };
}

// ── WebSocket Events ─────────────────────────────────────────────────────────

export type WSEvent =
  | { event: "disaster:update"; payload: Disaster }
  | { event: "risk:update"; payload: { region_id: string; hazard_type: HazardType; risk_score: number; risk_level: SeverityLevel } }
  | { event: "risk:heatmap:updated"; payload: { hazard_type: HazardType; peak_risk_score: number; tile_url: string } }
  | { event: "sos:new"; payload: SOSReport }
  | { event: "sos:cluster_update"; payload: SOSCluster }
  | { event: "alert:new"; payload: Alert }
  | { event: "resource:deployed"; payload: ResourceDeployment }
  | { event: "shelter:status_change"; payload: Pick<Shelter, "id" | "status" | "current_occupancy" | "capacity"> }
  | { event: "road:status_change"; payload: Pick<Road, "id" | "status" | "blockage_level"> }
  | { event: "weather:update"; payload: Record<string, unknown> }
  | { event: "fleet:location"; payload: { vehicle_id: string; coordinates: [number, number]; speed_kmh: number; status: string } };

// ── Map Layer State ──────────────────────────────────────────────────────────

export interface MapLayerState {
  "flood-risk": boolean;
  "cyclone-track": boolean;
  "heatwave-zones": boolean;
  "landslide-risk": boolean;
  "earthquake-zones": boolean;
  shelters: boolean;
  hospitals: boolean;
  roads: boolean;
  "sos-clusters": boolean;
  resources: boolean;
  "population-density": boolean;
  "predicted-impact": boolean;
  weather: boolean;
  "disaster-polygons": boolean;
}
