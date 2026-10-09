import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
CREATE TYPE hazard_type_enum AS ENUM (
    'flood', 'cyclone', 'heatwave', 'landslide', 'earthquake',
    'tsunami', 'drought', 'wildfire'
);

CREATE TYPE severity_enum AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE disaster_status_enum AS ENUM ('monitoring', 'active', 'resolving', 'resolved', 'archived');

CREATE TYPE region_type_enum AS ENUM ('country', 'state', 'district', 'city', 'ward', 'zone', 'custom');

CREATE TYPE alert_type_enum AS ENUM (
    'hazard_warning', 'risk_escalation', 'evacuation_order',
    'resource_shortage', 'shelter_overflow', 'road_closure',
    'hospital_isolation', 'sos_hotspot', 'system'
);

CREATE TYPE alert_audience_enum AS ENUM ('authority', 'citizen', 'all');

CREATE TYPE alert_status_enum AS ENUM ('active', 'acknowledged', 'resolved', 'expired');

CREATE TYPE shelter_type_enum AS ENUM (
    'community_hall', 'school', 'stadium', 'government_building',
    'religious_place', 'temporary_camp', 'other'
);

CREATE TYPE shelter_status_enum AS ENUM ('open', 'closed', 'full', 'damaged', 'preparing');

CREATE TYPE hospital_type_enum AS ENUM ('government', 'private', 'phc', 'chc', 'district', 'medical_college');

CREATE TYPE accessibility_enum AS ENUM ('accessible', 'limited', 'inaccessible');

CREATE TYPE resource_type_enum AS ENUM (
    'rescue_boat', 'rescue_team', 'ambulance', 'helicopter',
    'food_packet', 'water_tanker', 'medicine_kit', 'tent',
    'blanket', 'generator', 'fuel', 'communication_kit',
    'medical_team', 'police_force', 'fire_engine', 'other'
);

CREATE TYPE resource_status_enum AS ENUM ('available', 'deployed', 'in_transit', 'maintenance', 'depleted');

CREATE TYPE deployment_status_enum AS ENUM ('planned', 'approved', 'in_transit', 'delivered', 'returned', 'cancelled');

CREATE TYPE sos_type_enum AS ENUM ('rescue', 'food', 'water', 'medicine', 'shelter', 'medical_emergency', 'other');

CREATE TYPE sos_status_enum AS ENUM ('received', 'verified', 'assigned', 'in_progress', 'resolved', 'rejected', 'duplicate');

CREATE TYPE report_type_enum AS ENUM (
    'flooding', 'road_damage', 'building_collapse', 'fire',
    'power_outage', 'water_supply_disruption', 'landslide',
    'tree_fall', 'stranded_people', 'other'
);

CREATE TYPE verification_enum AS ENUM ('unverified', 'verified', 'disputed', 'false_report');

CREATE TYPE road_type_enum AS ENUM ('highway', 'primary', 'secondary', 'tertiary', 'local', 'bridge');

CREATE TYPE road_status_enum AS ENUM ('open', 'partially_blocked', 'blocked', 'destroyed', 'under_water');

CREATE TYPE notification_type_enum AS ENUM ('alert', 'sos_update', 'resource', 'system', 'weather', 'risk_change');

CREATE TYPE prediction_type_enum AS ENUM (
    'flood_extent', 'rainfall_forecast', 'wind_forecast',
    'temperature_forecast', 'river_level', 'risk_score',
    'impact_score', 'demand_forecast'
);
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
DROP TYPE IF EXISTS prediction_type_enum;
DROP TYPE IF EXISTS notification_type_enum;
DROP TYPE IF EXISTS road_status_enum;
DROP TYPE IF EXISTS road_type_enum;
DROP TYPE IF EXISTS verification_enum;
DROP TYPE IF EXISTS report_type_enum;
DROP TYPE IF EXISTS sos_status_enum;
DROP TYPE IF EXISTS sos_type_enum;
DROP TYPE IF EXISTS deployment_status_enum;
DROP TYPE IF EXISTS resource_status_enum;
DROP TYPE IF EXISTS resource_type_enum;
DROP TYPE IF EXISTS accessibility_enum;
DROP TYPE IF EXISTS hospital_type_enum;
DROP TYPE IF EXISTS shelter_status_enum;
DROP TYPE IF EXISTS shelter_type_enum;
DROP TYPE IF EXISTS alert_status_enum;
DROP TYPE IF EXISTS alert_audience_enum;
DROP TYPE IF EXISTS alert_type_enum;
DROP TYPE IF EXISTS region_type_enum;
DROP TYPE IF EXISTS disaster_status_enum;
DROP TYPE IF EXISTS severity_enum;
DROP TYPE IF EXISTS hazard_type_enum;
`);
}
