import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
CREATE TABLE shelters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type shelter_type_enum NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    address TEXT,
    region_id UUID REFERENCES regions(id),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    current_occupancy INTEGER DEFAULT 0 CHECK (current_occupancy >= 0),
    status shelter_status_enum NOT NULL DEFAULT 'open',
    accessibility accessibility_enum NOT NULL DEFAULT 'accessible',
    amenities JSONB DEFAULT '[]',
    contact_phone VARCHAR(20),
    contact_person VARCHAR(255),
    flood_risk severity_enum,
    nearest_hospital_km DECIMAL(6,2),
    last_inspection_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shelters_location ON shelters USING GIST(location);
CREATE INDEX idx_shelters_region ON shelters(region_id);
CREATE INDEX idx_shelters_status ON shelters(status);
CREATE INDEX idx_shelters_available ON shelters(status, capacity, current_occupancy) WHERE status = 'open';

CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type hospital_type_enum NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    address TEXT,
    region_id UUID REFERENCES regions(id),
    bed_capacity INTEGER NOT NULL CHECK (bed_capacity > 0),
    icu_capacity INTEGER DEFAULT 0,
    current_occupancy INTEGER DEFAULT 0,
    emergency_status VARCHAR(50) DEFAULT 'normal',
    accessibility accessibility_enum NOT NULL DEFAULT 'accessible',
    isolation_risk severity_enum,
    has_emergency_dept BOOLEAN DEFAULT true,
    has_ambulance BOOLEAN DEFAULT false,
    specialties JSONB DEFAULT '[]',
    contact_phone VARCHAR(20),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hospitals_location ON hospitals USING GIST(location);
CREATE INDEX idx_hospitals_region ON hospitals(region_id);
CREATE INDEX idx_hospitals_status ON hospitals(emergency_status);

CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type resource_type_enum NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    unit VARCHAR(50) NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    region_id UUID REFERENCES regions(id),
    status resource_status_enum NOT NULL DEFAULT 'available',
    assigned_disaster_id UUID REFERENCES disasters(id),
    condition VARCHAR(50) DEFAULT 'good',
    estimated_cost DECIMAL(12,2),
    expiry_date DATE,
    custodian VARCHAR(255),
    contact_phone VARCHAR(20),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_location ON resources USING GIST(location);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_region ON resources(region_id);
CREATE INDEX idx_resources_available ON resources(type, status) WHERE status = 'available';

CREATE TABLE resource_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id),
    disaster_id UUID REFERENCES disasters(id),
    quantity_deployed INTEGER NOT NULL CHECK (quantity_deployed > 0),
    source_location GEOMETRY(Point, 4326) NOT NULL,
    destination_location GEOMETRY(Point, 4326) NOT NULL,
    destination_shelter_id UUID REFERENCES shelters(id),
    destination_region_id UUID REFERENCES regions(id),
    status deployment_status_enum NOT NULL DEFAULT 'planned',
    priority severity_enum NOT NULL,
    priority_score DECIMAL(5,4),
    estimated_travel_time_min INTEGER,
    actual_travel_time_min INTEGER,
    deployed_by UUID REFERENCES users(id),
    ai_recommended BOOLEAN DEFAULT false,
    deployed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deployments_resource ON resource_deployments(resource_id);
CREATE INDEX idx_deployments_disaster ON resource_deployments(disaster_id);
CREATE INDEX idx_deployments_status ON resource_deployments(status);
CREATE INDEX idx_deployments_destination ON resource_deployments USING GIST(destination_location);

CREATE TABLE roads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    road_type road_type_enum NOT NULL,
    geometry GEOMETRY(LineString, 4326) NOT NULL,
    region_id UUID REFERENCES regions(id),
    status road_status_enum NOT NULL DEFAULT 'open',
    blockage_level DECIMAL(5,4) DEFAULT 0 CHECK (blockage_level >= 0 AND blockage_level <= 1),
    blockage_reason VARCHAR(255),
    accessibility accessibility_enum NOT NULL DEFAULT 'accessible',
    flood_risk severity_enum,
    length_km DECIMAL(8,3),
    speed_limit_kmh INTEGER,
    current_speed_kmh INTEGER,
    connects_hospital BOOLEAN DEFAULT false,
    connects_shelter BOOLEAN DEFAULT false,
    last_status_update TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_roads_geometry ON roads USING GIST(geometry);
CREATE INDEX idx_roads_region ON roads(region_id);
CREATE INDEX idx_roads_status ON roads(status);
CREATE INDEX idx_roads_blocked ON roads(status) WHERE status != 'open';
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
DROP TABLE IF EXISTS roads;
DROP TABLE IF EXISTS resource_deployments;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS hospitals;
DROP TABLE IF EXISTS shelters;
`);
}
