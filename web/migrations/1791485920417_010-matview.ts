import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
CREATE MATERIALIZED VIEW mv_region_risk_summary AS
SELECT
    r.id AS region_id,
    r.name AS region_name,
    ra.hazard_type,
    ra.risk_level,
    ra.risk_score,
    ra.confidence,
    ra.created_at AS last_assessment,
    COUNT(s.id) FILTER (WHERE s.status IN ('received', 'verified', 'assigned')) AS active_sos_count,
    COUNT(d.id) FILTER (WHERE d.status IN ('monitoring', 'active')) AS active_disasters
FROM regions r
LEFT JOIN LATERAL (
    SELECT * FROM risk_assessments
    WHERE region_id = r.id
    ORDER BY created_at DESC
    LIMIT 1
) ra ON true
LEFT JOIN sos_reports s ON s.region_id = r.id
LEFT JOIN disasters d ON d.region_id = r.id
GROUP BY r.id, r.name, ra.hazard_type, ra.risk_level, ra.risk_score, ra.confidence, ra.created_at;

CREATE UNIQUE INDEX idx_mv_region_risk ON mv_region_risk_summary(region_id, hazard_type);
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
DROP MATERIALIZED VIEW IF EXISTS mv_region_risk_summary;
`);
}
