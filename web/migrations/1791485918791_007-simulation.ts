import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
CREATE TABLE simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id),
    region_id UUID REFERENCES regions(id),
    disaster_id UUID REFERENCES disasters(id),
    base_hazard_type hazard_type_enum NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_simulations_region ON simulations(region_id);
CREATE INDEX idx_simulations_status ON simulations(status);
CREATE INDEX idx_simulations_created ON simulations(created_at DESC);

CREATE TABLE simulation_params (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_id UUID NOT NULL REFERENCES simulations(id),
    param_name VARCHAR(100) NOT NULL,
    param_value DECIMAL(12,4) NOT NULL,
    baseline_value DECIMAL(12,4) NOT NULL,
    change_pct DECIMAL(8,4),
    unit VARCHAR(50) NOT NULL
);

CREATE INDEX idx_sim_params_simulation ON simulation_params(simulation_id);
CREATE UNIQUE INDEX idx_sim_params_unique ON simulation_params(simulation_id, param_name);

CREATE TABLE simulation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_id UUID NOT NULL REFERENCES simulations(id),
    metric_name VARCHAR(100) NOT NULL,
    baseline_value DECIMAL(12,4) NOT NULL,
    simulated_value DECIMAL(12,4) NOT NULL,
    change_pct DECIMAL(8,4),
    unit VARCHAR(50) NOT NULL
);

CREATE INDEX idx_sim_results_simulation ON simulation_results(simulation_id);
CREATE UNIQUE INDEX idx_sim_results_unique ON simulation_results(simulation_id, metric_name);
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
DROP TABLE IF EXISTS simulation_results;
DROP TABLE IF EXISTS simulation_params;
DROP TABLE IF EXISTS simulations;
`);
}
