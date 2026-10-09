import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
CREATE TABLE sos_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centroid GEOMETRY(Point, 4326) NOT NULL,
    convex_hull GEOMETRY(Polygon, 4326),
    region_id UUID REFERENCES regions(id),
    disaster_id UUID REFERENCES disasters(id),
    report_count INTEGER NOT NULL CHECK (report_count > 0),
    dominant_request_type sos_type_enum NOT NULL,
    avg_urgency_score DECIMAL(5,4) NOT NULL,
    priority_score DECIMAL(5,4) NOT NULL,
    radius_km DECIMAL(6,3) NOT NULL,
    is_hotspot BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'active',
    recommended_resources JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clusters_centroid ON sos_clusters USING GIST(centroid);
CREATE INDEX idx_clusters_hull ON sos_clusters USING GIST(convex_hull);
CREATE INDEX idx_clusters_hotspot ON sos_clusters(is_hotspot) WHERE is_hotspot = true;

CREATE TABLE sos_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    location GEOMETRY(Point, 4326) NOT NULL,
    request_type sos_type_enum NOT NULL,
    urgency severity_enum NOT NULL,
    priority_score DECIMAL(5,4),
    people_count INTEGER DEFAULT 1 CHECK (people_count > 0),
    description TEXT,
    media_urls JSONB DEFAULT '[]',
    status sos_status_enum NOT NULL DEFAULT 'received',
    cluster_id UUID REFERENCES sos_clusters(id),
    is_duplicate BOOLEAN DEFAULT false,
    duplicate_of UUID REFERENCES sos_reports(id),
    assigned_resource_id UUID REFERENCES resources(id),
    assigned_by UUID REFERENCES users(id),
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    response_time_min INTEGER,
    disaster_id UUID REFERENCES disasters(id),
    region_id UUID REFERENCES regions(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sos_location ON sos_reports USING GIST(location);
CREATE INDEX idx_sos_status ON sos_reports(status);
CREATE INDEX idx_sos_urgency ON sos_reports(urgency);
CREATE INDEX idx_sos_type ON sos_reports(request_type);
CREATE INDEX idx_sos_user ON sos_reports(user_id);
CREATE INDEX idx_sos_cluster ON sos_reports(cluster_id);
CREATE INDEX idx_sos_disaster ON sos_reports(disaster_id);
CREATE INDEX idx_sos_pending ON sos_reports(status, urgency DESC) WHERE status IN ('received', 'verified', 'assigned');
CREATE INDEX idx_sos_created ON sos_reports(created_at DESC);

CREATE TABLE citizen_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    location GEOMETRY(Point, 4326) NOT NULL,
    report_type report_type_enum NOT NULL,
    severity severity_enum NOT NULL,
    description TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    verification_status verification_enum NOT NULL DEFAULT 'unverified',
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    is_duplicate BOOLEAN DEFAULT false,
    upvote_count INTEGER DEFAULT 0,
    disaster_id UUID REFERENCES disasters(id),
    region_id UUID REFERENCES regions(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_citizen_reports_location ON citizen_reports USING GIST(location);
CREATE INDEX idx_citizen_reports_type ON citizen_reports(report_type);
CREATE INDEX idx_citizen_reports_verification ON citizen_reports(verification_status);
CREATE INDEX idx_citizen_reports_disaster ON citizen_reports(disaster_id);
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
DROP TABLE IF EXISTS citizen_reports;
DROP TABLE IF EXISTS sos_reports;
DROP TABLE IF EXISTS sos_clusters;
`);
}
