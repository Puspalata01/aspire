import type { ColumnType, GeneratedAlways, Insertable, Selectable, Updateable } from "kysely";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type Ts = string | Date;

type Timestamp = ColumnType<Ts, Ts | undefined, Ts>;
type NullableTimestamp = ColumnType<Ts | null, Ts | null | undefined, Ts | null>;
type Num = number;
type NullableNum = ColumnType<number | null, number | null | undefined, number | null>;
type NumDef = ColumnType<number, number | undefined, number>;
type Numeric = ColumnType<string, string | number, string | number>;
type NullableNumeric = ColumnType<
  string | null,
  string | number | null | undefined,
  string | number | null
>;
type NumericDef = ColumnType<string, string | number | undefined, string | number>;
type BoolDef = ColumnType<boolean, boolean | undefined, boolean>;
type WithDefault<T> = ColumnType<T, T | undefined, T>;
type Nullable<T> = ColumnType<T | null, T | null | undefined, T | null>;
type Geometry = ColumnType<unknown, string, string>;
type NullableGeometry = ColumnType<unknown | null, string | null | undefined, string | null>;
type Json = ColumnType<JsonValue, JsonValue | undefined, JsonValue>;
type NullableJson = ColumnType<
  JsonValue | null,
  JsonValue | null | undefined,
  JsonValue | null
>;

export type HazardType =
  | "flood"
  | "cyclone"
  | "heatwave"
  | "landslide"
  | "earthquake"
  | "tsunami"
  | "drought"
  | "wildfire";
export type Severity = "low" | "medium" | "high" | "critical";
export type DisasterStatus = "monitoring" | "active" | "resolving" | "resolved" | "archived";
export type RegionType = "country" | "state" | "district" | "city" | "ward" | "zone" | "custom";
export type AlertType =
  | "hazard_warning"
  | "risk_escalation"
  | "evacuation_order"
  | "resource_shortage"
  | "shelter_overflow"
  | "road_closure"
  | "hospital_isolation"
  | "sos_hotspot"
  | "system";
export type AlertAudience = "authority" | "citizen" | "all";
export type AlertStatus = "active" | "acknowledged" | "resolved" | "expired";
export type ShelterType =
  | "community_hall"
  | "school"
  | "stadium"
  | "government_building"
  | "religious_place"
  | "temporary_camp"
  | "other";
export type ShelterStatus = "open" | "closed" | "full" | "damaged" | "preparing";
export type HospitalType =
  | "government"
  | "private"
  | "phc"
  | "chc"
  | "district"
  | "medical_college";
export type Accessibility = "accessible" | "limited" | "inaccessible";
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
export type ResourceStatus = "available" | "deployed" | "in_transit" | "maintenance" | "depleted";
export type DeploymentStatus =
  | "planned"
  | "approved"
  | "in_transit"
  | "delivered"
  | "returned"
  | "cancelled";
export type SosType =
  | "rescue"
  | "food"
  | "water"
  | "medicine"
  | "shelter"
  | "medical_emergency"
  | "other";
export type SosStatus =
  | "received"
  | "verified"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "rejected"
  | "duplicate";
export type ReportType =
  | "flooding"
  | "road_damage"
  | "building_collapse"
  | "fire"
  | "power_outage"
  | "water_supply_disruption"
  | "landslide"
  | "tree_fall"
  | "stranded_people"
  | "other";
export type Verification = "unverified" | "verified" | "disputed" | "false_report";
export type RoadType = "highway" | "primary" | "secondary" | "tertiary" | "local" | "bridge";
export type RoadStatus =
  | "open"
  | "partially_blocked"
  | "blocked"
  | "destroyed"
  | "under_water";
export type NotificationType =
  | "alert"
  | "sos_update"
  | "resource"
  | "system"
  | "weather"
  | "risk_change";
export type PredictionType =
  | "flood_extent"
  | "rainfall_forecast"
  | "wind_forecast"
  | "temperature_forecast"
  | "river_level"
  | "risk_score"
  | "impact_score"
  | "demand_forecast";

export interface RolesTable {
  id: ColumnType<string, string | undefined, string>;
  name: string;
  display_name: string;
  permissions: Json;
  description: Nullable<string>;
  created_at: Timestamp;
}

export interface RegionsTable {
  id: ColumnType<string, string | undefined, string>;
  name: string;
  type: RegionType;
  code: Nullable<string>;
  parent_id: Nullable<string>;
  geometry: Geometry;
  centroid: GeneratedAlways<unknown>;
  area_sq_km: NullableNumeric;
  population: NullableNum;
  population_density: NullableNumeric;
  elevation_avg_m: NullableNumeric;
  metadata: Json;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface UsersTable {
  id: ColumnType<string, string | undefined, string>;
  email: string;
  phone: Nullable<string>;
  password_hash: string;
  full_name: string;
  role_id: string;
  region_id: Nullable<string>;
  avatar_url: Nullable<string>;
  is_active: BoolDef;
  is_verified: BoolDef;
  last_login_at: NullableTimestamp;
  last_known_location: NullableGeometry;
  notification_preferences: Json;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface AuditLogsTable {
  id: ColumnType<string, string | undefined, string>;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: Nullable<string>;
  old_values: NullableJson;
  new_values: NullableJson;
  ip_address: Nullable<string>;
  user_agent: Nullable<string>;
  created_at: Timestamp;
}

export interface DisastersTable {
  id: ColumnType<string, string | undefined, string>;
  name: string;
  type: HazardType;
  severity: WithDefault<Severity>;
  status: WithDefault<DisasterStatus>;
  region_id: Nullable<string>;
  geometry: NullableGeometry;
  center_point: NullableGeometry;
  start_time: Ts;
  end_time: NullableTimestamp;
  peak_severity: Nullable<Severity>;
  peak_time: NullableTimestamp;
  description: Nullable<string>;
  source: Nullable<string>;
  estimated_affected_population: NullableNum;
  estimated_damage_score: NullableNumeric;
  metadata: Json;
  created_by: Nullable<string>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface HazardsTable {
  id: ColumnType<string, string | undefined, string>;
  disaster_id: Nullable<string>;
  type: HazardType;
  severity: Severity;
  score: Numeric;
  location: Geometry;
  affected_area: NullableGeometry;
  radius_km: NullableNumeric;
  parameters: Json;
  data_source: string;
  observed_at: Ts;
  valid_until: NullableTimestamp;
  confidence: NullableNumeric;
  created_at: Timestamp;
}

export interface AlertsTable {
  id: ColumnType<string, string | undefined, string>;
  disaster_id: Nullable<string>;
  type: AlertType;
  severity: Severity;
  title: string;
  message: string;
  target_audience: WithDefault<AlertAudience>;
  target_region_id: Nullable<string>;
  target_area: NullableGeometry;
  status: WithDefault<AlertStatus>;
  auto_generated: BoolDef;
  acknowledged_by: Nullable<string>;
  acknowledged_at: NullableTimestamp;
  expires_at: NullableTimestamp;
  metadata: Json;
  created_at: Timestamp;
}

export interface WeatherDataTable {
  id: ColumnType<string, string | undefined, string>;
  location: Geometry;
  region_id: Nullable<string>;
  temperature_c: NullableNumeric;
  feels_like_c: NullableNumeric;
  humidity_pct: NullableNumeric;
  pressure_hpa: NullableNumeric;
  wind_speed_kmh: NullableNumeric;
  wind_direction_deg: NullableNumeric;
  rainfall_mm: NullableNumeric;
  rainfall_rate_mm_hr: NullableNumeric;
  visibility_km: NullableNumeric;
  cloud_cover_pct: NullableNumeric;
  uv_index: NullableNumeric;
  weather_condition: Nullable<string>;
  data_source: string;
  observed_at: Ts;
  forecast_for: NullableTimestamp;
  created_at: Timestamp;
}

export interface RiskAssessmentsTable {
  id: ColumnType<string, string | undefined, string>;
  region_id: string;
  hazard_type: HazardType;
  risk_level: Severity;
  risk_score: Numeric;
  confidence: Numeric;
  contributing_factors: Json;
  model_version: string;
  model_name: string;
  explanation: Nullable<string>;
  recommended_actions: Json;
  previous_score: NullableNumeric;
  score_trend: Nullable<string>;
  valid_from: Ts;
  valid_until: Ts;
  disaster_id: Nullable<string>;
  created_at: Timestamp;
}

export interface PredictionsTable {
  id: ColumnType<string, string | undefined, string>;
  disaster_id: Nullable<string>;
  region_id: string;
  hazard_type: HazardType;
  prediction_type: PredictionType;
  predicted_value: NullableNumeric;
  predicted_category: Nullable<string>;
  predicted_geometry: NullableGeometry;
  confidence: Numeric;
  forecast_horizon_hours: Num;
  forecast_time: Ts;
  model_name: string;
  model_version: string;
  input_features: Json;
  created_at: Timestamp;
}

export interface ImpactEstimatesTable {
  id: ColumnType<string, string | undefined, string>;
  disaster_id: Nullable<string>;
  region_id: string;
  population_affected: NullableNum;
  buildings_at_risk: NullableNum;
  roads_at_risk: NullableNum;
  hospitals_at_risk: NullableNum;
  shelters_at_pressure: NullableNum;
  estimated_rescue_demand: NullableNum;
  estimated_medical_demand: NullableNum;
  estimated_food_demand_kg: NullableNumeric;
  estimated_water_demand_l: NullableNumeric;
  economic_damage_estimate: NullableNumeric;
  impact_severity: Severity;
  impact_score: Numeric;
  confidence: Numeric;
  model_name: string;
  details: Json;
  created_at: Timestamp;
}

export interface CascadeAnalysesTable {
  id: ColumnType<string, string | undefined, string>;
  disaster_id: Nullable<string>;
  region_id: string;
  primary_hazard: HazardType;
  cascade_chain: JsonValue;
  total_cascade_steps: Num;
  max_risk_amplification: NullableNumeric;
  overall_cascade_score: Numeric;
  confidence: Numeric;
  model_name: string;
  created_at: Timestamp;
}

export interface SheltersTable {
  id: ColumnType<string, string | undefined, string>;
  name: string;
  type: ShelterType;
  location: Geometry;
  address: Nullable<string>;
  region_id: Nullable<string>;
  capacity: Num;
  current_occupancy: NumDef;
  status: WithDefault<ShelterStatus>;
  accessibility: WithDefault<Accessibility>;
  amenities: Json;
  contact_phone: Nullable<string>;
  contact_person: Nullable<string>;
  flood_risk: Nullable<Severity>;
  nearest_hospital_km: NullableNumeric;
  last_inspection_at: NullableTimestamp;
  metadata: Json;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface HospitalsTable {
  id: ColumnType<string, string | undefined, string>;
  name: string;
  type: HospitalType;
  location: Geometry;
  address: Nullable<string>;
  region_id: Nullable<string>;
  bed_capacity: Num;
  icu_capacity: NumDef;
  current_occupancy: NumDef;
  emergency_status: WithDefault<string>;
  accessibility: WithDefault<Accessibility>;
  isolation_risk: Nullable<Severity>;
  has_emergency_dept: BoolDef;
  has_ambulance: BoolDef;
  specialties: Json;
  contact_phone: Nullable<string>;
  metadata: Json;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ResourcesTable {
  id: ColumnType<string, string | undefined, string>;
  type: ResourceType;
  name: string;
  quantity: Num;
  unit: string;
  location: Geometry;
  region_id: Nullable<string>;
  status: WithDefault<ResourceStatus>;
  assigned_disaster_id: Nullable<string>;
  condition: WithDefault<string>;
  estimated_cost: NullableNumeric;
  expiry_date: Nullable<string>;
  custodian: Nullable<string>;
  contact_phone: Nullable<string>;
  metadata: Json;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ResourceDeploymentsTable {
  id: ColumnType<string, string | undefined, string>;
  resource_id: string;
  disaster_id: Nullable<string>;
  quantity_deployed: Num;
  source_location: Geometry;
  destination_location: Geometry;
  destination_shelter_id: Nullable<string>;
  destination_region_id: Nullable<string>;
  status: WithDefault<DeploymentStatus>;
  priority: Severity;
  priority_score: NullableNumeric;
  estimated_travel_time_min: NullableNum;
  actual_travel_time_min: NullableNum;
  deployed_by: Nullable<string>;
  ai_recommended: BoolDef;
  deployed_at: Timestamp;
  delivered_at: NullableTimestamp;
  notes: Nullable<string>;
  created_at: Timestamp;
}

export interface RoadsTable {
  id: ColumnType<string, string | undefined, string>;
  name: string;
  road_type: RoadType;
  geometry: Geometry;
  region_id: Nullable<string>;
  status: WithDefault<RoadStatus>;
  blockage_level: NumericDef;
  blockage_reason: Nullable<string>;
  accessibility: WithDefault<Accessibility>;
  flood_risk: Nullable<Severity>;
  length_km: NullableNumeric;
  speed_limit_kmh: NullableNum;
  current_speed_kmh: NullableNum;
  connects_hospital: BoolDef;
  connects_shelter: BoolDef;
  last_status_update: Timestamp;
  metadata: Json;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface SosClustersTable {
  id: ColumnType<string, string | undefined, string>;
  centroid: Geometry;
  convex_hull: NullableGeometry;
  region_id: Nullable<string>;
  disaster_id: Nullable<string>;
  report_count: Num;
  dominant_request_type: SosType;
  avg_urgency_score: Numeric;
  priority_score: Numeric;
  radius_km: Numeric;
  is_hotspot: BoolDef;
  status: WithDefault<string>;
  recommended_resources: Json;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface SosReportsTable {
  id: ColumnType<string, string | undefined, string>;
  user_id: Nullable<string>;
  location: Geometry;
  request_type: SosType;
  urgency: Severity;
  priority_score: NullableNumeric;
  people_count: NullableNum;
  description: Nullable<string>;
  media_urls: Json;
  status: WithDefault<SosStatus>;
  cluster_id: Nullable<string>;
  is_duplicate: BoolDef;
  duplicate_of: Nullable<string>;
  assigned_resource_id: Nullable<string>;
  assigned_by: Nullable<string>;
  resolved_by: Nullable<string>;
  resolved_at: NullableTimestamp;
  resolution_notes: Nullable<string>;
  response_time_min: NullableNum;
  disaster_id: Nullable<string>;
  region_id: Nullable<string>;
  metadata: Json;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CitizenReportsTable {
  id: ColumnType<string, string | undefined, string>;
  user_id: Nullable<string>;
  location: Geometry;
  report_type: ReportType;
  severity: Severity;
  description: string;
  media_urls: Json;
  verification_status: WithDefault<Verification>;
  verified_by: Nullable<string>;
  verified_at: NullableTimestamp;
  is_duplicate: BoolDef;
  upvote_count: NullableNum;
  disaster_id: Nullable<string>;
  region_id: Nullable<string>;
  metadata: Json;
  created_at: Timestamp;
}

export interface SimulationsTable {
  id: ColumnType<string, string | undefined, string>;
  name: string;
  description: Nullable<string>;
  created_by: Nullable<string>;
  region_id: Nullable<string>;
  disaster_id: Nullable<string>;
  base_hazard_type: HazardType;
  status: WithDefault<string>;
  execution_time_ms: NullableNum;
  created_at: Timestamp;
  completed_at: NullableTimestamp;
}

export interface SimulationParamsTable {
  id: ColumnType<string, string | undefined, string>;
  simulation_id: string;
  param_name: string;
  param_value: Numeric;
  baseline_value: Numeric;
  change_pct: NullableNumeric;
  unit: string;
}

export interface SimulationResultsTable {
  id: ColumnType<string, string | undefined, string>;
  simulation_id: string;
  metric_name: string;
  baseline_value: Numeric;
  simulated_value: Numeric;
  change_pct: NullableNumeric;
  unit: string;
}

export interface NotificationsTable {
  id: ColumnType<string, string | undefined, string>;
  user_id: string;
  type: NotificationType;
  channel: string;
  title: string;
  message: string;
  severity: Nullable<Severity>;
  is_read: BoolDef;
  read_at: NullableTimestamp;
  action_url: Nullable<string>;
  metadata: Json;
  sent_at: Timestamp;
  created_at: Timestamp;
}

export interface DataSourcesTable {
  id: ColumnType<string, string | undefined, string>;
  name: string;
  type: string;
  url: Nullable<string>;
  is_active: BoolDef;
  last_fetch_at: NullableTimestamp;
  fetch_interval_sec: NullableNum;
  health_status: WithDefault<string>;
  config: Json;
  created_at: Timestamp;
}

export interface ApiKeysTable {
  id: ColumnType<string, string | undefined, string>;
  name: string;
  user_id: Nullable<string>;
  key_prefix: string;
  key_hash: string;
  scopes: Json;
  is_active: BoolDef;
  last_used_at: NullableTimestamp;
  expires_at: NullableTimestamp;
  revoked_at: NullableTimestamp;
  created_at: Timestamp;
}

export interface Database {
  roles: RolesTable;
  regions: RegionsTable;
  users: UsersTable;
  audit_logs: AuditLogsTable;
  disasters: DisastersTable;
  hazards: HazardsTable;
  alerts: AlertsTable;
  weather_data: WeatherDataTable;
  risk_assessments: RiskAssessmentsTable;
  predictions: PredictionsTable;
  impact_estimates: ImpactEstimatesTable;
  cascade_analyses: CascadeAnalysesTable;
  shelters: SheltersTable;
  hospitals: HospitalsTable;
  resources: ResourcesTable;
  resource_deployments: ResourceDeploymentsTable;
  roads: RoadsTable;
  sos_clusters: SosClustersTable;
  sos_reports: SosReportsTable;
  citizen_reports: CitizenReportsTable;
  simulations: SimulationsTable;
  simulation_params: SimulationParamsTable;
  simulation_results: SimulationResultsTable;
  notifications: NotificationsTable;
  data_sources: DataSourcesTable;
  api_keys: ApiKeysTable;
}

export type Row<T extends keyof Database> = Selectable<Database[T]>;
export type NewRow<T extends keyof Database> = Insertable<Database[T]>;
export type RowUpdate<T extends keyof Database> = Updateable<Database[T]>;

export const TABLE_NAMES = [
  "roles",
  "regions",
  "users",
  "audit_logs",
  "disasters",
  "hazards",
  "alerts",
  "weather_data",
  "risk_assessments",
  "predictions",
  "impact_estimates",
  "cascade_analyses",
  "shelters",
  "hospitals",
  "resources",
  "resource_deployments",
  "roads",
  "sos_clusters",
  "sos_reports",
  "citizen_reports",
  "simulations",
  "simulation_params",
  "simulation_results",
  "notifications",
  "data_sources",
  "api_keys",
] as const satisfies readonly (keyof Database)[];

export const TABLES_WITH_UPDATED_AT = [
  "regions",
  "users",
  "disasters",
  "shelters",
  "hospitals",
  "resources",
  "roads",
  "sos_clusters",
  "sos_reports",
] as const;

export type TableWithUpdatedAt = (typeof TABLES_WITH_UPDATED_AT)[number];
