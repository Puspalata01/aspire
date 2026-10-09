import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
CREATE TABLE risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID NOT NULL REFERENCES regions(id),
    hazard_type hazard_type_enum NOT NULL,
    risk_level severity_enum NOT NULL,
    risk_score DECIMAL(5,4) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 1),
    confidence DECIMAL(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    contributing_factors JSONB NOT NULL DEFAULT '[]',
    model_version VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    explanation TEXT,
    recommended_actions JSONB DEFAULT '[]',
    previous_score DECIMAL(5,4),
    score_trend VARCHAR(20),
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    disaster_id UUID REFERENCES disasters(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_risk_region ON risk_assessments(region_id);
CREATE INDEX idx_risk_hazard ON risk_assessments(hazard_type);
CREATE INDEX idx_risk_level ON risk_assessments(risk_level);
CREATE INDEX idx_risk_validity ON risk_assessments(valid_from, valid_until);
CREATE INDEX idx_risk_latest ON risk_assessments(region_id, hazard_type, created_at DESC);

CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disaster_id UUID REFERENCES disasters(id),
    region_id UUID NOT NULL REFERENCES regions(id),
    hazard_type hazard_type_enum NOT NULL,
    prediction_type prediction_type_enum NOT NULL,
    predicted_value DECIMAL(10,4),
    predicted_category VARCHAR(50),
    predicted_geometry GEOMETRY(MultiPolygon, 4326),
    confidence DECIMAL(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    forecast_horizon_hours INTEGER NOT NULL,
    forecast_time TIMESTAMPTZ NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    input_features JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_predictions_region ON predictions(region_id);
CREATE INDEX idx_predictions_hazard ON predictions(hazard_type);
CREATE INDEX idx_predictions_forecast ON predictions(forecast_time);
CREATE INDEX idx_predictions_geometry ON predictions USING GIST(predicted_geometry);

CREATE TABLE impact_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disaster_id UUID REFERENCES disasters(id),
    region_id UUID NOT NULL REFERENCES regions(id),
    population_affected INTEGER,
    buildings_at_risk INTEGER,
    roads_at_risk INTEGER,
    hospitals_at_risk INTEGER,
    shelters_at_pressure INTEGER,
    estimated_rescue_demand INTEGER,
    estimated_medical_demand INTEGER,
    estimated_food_demand_kg DECIMAL(10,2),
    estimated_water_demand_l DECIMAL(10,2),
    economic_damage_estimate DECIMAL(15,2),
    impact_severity severity_enum NOT NULL,
    impact_score DECIMAL(5,4) NOT NULL CHECK (impact_score >= 0 AND impact_score <= 1),
    confidence DECIMAL(5,4) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_impact_disaster ON impact_estimates(disaster_id);
CREATE INDEX idx_impact_region ON impact_estimates(region_id);

CREATE TABLE cascade_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disaster_id UUID REFERENCES disasters(id),
    region_id UUID NOT NULL REFERENCES regions(id),
    primary_hazard hazard_type_enum NOT NULL,
    cascade_chain JSONB NOT NULL,
    total_cascade_steps INTEGER NOT NULL,
    max_risk_amplification DECIMAL(5,2),
    overall_cascade_score DECIMAL(5,4) NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cascade_disaster ON cascade_analyses(disaster_id);
CREATE INDEX idx_cascade_region ON cascade_analyses(region_id);
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
DROP TABLE IF EXISTS cascade_analyses;
DROP TABLE IF EXISTS impact_estimates;
DROP TABLE IF EXISTS predictions;
DROP TABLE IF EXISTS risk_assessments;
`);
}
