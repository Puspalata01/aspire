import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST(last_known_location);
CREATE INDEX IF NOT EXISTS idx_regions_geometry ON regions USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_disasters_geometry ON disasters USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_hazards_location ON hazards USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_hazards_area ON hazards USING GIST(affected_area);
CREATE INDEX IF NOT EXISTS idx_weather_location ON weather_data USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_shelters_location ON shelters USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_hospitals_location ON hospitals USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_resources_location ON resources USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_roads_geometry ON roads USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_sos_location ON sos_reports USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_clusters_centroid ON sos_clusters USING GIST(centroid);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_location ON citizen_reports USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_predictions_geometry ON predictions USING GIST(predicted_geometry);
CREATE INDEX IF NOT EXISTS idx_deployments_destination ON resource_deployments USING GIST(destination_location);
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
DROP INDEX IF EXISTS idx_deployments_destination;
`);
}
