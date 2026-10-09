import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
CREATE TABLE disasters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type hazard_type_enum NOT NULL,
    severity severity_enum NOT NULL DEFAULT 'low',
    status disaster_status_enum NOT NULL DEFAULT 'monitoring',
    region_id UUID REFERENCES regions(id),
    geometry GEOMETRY(MultiPolygon, 4326),
    center_point GEOMETRY(Point, 4326),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    peak_severity severity_enum,
    peak_time TIMESTAMPTZ,
    description TEXT,
    source VARCHAR(100),
    estimated_affected_population INTEGER,
    estimated_damage_score DECIMAL(5,3),
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_disasters_type ON disasters(type);
CREATE INDEX idx_disasters_status ON disasters(status);
CREATE INDEX idx_disasters_region ON disasters(region_id);
CREATE INDEX idx_disasters_geometry ON disasters USING GIST(geometry);
CREATE INDEX idx_disasters_time ON disasters(start_time DESC);
CREATE INDEX idx_disasters_active ON disasters(status) WHERE status IN ('monitoring', 'active');

CREATE TABLE hazards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disaster_id UUID REFERENCES disasters(id) ON DELETE SET NULL,
    type hazard_type_enum NOT NULL,
    severity severity_enum NOT NULL,
    score DECIMAL(5,4) NOT NULL CHECK (score >= 0 AND score <= 1),
    location GEOMETRY(Point, 4326) NOT NULL,
    affected_area GEOMETRY(MultiPolygon, 4326),
    radius_km DECIMAL(8,3),
    parameters JSONB NOT NULL DEFAULT '{}',
    data_source VARCHAR(100) NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ,
    confidence DECIMAL(5,4) CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hazards_type ON hazards(type);
CREATE INDEX idx_hazards_location ON hazards USING GIST(location);
CREATE INDEX idx_hazards_area ON hazards USING GIST(affected_area);
CREATE INDEX idx_hazards_disaster ON hazards(disaster_id);
CREATE INDEX idx_hazards_observed ON hazards(observed_at DESC);
CREATE INDEX idx_hazards_severity ON hazards(severity);

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disaster_id UUID REFERENCES disasters(id) ON DELETE SET NULL,
    type alert_type_enum NOT NULL,
    severity severity_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_audience alert_audience_enum NOT NULL DEFAULT 'all',
    target_region_id UUID REFERENCES regions(id),
    target_area GEOMETRY(MultiPolygon, 4326),
    status alert_status_enum NOT NULL DEFAULT 'active',
    auto_generated BOOLEAN DEFAULT true,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_region ON alerts(target_region_id);
CREATE INDEX idx_alerts_active ON alerts(status, severity) WHERE status = 'active';
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);

CREATE TABLE weather_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location GEOMETRY(Point, 4326) NOT NULL,
    region_id UUID REFERENCES regions(id),
    temperature_c DECIMAL(5,2),
    feels_like_c DECIMAL(5,2),
    humidity_pct DECIMAL(5,2),
    pressure_hpa DECIMAL(7,2),
    wind_speed_kmh DECIMAL(6,2),
    wind_direction_deg DECIMAL(5,2),
    rainfall_mm DECIMAL(8,2),
    rainfall_rate_mm_hr DECIMAL(8,2),
    visibility_km DECIMAL(6,2),
    cloud_cover_pct DECIMAL(5,2),
    uv_index DECIMAL(4,1),
    weather_condition VARCHAR(100),
    data_source VARCHAR(100) NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    forecast_for TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_weather_location ON weather_data USING GIST(location);
CREATE INDEX idx_weather_region ON weather_data(region_id);
CREATE INDEX idx_weather_observed ON weather_data(observed_at DESC);
CREATE INDEX idx_weather_source ON weather_data(data_source);
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
DROP TABLE IF EXISTS weather_data;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS hazards;
DROP TABLE IF EXISTS disasters;
`);
}
