import type {
  DisasterRecord,
  DisasterListInput,
  ListResult as DisasterListResult,
} from "./services/disasterService";
import type { AlertRecord } from "./services/alertService";
import type { ShelterRecord } from "./services/shelterService";
import type { HospitalRecord } from "./services/hospitalService";
import type { ResourceRecord } from "./services/resourceService";
import type { SosRecord } from "./services/sosService";

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTIC ODISHA DISASTER DOMAIN SEED DATA
// ─────────────────────────────────────────────────────────────────────────────

export const INITIAL_DISASTERS: DisasterRecord[] = [
  {
    id: "dis-001-cyclone-dana",
    name: "Cyclone Dana (Very Severe Cyclonic Storm)",
    type: "cyclone",
    severity: "critical",
    status: "active",
    region_id: "reg-puri-01",
    region_name: "Puri Coastal Corridor",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [85.75, 19.75],
          [86.25, 19.85],
          [86.55, 20.35],
          [85.95, 20.45],
          [85.55, 20.05],
          [85.75, 19.75],
        ],
      ],
    },
    center_point: { lat: 19.8135, lng: 85.8312 },
    start_time: "2026-10-08T02:00:00Z",
    end_time: null,
    peak_severity: "critical",
    peak_time: "2026-10-09T18:00:00Z",
    description:
      "Category 4 equivalent cyclone packing sustained winds of 145 km/h with gusts up to 175 km/h. Landfall projected between Dhamra and Puri. Storm surge 1.8m-2.4m expected.",
    source: "IMD (India Meteorological Department)",
    estimated_affected_population: 342000,
    estimated_damage_score: 88.5,
    metadata: {
      wind_speed_kmh: 145,
      pressure_hpa: 968,
      movement_speed_kmh: 18,
      heading: "NNW",
      alert_color: "#FF4D5E",
    },
    created_by: "system_ingest",
    created_at: "2026-10-08T02:00:00Z",
    updated_at: "2026-10-09T05:30:00Z",
  },
  {
    id: "dis-002-mahanadi-flood",
    name: "Mahanadi River Basin Flash Flood",
    type: "flood",
    severity: "high",
    status: "active",
    region_id: "reg-cuttack-02",
    region_name: "Cuttack & Kendrapada Lowlands",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [85.8, 20.4],
          [86.4, 20.5],
          [86.7, 20.7],
          [86.2, 20.65],
          [85.8, 20.4],
        ],
      ],
    },
    center_point: { lat: 20.4625, lng: 85.883 },
    start_time: "2026-10-07T14:30:00Z",
    end_time: null,
    peak_severity: "high",
    peak_time: "2026-10-09T12:00:00Z",
    description:
      "Discharge from Hirakud Dam exceeding 9.5 lakh cusecs causing severe embankment breaches along Mahanadi delta tributaries.",
    source: "Central Water Commission & SRC Odisha",
    estimated_affected_population: 124500,
    estimated_damage_score: 72.0,
    metadata: {
      water_level_m: 27.8,
      danger_level_m: 26.5,
      flow_rate_cusecs: 950000,
      alert_color: "#FF9800",
    },
    created_by: "system_ingest",
    created_at: "2026-10-07T14:30:00Z",
    updated_at: "2026-10-09T05:30:00Z",
  },
  {
    id: "dis-003-western-heatwave",
    name: "Western Odisha Extreme Heatwave",
    type: "heatwave",
    severity: "medium",
    status: "monitoring",
    region_id: "reg-sambalpur-03",
    region_name: "Sambalpur & Jharsuguda Industrial Belt",
    geometry: null,
    center_point: { lat: 21.4669, lng: 83.9812 },
    start_time: "2026-10-05T08:00:00Z",
    end_time: null,
    peak_severity: "high",
    peak_time: "2026-10-08T14:00:00Z",
    description:
      "Persistent temperature inversion with daytime highs reaching 44.2°C and wet-bulb index exceeding 31°C.",
    source: "IMD Bhubaneswar",
    estimated_affected_population: 86000,
    estimated_damage_score: 41.0,
    metadata: {
      max_temp_c: 44.2,
      wet_bulb_c: 31.4,
      heat_index: "extreme_caution",
      alert_color: "#F5C542",
    },
    created_by: "system_ingest",
    created_at: "2026-10-05T08:00:00Z",
    updated_at: "2026-10-09T04:00:00Z",
  },
];

export const INITIAL_SHELTERS: ShelterRecord[] = [
  {
    id: "sh-001",
    name: "Puri Cyclone Shelter #12 (Swargadwar)",
    type: "community_hall",
    coordinates: { lat: 19.7983, lng: 85.8249 },
    address: "Near Sea Beach Police Station, Puri",
    region_id: "reg-puri-01",
    capacity: 2500,
    current_occupancy: 2180,
    available_capacity: 320,
    occupancy_rate: 87.2,
    status: "open",
    accessibility: "accessible",
    amenities: ["Solar Generator", "RO Water Unit", "Medical Bay", "Child Care"],
    contact_phone: "+91 6752 222100",
    contact_person: "Ashok Jena (Relief Officer)",
    flood_risk: "high",
    nearest_hospital_km: 2.4,
    last_inspection_at: "2026-10-09T03:00:00Z",
    metadata: { generator_fuel_hrs: 48, food_packets_remaining: 3500 },
    created_at: "2026-10-08T00:00:00Z",
    updated_at: "2026-10-09T05:00:00Z",
  },
  {
    id: "sh-002",
    name: "Cuttack Red Cross Disaster Camp",
    type: "school",
    coordinates: { lat: 20.468, lng: 85.879 },
    address: "Ravenshaw Collegiate School Campus, Cuttack",
    region_id: "reg-cuttack-02",
    capacity: 1800,
    current_occupancy: 1540,
    available_capacity: 260,
    occupancy_rate: 85.5,
    status: "open",
    accessibility: "accessible",
    amenities: ["Generator Backup", "Community Kitchen", "First Aid Station"],
    contact_phone: "+91 671 2304561",
    contact_person: "Dr. Priyabrata Ray",
    flood_risk: "critical",
    nearest_hospital_km: 1.1,
    last_inspection_at: "2026-10-09T04:15:00Z",
    metadata: { generator_fuel_hrs: 36, food_packets_remaining: 2100 },
    created_at: "2026-10-08T00:00:00Z",
    updated_at: "2026-10-09T05:00:00Z",
  },
  {
    id: "sh-003",
    name: "Bhubaneswar High School Evacuation Shelter",
    type: "school",
    coordinates: { lat: 20.2961, lng: 85.8245 },
    address: "Unit-1, Bapuji Nagar, Bhubaneswar",
    region_id: "reg-khurda-01",
    capacity: 3000,
    current_occupancy: 2050,
    available_capacity: 950,
    occupancy_rate: 68.3,
    status: "open",
    accessibility: "accessible",
    amenities: ["Full Power Backup", "Sanitation Blocks", "Dedicated Doctor"],
    contact_phone: "+91 674 2409911",
    contact_person: "Smita Mohapatra",
    flood_risk: "low",
    nearest_hospital_km: 1.8,
    last_inspection_at: "2026-10-09T02:00:00Z",
    metadata: { generator_fuel_hrs: 72, food_packets_remaining: 5000 },
    created_at: "2026-10-08T00:00:00Z",
    updated_at: "2026-10-09T05:00:00Z",
  },
  {
    id: "sh-004",
    name: "Paradip Port Multipurpose Cyclone Shelter",
    type: "government_building",
    coordinates: { lat: 20.2644, lng: 86.6713 },
    address: "Port Township, Jagatsinghpur",
    region_id: "reg-jagatsingh-01",
    capacity: 3500,
    current_occupancy: 3410,
    available_capacity: 90,
    occupancy_rate: 97.4,
    status: "full",
    accessibility: "limited",
    amenities: ["Heavy Diesel Generator", "Satellite Comms", "Dry Food Rations"],
    contact_phone: "+91 6722 222045",
    contact_person: "Capt. R. K. Nayak",
    flood_risk: "critical",
    nearest_hospital_km: 3.8,
    last_inspection_at: "2026-10-09T05:00:00Z",
    metadata: { generator_fuel_hrs: 60, food_packets_remaining: 4200 },
    created_at: "2026-10-08T00:00:00Z",
    updated_at: "2026-10-09T05:00:00Z",
  },
  {
    id: "sh-005",
    name: "Kendrapara Flood Relief Center",
    type: "community_hall",
    coordinates: { lat: 20.5015, lng: 86.4229 },
    address: "Block Development Office Grounds, Kendrapara",
    region_id: "reg-kendrapara-01",
    capacity: 2200,
    current_occupancy: 1980,
    available_capacity: 220,
    occupancy_rate: 90.0,
    status: "open",
    accessibility: "limited",
    amenities: ["Water Purification Unit", "Inflatable Tents", "Ambulance Station"],
    contact_phone: "+91 6727 232111",
    contact_person: "Bikram Keshari Das",
    flood_risk: "high",
    nearest_hospital_km: 2.0,
    last_inspection_at: "2026-10-09T03:30:00Z",
    metadata: { generator_fuel_hrs: 40, food_packets_remaining: 2800 },
    created_at: "2026-10-08T00:00:00Z",
    updated_at: "2026-10-09T05:00:00Z",
  },
];

export const INITIAL_HOSPITALS: HospitalRecord[] = [
  {
    id: "hosp-001",
    name: "AIIMS Bhubaneswar (Trauma & Disaster Wing)",
    type: "medical_college",
    coordinates: { lat: 20.2312, lng: 85.7725 },
    address: "Sijua, Patrapada, Bhubaneswar",
    region_id: "reg-khurda-01",
    bed_capacity: 1100,
    icu_capacity: 180,
    current_occupancy: 890,
    available_beds: 210,
    emergency_status: "normal",
    accessibility: "accessible",
    isolation_risk: "low",
    has_emergency_dept: true,
    has_ambulance: true,
    specialties: ["Critical Care", "Trauma Surgery", "Burns Unit", "Toxicology"],
    contact_phone: "+91 674 2476789",
    metadata: { icu_available: 34, oxygen_reserve_days: 7, trauma_teams_on_duty: 6 },
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-09T05:00:00Z",
  },
  {
    id: "hosp-002",
    name: "SCB Medical College & Hospital",
    type: "medical_college",
    coordinates: { lat: 20.4789, lng: 85.892 },
    address: "Mangalabag, Cuttack",
    region_id: "reg-cuttack-02",
    bed_capacity: 1450,
    icu_capacity: 220,
    current_occupancy: 1390,
    available_beds: 60,
    emergency_status: "critical",
    accessibility: "limited",
    isolation_risk: "high",
    has_emergency_dept: true,
    has_ambulance: true,
    specialties: ["Emergency Medicine", "General Surgery", "Infectious Disease"],
    contact_phone: "+91 671 2414080",
    metadata: { icu_available: 8, oxygen_reserve_days: 3, trauma_teams_on_duty: 8 },
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-09T05:00:00Z",
  },
  {
    id: "hosp-003",
    name: "District Headquarters Hospital Puri",
    type: "district",
    coordinates: { lat: 19.809, lng: 85.828 },
    address: "Grand Road, Puri",
    region_id: "reg-puri-01",
    bed_capacity: 450,
    icu_capacity: 45,
    current_occupancy: 425,
    available_beds: 25,
    emergency_status: "overflow",
    accessibility: "accessible",
    isolation_risk: "critical",
    has_emergency_dept: true,
    has_ambulance: true,
    specialties: ["General Medicine", "Pediatrics", "Emergency Trauma"],
    contact_phone: "+91 6752 222030",
    metadata: { icu_available: 3, oxygen_reserve_days: 2, trauma_teams_on_duty: 4 },
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-09T05:00:00Z",
  },
  {
    id: "hosp-004",
    name: "Capital Hospital Bhubaneswar",
    type: "government",
    coordinates: { lat: 20.2706, lng: 85.8285 },
    address: "Unit-6, Bhubaneswar",
    region_id: "reg-khurda-01",
    bed_capacity: 750,
    icu_capacity: 90,
    current_occupancy: 610,
    available_beds: 140,
    emergency_status: "busy",
    accessibility: "accessible",
    isolation_risk: "low",
    has_emergency_dept: true,
    has_ambulance: true,
    specialties: ["Trauma Care", "Obstetrics", "Blood Bank"],
    contact_phone: "+91 674 2391983",
    metadata: { icu_available: 16, oxygen_reserve_days: 5, trauma_teams_on_duty: 5 },
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-09T05:00:00Z",
  },
];

export const INITIAL_RESOURCES: ResourceRecord[] = [
  {
    id: "res-001",
    type: "rescue_team",
    name: "NDRF 04 Battalion — Delta Team Alpha",
    quantity: 45,
    unit: "personnel",
    coordinates: { lat: 19.82, lng: 85.84 },
    region_id: "reg-puri-01",
    status: "deployed",
    assigned_disaster_id: "dis-001-cyclone-dana",
    condition: "excellent",
    estimated_cost: null,
    expiry_date: null,
    custodian: "Commandant Sharma",
    contact_phone: "+91 94370 11223",
    metadata: {
      capabilities: ["Swift Water Rescue", "Collapse Structure Search", "Medical First Response"],
      assigned_sector: "Puri Beachfront & Swargadwar",
      fuel_level_pct: 92,
      battery_level_pct: 88,
      boats_attached: 6,
      drones_deployed: 2,
    },
    created_at: "2026-10-08T04:00:00Z",
    updated_at: "2026-10-09T05:30:00Z",
  },
  {
    id: "res-002",
    type: "rescue_team",
    name: "ODRAF Unit 02 — Cuttack Rapid Response",
    quantity: 35,
    unit: "personnel",
    coordinates: { lat: 20.46, lng: 85.87 },
    region_id: "reg-cuttack-02",
    status: "deployed",
    assigned_disaster_id: "dis-002-mahanadi-flood",
    condition: "good",
    estimated_cost: null,
    expiry_date: null,
    custodian: "Insp. Barik",
    contact_phone: "+91 94371 99884",
    metadata: {
      capabilities: ["Flood Evacuation", "Tree Cutting", "Power Saw Clearance"],
      assigned_sector: "Mahanadi Embankment Zone 3",
      fuel_level_pct: 78,
      battery_level_pct: 82,
      boats_attached: 4,
      chainsaw_count: 12,
    },
    created_at: "2026-10-08T04:00:00Z",
    updated_at: "2026-10-09T05:30:00Z",
  },
  {
    id: "res-003",
    type: "rescue_boat",
    name: "Inflatable Zodiac Disaster Boats (Flotilla 1)",
    quantity: 12,
    unit: "vessels",
    coordinates: { lat: 20.48, lng: 85.91 },
    region_id: "reg-cuttack-02",
    status: "deployed",
    assigned_disaster_id: "dis-002-mahanadi-flood",
    condition: "operational",
    estimated_cost: null,
    expiry_date: null,
    custodian: "Marine Police Cuttack",
    contact_phone: "+91 671 2304561",
    metadata: {
      capabilities: ["Shallow Water Navigation", "High Payload Transport"],
      assigned_sector: "Kathajodi Sub-basin",
      fuel_level_pct: 85,
      battery_level_pct: null,
      outboard_motors_hp: 40,
    },
    created_at: "2026-10-08T06:00:00Z",
    updated_at: "2026-10-09T05:00:00Z",
  },
  {
    id: "res-004",
    type: "ambulance",
    name: "108 Advanced Life Support (ALS) Fleet 07",
    quantity: 18,
    unit: "vehicles",
    coordinates: { lat: 20.28, lng: 85.83 },
    region_id: "reg-khurda-01",
    status: "deployed",
    assigned_disaster_id: "dis-001-cyclone-dana",
    condition: "excellent",
    estimated_cost: null,
    expiry_date: null,
    custodian: "State Dispatch",
    contact_phone: "108",
    metadata: {
      capabilities: ["Mobile ICU", "Ventilator Support", "Defibrillator"],
      assigned_sector: "NH-16 Bhubaneswar-Puri Corridor",
      fuel_level_pct: 94,
      battery_level_pct: 100,
      active_trips: 14,
      standby: 4,
    },
    created_at: "2026-10-08T08:00:00Z",
    updated_at: "2026-10-09T05:15:00Z",
  },
  {
    id: "res-005",
    type: "water_tanker",
    name: "Mobile Potable Water Purification & Bowser Fleet",
    quantity: 24,
    unit: "bowsers",
    coordinates: { lat: 19.83, lng: 85.85 },
    region_id: "reg-puri-01",
    status: "available",
    assigned_disaster_id: "dis-001-cyclone-dana",
    condition: "good",
    estimated_cost: null,
    expiry_date: null,
    custodian: "PHED Control",
    contact_phone: "+91 674 2390111",
    metadata: {
      capabilities: ["5000L Delivery", "Reverse Osmosis In-line"],
      assigned_sector: "Puri Coastal Relief Centers",
      fuel_level_pct: 88,
      battery_level_pct: null,
      total_water_delivered_liters: 120000,
    },
    created_at: "2026-10-08T10:00:00Z",
    updated_at: "2026-10-09T05:00:00Z",
  },
];

export const INITIAL_SOS: SosRecord[] = [
  {
    id: "sos-001",
    user_id: "usr-citizen-491",
    location: { lat: 19.8042, lng: 85.8211 },
    request_type: "rescue",
    urgency: "critical",
    priority_score: 96,
    people_count: 5,
    description: "Storm surge entered ground floor up to 5 feet. 2 elderly residents stuck on roof terrace with no food or drinking water.",
    media_urls: [],
    status: "in_progress",
    cluster_id: "clust-puri-01",
    assigned_resource_id: "res-001",
    disaster_id: "dis-001-cyclone-dana",
    region_id: "reg-puri-01",
    is_duplicate: false,
    duplicate_of: null,
    assigned_by: "usr-commander-01",
    resolved_by: null,
    resolved_at: null,
    resolution_notes: "NDRF Delta Boat Alpha dispatched from Swargadwar staging point. ETA 8 mins.",
    response_time_min: 12,
    created_at: "2026-10-09T04:45:00Z",
    updated_at: "2026-10-09T05:10:00Z",
  },
  {
    id: "sos-002",
    user_id: "usr-citizen-812",
    location: { lat: 20.4552, lng: 85.8643 },
    request_type: "medical_emergency",
    urgency: "critical",
    priority_score: 94,
    people_count: 2,
    description: "Pregnant woman experiencing severe labor complications. Local road flooded with 3ft flowing water.",
    media_urls: [],
    status: "assigned",
    cluster_id: "clust-cuttack-02",
    assigned_resource_id: "res-004",
    disaster_id: "dis-002-mahanadi-flood",
    region_id: "reg-cuttack-02",
    is_duplicate: false,
    duplicate_of: null,
    assigned_by: "usr-commander-01",
    resolved_by: null,
    resolved_at: null,
    resolution_notes: "Ambulance ALS Fleet 07 en-route with ODRAF boat escort.",
    response_time_min: 15,
    created_at: "2026-10-09T04:55:00Z",
    updated_at: "2026-10-09T05:15:00Z",
  },
  {
    id: "sos-003",
    user_id: "usr-citizen-209",
    location: { lat: 20.512, lng: 86.435 },
    request_type: "food",
    urgency: "high",
    priority_score: 82,
    people_count: 14,
    description: "Isolated village pocket in Kendrapara completely cut off by river overflow. Baby food and potable water exhausted.",
    media_urls: [],
    status: "verified",
    cluster_id: "clust-kendrapara-01",
    assigned_resource_id: null,
    disaster_id: "dis-002-mahanadi-flood",
    region_id: "reg-kendrapara-01",
    is_duplicate: false,
    duplicate_of: null,
    assigned_by: null,
    resolved_by: null,
    resolved_at: null,
    resolution_notes: null,
    response_time_min: null,
    created_at: "2026-10-09T05:05:00Z",
    updated_at: "2026-10-09T05:20:00Z",
  },
  {
    id: "sos-004",
    user_id: "usr-citizen-650",
    location: { lat: 19.821, lng: 85.845 },
    request_type: "shelter",
    urgency: "medium",
    priority_score: 74,
    people_count: 8,
    description: "Tin roof blown away by cyclonic wind gust. Need immediate transfer to nearest cyclone shelter.",
    media_urls: [],
    status: "received",
    cluster_id: null,
    assigned_resource_id: null,
    disaster_id: "dis-001-cyclone-dana",
    region_id: "reg-puri-01",
    is_duplicate: false,
    duplicate_of: null,
    assigned_by: null,
    resolved_by: null,
    resolved_at: null,
    resolution_notes: null,
    response_time_min: null,
    created_at: "2026-10-09T05:22:00Z",
    updated_at: "2026-10-09T05:22:00Z",
  },
];

export const INITIAL_ALERTS: AlertRecord[] = [
  {
    id: "alt-001",
    disaster_id: "dis-001-cyclone-dana",
    disaster_name: "Cyclone Dana",
    type: "hazard_warning",
    severity: "critical",
    title: "RED ALERT: Cyclone Dana Landfall Warning",
    message:
      "Extremely severe cyclonic winds of 145-175 km/h and high storm surge along Puri, Jagatsinghpur, Kendrapara coast. Complete evacuation within 5km of shoreline mandated.",
    target_audience: "all",
    target_region_id: "reg-puri-01",
    target_area: null,
    status: "active",
    auto_generated: true,
    acknowledged_by: "usr-commander-01",
    acknowledged_at: "2026-10-09T03:15:00Z",
    expires_at: "2026-10-10T12:00:00Z",
    metadata: { imd_bulletin_no: 18, color: "#FF4D5E", sound_siren: true },
    created_at: "2026-10-09T03:00:00Z",
  },
  {
    id: "alt-002",
    disaster_id: "dis-002-mahanadi-flood",
    disaster_name: "Mahanadi River Basin Flash Flood",
    type: "evacuation_order",
    severity: "high",
    title: "ORANGE ALERT: Immediate Evacuation Order along Mahanadi Lowlands",
    message:
      "Hirakud Dam discharge peak at 9.5 lakh cusecs. Residents in Cuttack, Jagatsinghpur, and Kendrapara delta floodplains must evacuate to designated relief camps.",
    target_audience: "all",
    target_region_id: "reg-cuttack-02",
    target_area: null,
    status: "active",
    auto_generated: true,
    acknowledged_by: "usr-commander-01",
    acknowledged_at: "2026-10-09T04:00:00Z",
    expires_at: "2026-10-10T06:00:00Z",
    metadata: { color: "#FF9800", safe_zones: ["sh-002", "sh-005"] },
    created_at: "2026-10-09T03:30:00Z",
  },
  {
    id: "alt-003",
    disaster_id: "dis-001-cyclone-dana",
    disaster_name: "Cyclone Dana",
    type: "road_closure",
    severity: "high",
    title: "CRITICAL INFRASTRUCTURE: SH-35 Marine Drive Closed",
    message: "Marine Drive connecting Puri and Konark closed due to tidal surge inundation and uprooted trees. Use NH-316 diversion.",
    target_audience: "all",
    target_region_id: "reg-puri-01",
    target_area: null,
    status: "active",
    auto_generated: false,
    acknowledged_by: null,
    acknowledged_at: null,
    expires_at: "2026-10-10T00:00:00Z",
    metadata: { color: "#FF4D5E", alternative_route: "NH-316 via Pipli" },
    created_at: "2026-10-09T04:45:00Z",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STATE REPOSITORY & SERVICE FALLBACKS
// ─────────────────────────────────────────────────────────────────────────────

class DomainStore {
  private disasters: DisasterRecord[] = [...INITIAL_DISASTERS];
  private shelters: ShelterRecord[] = [...INITIAL_SHELTERS];
  private hospitals: HospitalRecord[] = [...INITIAL_HOSPITALS];
  private resources: ResourceRecord[] = [...INITIAL_RESOURCES];
  private sosReports: SosRecord[] = [...INITIAL_SOS];
  private alerts: AlertRecord[] = [...INITIAL_ALERTS];

  getActiveDisaster(): DisasterRecord {
    return this.disasters.find((d) => d.status === "active") || this.disasters[0];
  }

  getDisasters(): DisasterRecord[] {
    return this.disasters;
  }

  getShelters(): ShelterRecord[] {
    return this.shelters;
  }

  getHospitals(): HospitalRecord[] {
    return this.hospitals;
  }

  getResources(): ResourceRecord[] {
    return this.resources;
  }

  getSOSRequests(): SosRecord[] {
    return this.sosReports;
  }

  createSOSReport(data: Partial<SosRecord>): SosRecord {
    return this.createSos(data);
  }

  getAlerts(): AlertRecord[] {
    return this.alerts;
  }

  // DISASTERS
  listDisasters(input: DisasterListInput): DisasterListResult {
    let items = [...this.disasters];
    if (input.status) items = items.filter((d) => d.status === input.status);
    if (input.hazardType) items = items.filter((d) => d.type === input.hazardType);
    if (input.severity) items = items.filter((d) => d.severity === input.severity);
    if (input.regionId) items = items.filter((d) => d.region_id === input.regionId);

    const total = items.length;
    const start = (input.page - 1) * input.limit;
    return {
      items: items.slice(start, start + input.limit),
      total_records: total,
    };
  }

  // ALERTS
  listAlerts(input: { status?: string; severity?: string; page: number; limit: number }) {
    let items = [...this.alerts];
    if (input.status) items = items.filter((a) => a.status === input.status);
    if (input.severity) items = items.filter((a) => a.severity === input.severity);

    const total = items.length;
    const start = (input.page - 1) * input.limit;
    return {
      items: items.slice(start, start + input.limit),
      total_records: total,
    };
  }

  // SHELTERS
  listShelters(input: { status?: string; accessibility?: string; floodRisk?: string; page: number; limit: number }) {
    let items = [...this.shelters];
    if (input.status) items = items.filter((s) => s.status === input.status);
    if (input.accessibility) items = items.filter((s) => s.accessibility === input.accessibility);
    if (input.floodRisk) items = items.filter((s) => s.flood_risk === input.floodRisk);

    const total = items.length;
    const start = (input.page - 1) * input.limit;
    return {
      items: items.slice(start, start + input.limit),
      total_records: total,
    };
  }

  // HOSPITALS
  listHospitals(input: { emergencyStatus?: string; type?: string; page: number; limit: number }) {
    let items = [...this.hospitals];
    if (input.emergencyStatus) items = items.filter((h) => h.emergency_status === input.emergencyStatus);
    if (input.type) items = items.filter((h) => h.type === input.type);

    const total = items.length;
    const start = (input.page - 1) * input.limit;
    return {
      items: items.slice(start, start + input.limit),
      total_records: total,
    };
  }

  // RESOURCES
  listResources(input: { type?: string; status?: string; page: number; limit: number }) {
    let items = [...this.resources];
    if (input.type) items = items.filter((r) => r.type === input.type);
    if (input.status) items = items.filter((r) => r.status === input.status);

    const total = items.length;
    const start = (input.page - 1) * input.limit;
    return {
      items: items.slice(start, start + input.limit),
      total_records: total,
    };
  }

  // SOS
  listSos(input: { status?: string; urgency?: string; page: number; limit: number }) {
    let items = [...this.sosReports];
    if (input.status) items = items.filter((s) => s.status === input.status);
    if (input.urgency) items = items.filter((s) => s.urgency === input.urgency);

    const total = items.length;
    const start = (input.page - 1) * input.limit;
    return {
      items: items.slice(start, start + input.limit),
      total_records: total,
    };
  }

  createSos(data: Partial<SosRecord>): SosRecord {
    const newRecord: SosRecord = {
      id: `sos-${Date.now().toString(36)}`,
      user_id: data.user_id || "usr-citizen-live",
      location: data.location || { lat: 19.81, lng: 85.83 },
      request_type: data.request_type || "rescue",
      urgency: data.urgency || "critical",
      priority_score: data.priority_score || 90,
      people_count: data.people_count || 1,
      description: data.description || "Emergency SOS call received",
      media_urls: [],
      status: "received",
      cluster_id: null,
      assigned_resource_id: null,
      disaster_id: "dis-001-cyclone-dana",
      region_id: "reg-puri-01",
      is_duplicate: false,
      duplicate_of: null,
      assigned_by: null,
      resolved_by: null,
      resolved_at: null,
      resolution_notes: null,
      response_time_min: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.sosReports.unshift(newRecord);
    return newRecord;
  }

  // DASHBOARD KPIS
  getDashboardKpis() {
    const totalOccupancy = this.shelters.reduce((acc, s) => acc + s.current_occupancy, 0);
    const totalCapacity = this.shelters.reduce((acc, s) => acc + s.capacity, 0);
    const activeHazardsCount = this.disasters.filter((d) => d.status === "active" || d.status === "monitoring").length;
    const pendingSosCount = this.sosReports.filter((s) => s.status !== "resolved" && s.status !== "rejected").length;
    const deployedTeamsCount = this.resources.filter((r) => r.status === "deployed").length;
    const totalAffected = this.disasters.reduce((acc, d) => acc + (d.estimated_affected_population || 0), 0);

    return {
      active_hazards: activeHazardsCount,
      active_hazards_delta_24h: 2,
      total_affected_population: totalAffected || 48723,
      affected_population_delta_pct: -12.4,
      relief_camps_active: 86,
      relief_camps_delta_24h: 5,
      relief_camps_occupancy_rate: Math.round((totalOccupancy / (totalCapacity || 1)) * 100) || 78,
      deployed_rescue_teams: deployedTeamsCount + 138, // 142 total units
      deployed_teams_delta_24h: 14,
      pending_sos_reports: pendingSosCount,
      resolved_sos_reports: 128,
      avg_response_time_min: 14.2,
      power_grid_status_pct: 74,
      telecom_uptime_pct: 86,
      water_potability_pct: 91,
      overall_risk_index: 82.4,
      risk_level: "critical",
      last_updated: new Date().toISOString(),
    };
  }

  roads = [
    {
      id: "road-nh316",
      name: "NH-316 (Bhubaneswar - Puri Expressway)",
      status: "open",
      severity: "low",
      condition: "passable",
      road_type: "highway",
      length_km: 62.4,
      coordinates: [
        [85.82, 20.24],
        [85.83, 20.12],
        [85.83, 19.95],
        [85.83, 19.82],
      ],
      notes: "Traffic monitored; slow near Pipili bypass.",
    },
    {
      id: "road-marine-dr",
      name: "Puri - Konark Marine Drive (SH-35)",
      status: "blocked",
      severity: "critical",
      condition: "blocked",
      road_type: "primary",
      length_km: 35.8,
      coordinates: [
        [85.84, 19.8],
        [85.95, 19.85],
        [86.09, 19.89],
      ],
      notes: "3.2km road inundated by 1.2m tidal surge; fallen electrical poles.",
    },
    {
      id: "road-sh13",
      name: "SH-13 (Brahmagiri - Satapada Link)",
      status: "under_water",
      severity: "high",
      condition: "flooded",
      road_type: "secondary",
      length_km: 24.1,
      coordinates: [
        [85.7, 19.8],
        [85.6, 19.74],
        [85.45, 19.68],
      ],
      notes: "Submerged under 80cm flood water from Chilika lagoon overflow.",
    },
  ];

  getRoads() {
    return this.roads;
  }

  getAIInsights() {
    return [
      {
        id: "ins-01",
        title: "Storm Surge Landfall Corridor Risk",
        confidencePct: 96,
        impactSummary: "2.4m storm surge peak expected in Puri-Astaranga sector at 18:00 IST coincident with high astronomical tide.",
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
  }

  getCascadeGraph() {
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
  }

  // SPATIAL HAZARD LAYERS
  getHazardSpatialLayers() {
    return {
      features: [
        {
          id: "layer-surge-zone",
          name: "Storm Surge Inundation Zone (2.4m)",
          hazard: "cyclone",
          color: "#FF4D5E",
          opacity: 0.65,
          type: "Polygon",
          coordinates: [
            [
              [85.80, 19.78],
              [86.20, 19.86],
              [86.40, 20.15],
              [86.00, 20.10],
              [85.78, 19.80],
            ],
          ],
        },
        {
          id: "layer-flood-basin",
          name: "Mahanadi Flood Inundation Buffer",
          hazard: "flood",
          color: "#3B6CFF",
          opacity: 0.55,
          type: "Polygon",
          coordinates: [
            [
              [85.82, 20.42],
              [86.35, 20.48],
              [86.60, 20.65],
              [86.15, 20.60],
              [85.82, 20.42],
            ],
          ],
        },
      ],
    };
  }
}

// Global Singleton (safely recreate in dev if methods are updated)
type Globals = { __aspireDomainStore?: DomainStore };
const g = globalThis as unknown as Globals;
if (!g.__aspireDomainStore || typeof g.__aspireDomainStore.getActiveDisaster !== "function") {
  g.__aspireDomainStore = new DomainStore();
}
export const domainStore = g.__aspireDomainStore;
