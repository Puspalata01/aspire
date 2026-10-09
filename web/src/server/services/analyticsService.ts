import { sql } from "kysely";
import { getDb } from "@/server/db";
import { httpErrors } from "@/server/core/errors";
import { logger } from "@/server/logger";
import { domainStore } from "@/server/domainStore";

export type HeatmapCell = {
  cell_id: string;
  geometry: unknown;
  center_lat: number;
  center_lng: number;
  risk_score: number;
  disaster_count: number;
  sos_count: number;
  hazard_count: number;
  affected_population_estimate: number;
};

function fallbackHeatmapCells(): HeatmapCell[] {
  return [
    { cell_id: "cell-1", geometry: null, center_lat: 19.81, center_lng: 85.83, risk_score: 92.4, disaster_count: 1, sos_count: 24, hazard_count: 2, affected_population_estimate: 24500 },
    { cell_id: "cell-2", geometry: null, center_lat: 20.46, center_lng: 85.88, risk_score: 84.1, disaster_count: 1, sos_count: 12, hazard_count: 1, affected_population_estimate: 18200 },
    { cell_id: "cell-3", geometry: null, center_lat: 20.27, center_lng: 85.84, risk_score: 68.5, disaster_count: 1, sos_count: 6, hazard_count: 1, affected_population_estimate: 6000 },
    { cell_id: "cell-4", geometry: null, center_lat: 20.50, center_lng: 86.42, risk_score: 88.0, disaster_count: 1, sos_count: 16, hazard_count: 2, affected_population_estimate: 15400 },
    { cell_id: "cell-5", geometry: null, center_lat: 20.26, center_lng: 86.67, risk_score: 94.6, disaster_count: 1, sos_count: 19, hazard_count: 2, affected_population_estimate: 28900 },
  ];
}

export async function generateRiskHeatmap(input: {
  regionId?: string;
  bbox?: { minLng: number; minLat: number; maxLng: number; maxLat: number };
  cellSizeKm?: number;
}) {
  const db = getDb();
  if (!db) return fallbackHeatmapCells();

  const cellSizeKm = input.cellSizeKm ?? 5;
  const cellSizeMeters = cellSizeKm * 1000;

  // Build bounding box
  let bboxGeom: string;
  if (input.bbox) {
    bboxGeom = `ST_MakeEnvelope(${input.bbox.minLng}, ${input.bbox.minLat}, ${input.bbox.maxLng}, ${input.bbox.maxLat}, 4326)`;
  } else if (input.regionId) {
    const region = await db
      .selectFrom("regions")
      .select([sql`ST_Envelope(geometry)`.as("envelope")])
      .where("id", "=", input.regionId)
      .executeTakeFirst();
    if (!region) throw httpErrors.notFound("Region not found");
    bboxGeom = `ST_GeomFromText('${region.envelope}', 4326)`;
  } else {
    // Default to Odisha approximate bounds
    bboxGeom = "ST_MakeEnvelope(85.0, 19.0, 87.5, 22.5, 4326)";
  }

  // Generate hexagonal grid and aggregate risk indicators
  const result = await sql<HeatmapCell>`
    WITH hexgrid AS (
      SELECT 
        row_number() OVER () as cell_id,
        geom as cell_geom,
        ST_Y(ST_Centroid(geom)) as center_lat,
        ST_X(ST_Centroid(geom)) as center_lng
      FROM (
        SELECT ST_HexagonGrid(${cellSizeMeters}, ${sql.raw(bboxGeom)}) as geom
      ) grid
    ),
    disasters_per_cell AS (
      SELECT 
        h.cell_id,
        COUNT(d.id) as disaster_count
      FROM hexgrid h
      LEFT JOIN disasters d ON ST_Intersects(h.cell_geom, d.affected_area)
        AND d.status IN ('active', 'monitoring')
      GROUP BY h.cell_id
    ),
    sos_per_cell AS (
      SELECT 
        h.cell_id,
        COUNT(s.id) as sos_count
      FROM hexgrid h
      LEFT JOIN sos_reports s ON ST_Contains(h.cell_geom, s.location)
        AND s.status NOT IN ('resolved', 'rejected', 'duplicate')
      GROUP BY h.cell_id
    ),
    hazards_per_cell AS (
      SELECT 
        h.cell_id,
        COUNT(hz.id) as hazard_count,
        AVG(
          CASE hz.severity 
            WHEN 'critical' THEN 1.0
            WHEN 'high' THEN 0.75
            WHEN 'medium' THEN 0.5
            WHEN 'low' THEN 0.25
            ELSE 0
          END
        ) as avg_severity_score
      FROM hexgrid h
      LEFT JOIN hazards hz ON ST_Intersects(h.cell_geom, hz.affected_area)
        AND hz.valid_until > NOW()
      GROUP BY h.cell_id
    ),
    population_per_cell AS (
      SELECT 
        h.cell_id,
        SUM(
          COALESCE(r.population, 0) * 
          (ST_Area(ST_Intersection(h.cell_geom, r.geometry)::geography) / 
           NULLIF(ST_Area(r.geometry::geography), 0))
        ) as estimated_population
      FROM hexgrid h
      LEFT JOIN regions r ON ST_Intersects(h.cell_geom, r.geometry)
      GROUP BY h.cell_id
    )
    SELECT 
      h.cell_id::text,
      ST_AsGeoJSON(h.cell_geom)::json as geometry,
      h.center_lat,
      h.center_lng,
      COALESCE(
        (d.disaster_count * 0.4 + 
         s.sos_count * 0.3 + 
         hz.hazard_count * 0.2 +
         COALESCE(hz.avg_severity_score, 0) * 0.1),
        0
      )::numeric(5,4) as risk_score,
      COALESCE(d.disaster_count, 0)::int as disaster_count,
      COALESCE(s.sos_count, 0)::int as sos_count,
      COALESCE(hz.hazard_count, 0)::int as hazard_count,
      COALESCE(p.estimated_population, 0)::int as affected_population_estimate
    FROM hexgrid h
    LEFT JOIN disasters_per_cell d ON h.cell_id = d.cell_id
    LEFT JOIN sos_per_cell s ON h.cell_id = s.cell_id
    LEFT JOIN hazards_per_cell hz ON h.cell_id = hz.cell_id
    LEFT JOIN population_per_cell p ON h.cell_id = p.cell_id
    WHERE COALESCE(d.disaster_count, 0) + COALESCE(s.sos_count, 0) + COALESCE(hz.hazard_count, 0) > 0
    ORDER BY risk_score DESC
  `.execute(db);

  return result.rows;
}

export type FleetLocation = {
  resource_id: string;
  resource_name: string;
  resource_type: string;
  status: string;
  location: unknown;
  lat: number;
  lng: number;
  last_updated: Date | string;
  assigned_to: string | null;
};

export async function getFleetLocations(input: { regionId?: string; resourceType?: string; status?: string }) {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const q = await db.selectFrom("resources")
    .selectAll()
    .where("location", "is not", null)
    .$if(!!input.regionId, (qb) => qb.where("region_id", "=", input.regionId!))
    .$if(!!input.resourceType, (qb) => qb.where("type", "=", input.resourceType as any))
    .$if(!!input.status, (qb) => qb.where("status", "=", input.status as any))
    .execute();

  return q.map((r) => ({
    resource_id: r.id,
    resource_name: r.name,
    resource_type: r.type,
    status: r.status,
    location: r.location ? JSON.parse(r.location as string) : null,
    lat: r.location ? JSON.parse(r.location as string).coordinates[1] : 0,
    lng: r.location ? JSON.parse(r.location as string).coordinates[0] : 0,
    last_updated: r.updated_at,
    assigned_to: r.assigned_disaster_id,
  }));
}

export type DashboardKpi = {
  timestamp: Date | string;
  active_disasters: number;
  active_disasters_change_24h: number;
  pending_sos: number;
  pending_sos_change_24h: number;
  shelters_occupied_percent: number;
  shelters_occupied_percent_change_24h: number;
  resource_utilization_percent: number;
  resource_utilization_change_24h: number;
  total_affected_population: number;
  unverified_citizen_reports: number;
  average_sos_response_time_min: number;
};

function fallbackDashboardKpis(): DashboardKpi {
  const kpis = domainStore.getDashboardKpis();
  return {
    timestamp: new Date(),
    active_disasters: kpis.active_hazards,
    active_disasters_change_24h: kpis.active_hazards_delta_24h,
    pending_sos: kpis.pending_sos_reports,
    pending_sos_change_24h: -4,
    shelters_occupied_percent: kpis.relief_camps_occupancy_rate,
    shelters_occupied_percent_change_24h: 3.2,
    resource_utilization_percent: 86.4,
    resource_utilization_change_24h: 8.5,
    total_affected_population: kpis.total_affected_population,
    unverified_citizen_reports: 18,
    average_sos_response_time_min: kpis.avg_response_time_min,
  };
}

export async function getDashboardKpis(): Promise<DashboardKpi> {
  const db = getDb();
  if (!db) return fallbackDashboardKpis();

  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [current, past24h] = await Promise.all([
    db
      .selectFrom("disasters")
      .select([
        sql<number>`COUNT(*) FILTER (WHERE status IN ('active', 'monitoring'))`.as("active_disasters"),
        sql<number>`SUM(COALESCE(estimated_affected_population, 0))`.as("total_affected_population"),
      ])
      .executeTakeFirst(),

    db
      .selectFrom("disasters")
      .select([
        sql<number>`COUNT(*) FILTER (WHERE status IN ('active', 'monitoring') AND created_at < ${yesterday.toISOString()})`.as(
          "active_disasters_24h_ago"
        ),
      ])
      .executeTakeFirst(),
  ]);

  const [sosCurrent, sosPast24h] = await Promise.all([
    db
      .selectFrom("sos_reports")
      .select([
        sql<number>`COUNT(*) FILTER (WHERE status IN ('received', 'verified', 'assigned', 'in_progress'))`.as(
          "pending_sos"
        ),
        sql<number>`AVG(response_time_min) FILTER (WHERE status = 'resolved' AND resolved_at > NOW() - INTERVAL '7 days')`.as(
          "avg_response_time"
        ),
      ])
      .executeTakeFirst(),

    db
      .selectFrom("sos_reports")
      .select([
        sql<number>`COUNT(*) FILTER (WHERE status IN ('received', 'verified', 'assigned', 'in_progress') AND created_at < ${yesterday.toISOString()})`.as(
          "pending_sos_24h_ago"
        ),
      ])
      .executeTakeFirst(),
  ]);

  const [shelterCurrent, shelterPast24h] = await Promise.all([
    db
      .selectFrom("shelters")
      .select([
        sql<number>`SUM(capacity)`.as("total_capacity"),
        sql<number>`SUM(current_occupancy)`.as("total_occupancy"),
      ])
      .where("status", "in", ["open", "preparing"])
      .executeTakeFirst(),

    db
      .selectFrom("shelters")
      .select([
        sql<number>`SUM(capacity) FILTER (WHERE updated_at < ${yesterday.toISOString()})`.as("total_capacity_24h"),
        sql<number>`SUM(current_occupancy) FILTER (WHERE updated_at < ${yesterday.toISOString()})`.as(
          "total_occupancy_24h"
        ),
      ])
      .where("status", "in", ["open", "preparing"])
      .executeTakeFirst(),
  ]);

  const [resourceCurrent, resourcePast24h] = await Promise.all([
    db
      .selectFrom("resources")
      .select([
        sql<number>`COUNT(*)`.as("total_resources"),
        sql<number>`COUNT(*) FILTER (WHERE status IN ('deployed', 'in_transit'))`.as("utilized_resources"),
      ])
      .executeTakeFirst(),

    db
      .selectFrom("resources")
      .select([
        sql<number>`COUNT(*) FILTER (WHERE updated_at < ${yesterday.toISOString()})`.as("total_resources_24h"),
        sql<number>`COUNT(*) FILTER (WHERE status IN ('deployed', 'in_transit') AND updated_at < ${yesterday.toISOString()})`.as(
          "utilized_resources_24h"
        ),
      ])
      .executeTakeFirst(),
  ]);

  const citizenReports = await db
    .selectFrom("citizen_reports")
    .select([sql<number>`COUNT(*) FILTER (WHERE verification_status = 'unverified')`.as("unverified")])
    .executeTakeFirst();

  const activeDisasters = Number(current?.active_disasters ?? 0);
  const activeDisasters24hAgo = Number(past24h?.active_disasters_24h_ago ?? 0);

  const pendingSos = Number(sosCurrent?.pending_sos ?? 0);
  const pendingSos24hAgo = Number(sosPast24h?.pending_sos_24h_ago ?? 0);

  const shelterCapacity = Number(shelterCurrent?.total_capacity ?? 0);
  const shelterOccupancy = Number(shelterCurrent?.total_occupancy ?? 0);
  const shelterCapacity24h = Number(shelterPast24h?.total_capacity_24h ?? 0);
  const shelterOccupancy24h = Number(shelterPast24h?.total_occupancy_24h ?? 0);

  const shelterOccupiedPercent = shelterCapacity > 0 ? (shelterOccupancy / shelterCapacity) * 100 : 0;
  const shelterOccupiedPercent24h = shelterCapacity24h > 0 ? (shelterOccupancy24h / shelterCapacity24h) * 100 : 0;

  const totalResources = Number(resourceCurrent?.total_resources ?? 0);
  const utilizedResources = Number(resourceCurrent?.utilized_resources ?? 0);
  const totalResources24h = Number(resourcePast24h?.total_resources_24h ?? 0);
  const utilizedResources24h = Number(resourcePast24h?.utilized_resources_24h ?? 0);

  const resourceUtilPercent = totalResources > 0 ? (utilizedResources / totalResources) * 100 : 0;
  const resourceUtilPercent24h = totalResources24h > 0 ? (utilizedResources24h / totalResources24h) * 100 : 0;

  return {
    timestamp: now,
    active_disasters: activeDisasters,
    active_disasters_change_24h: activeDisasters - activeDisasters24hAgo,
    pending_sos: pendingSos,
    pending_sos_change_24h: pendingSos - pendingSos24hAgo,
    shelters_occupied_percent: Math.round(shelterOccupiedPercent * 100) / 100,
    shelters_occupied_percent_change_24h: Math.round((shelterOccupiedPercent - shelterOccupiedPercent24h) * 100) / 100,
    resource_utilization_percent: Math.round(resourceUtilPercent * 100) / 100,
    resource_utilization_change_24h: Math.round((resourceUtilPercent - resourceUtilPercent24h) * 100) / 100,
    total_affected_population: Number(current?.total_affected_population ?? 0),
    unverified_citizen_reports: Number(citizenReports?.unverified ?? 0),
    average_sos_response_time_min: Math.round(Number(sosCurrent?.avg_response_time ?? 0)),
  };
  } catch (err) {
    logger.warn({ err }, "KPI DB query failed, falling back to domainStore");
    return fallbackDashboardKpis();
  }
}

export type DisasterImpactSummary = {
  disaster_id: string;
  disaster_name: string;
  disaster_type: string;
  status: string;
  start_time: Date | string;
  duration_hours: number;
  estimated_affected_population: number;
  active_sos_reports: number;
  resolved_sos_reports: number;
  active_alerts: number;
  shelters_activated: number;
  resources_deployed: number;
  affected_area_sq_km: number;
};

export async function getDisasterImpactSummary(disasterId: string): Promise<DisasterImpactSummary | null> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const disaster = await db
    .selectFrom("disasters")
    .select([
      "id as disaster_id",
      "name as disaster_name",
      "type as disaster_type",
      "status",
      "start_time",
      sql<number>`EXTRACT(EPOCH FROM (COALESCE(end_time, NOW()) - start_time)) / 3600`.as("duration_hours"),
      "estimated_affected_population",
      sql<number>`ST_Area(affected_area::geography) / 1000000`.as("affected_area_sq_km"),
    ])
    .where("id", "=", disasterId)
    .executeTakeFirst();

  if (!disaster) return null;

  const [sosStats, alerts, shelters, resources] = await Promise.all([
    db
      .selectFrom("sos_reports")
      .select([
        sql<number>`COUNT(*) FILTER (WHERE status IN ('received', 'verified', 'assigned', 'in_progress'))`.as(
          "active_sos"
        ),
        sql<number>`COUNT(*) FILTER (WHERE status = 'resolved')`.as("resolved_sos"),
      ])
      .where("disaster_id", "=", disasterId)
      .executeTakeFirst(),

    db
      .selectFrom("alerts")
      .select([sql<number>`COUNT(*)`.as("count")])
      .where("disaster_id", "=", disasterId)
      .where("status", "=", "active")
      .executeTakeFirst(),

    sql<{ count: number }>`
      SELECT COUNT(*)::int as count
      FROM shelters
      WHERE ST_Intersects(
        location, 
        (SELECT affected_area FROM disasters WHERE id = ${disasterId})
      )
      AND status IN ('open', 'preparing')
    `.execute(db).then((r) => r.rows[0]),

    db
      .selectFrom("resources")
      .select([sql<number>`COUNT(*)`.as("count")])
      .where("assigned_disaster_id", "=", disasterId)
      .where("status", "in", ["deployed", "in_transit"])
      .executeTakeFirst(),
  ]);

  return {
    disaster_id: disaster.disaster_id as string,
    disaster_name: disaster.disaster_name as string,
    disaster_type: disaster.disaster_type as string,
    status: disaster.status as string,
    start_time: disaster.start_time as Date | string,
    duration_hours: Math.round(Number(disaster.duration_hours ?? 0) * 10) / 10,
    estimated_affected_population: Number(disaster.estimated_affected_population ?? 0),
    active_sos_reports: Number(sosStats?.active_sos ?? 0),
    resolved_sos_reports: Number(sosStats?.resolved_sos ?? 0),
    active_alerts: Number(alerts?.count ?? 0),
    shelters_activated: Number(shelters?.count ?? 0),
    resources_deployed: Number(resources?.count ?? 0),
    affected_area_sq_km: Math.round(Number(disaster.affected_area_sq_km ?? 0) * 100) / 100,
  };
}

export type DisasterTimelineEvent = {
  timestamp: Date | string;
  event_type: string;
  event_category: string;
  description: string;
  entity_id: string | null;
  severity: string | null;
  metadata: unknown;
};

export async function getDisasterTimeline(disasterId: string): Promise<DisasterTimelineEvent[]> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  // Verify disaster exists
  const disaster = await db
    .selectFrom("disasters")
    .select(["id"])
    .where("id", "=", disasterId)
    .executeTakeFirst();

  if (!disaster) throw httpErrors.notFound("Disaster not found");

  const events = await sql<DisasterTimelineEvent>`
    SELECT 
      created_at as timestamp,
      'disaster' as event_category,
      'status_change' as event_type,
      'Disaster status: ' || status as description,
      id::text as entity_id,
      severity,
      json_build_object('type', type, 'name', name) as metadata
    FROM disasters
    WHERE id = ${disasterId}

    UNION ALL

    SELECT 
      created_at as timestamp,
      'alert' as event_category,
      'issued' as event_type,
      'Alert issued: ' || message as description,
      id::text as entity_id,
      severity,
      json_build_object('alert_type', alert_type) as metadata
    FROM alerts
    WHERE disaster_id = ${disasterId}

    UNION ALL

    SELECT 
      created_at as timestamp,
      'sos' as event_category,
      'reported' as event_type,
      'SOS report: ' || request_type || ' (urgency: ' || urgency || ')' as description,
      id::text as entity_id,
      urgency as severity,
      json_build_object('people_count', people_count, 'status', status) as metadata
    FROM sos_reports
    WHERE disaster_id = ${disasterId}

    UNION ALL

    SELECT 
      created_at as timestamp,
      'resource' as event_category,
      'deployed' as event_type,
      'Resource deployed: ' || name || ' (' || type || ')' as description,
      id::text as entity_id,
      NULL as severity,
      json_build_object('type', type, 'status', status) as metadata
    FROM resources
    WHERE disaster_id = ${disasterId}

    ORDER BY timestamp DESC
    LIMIT 100
  `.execute(db);

  return events.rows;
}

export type TrendAnalysis = {
  period: string;
  active_disasters: number;
  pending_sos: number;
  shelters_occupied_percent: number;
  resource_utilization_percent: number;
  total_affected_population: number;
};

export async function getTrendAnalysis(input: { period: "24h" | "7d" | "30d"; interval: "1h" | "1d" }) {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const periodHours = input.period === "24h" ? 24 : input.period === "7d" ? 168 : 720;
  const intervalHours = input.interval === "1h" ? 1 : 24;

  const data = await sql<{
    period: string;
    active_disasters: string;
    pending_sos: string;
    shelters_occupied_percent: string;
    resource_utilization_percent: string;
    total_affected_population: string;
  }>`
    WITH time_series AS (
      SELECT generate_series(
        date_trunc('hour', now() - interval '${sql.raw(periodHours.toString())} hours'),
        date_trunc('hour', now()),
        interval '${sql.raw(intervalHours.toString())} hours'
      ) AS period
    )
    SELECT 
      to_char(ts.period, 'YYYY-MM-DD HH24:MI') as period,
      COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'active' AND d.created_at <= ts.period) as active_disasters,
      COUNT(DISTINCT s.id) FILTER (WHERE s.status IN ('received', 'verified', 'assigned') AND s.created_at <= ts.period) as pending_sos,
      COALESCE(
        (SUM(sh.current_occupancy) FILTER (WHERE sh.created_at <= ts.period) * 100.0 / NULLIF(SUM(sh.capacity) FILTER (WHERE sh.created_at <= ts.period), 0)),
        0
      ) as shelters_occupied_percent,
      COALESCE(
        (COUNT(r.id) FILTER (WHERE r.status IN ('in_transit', 'deployed') AND r.created_at <= ts.period) * 100.0 / NULLIF(COUNT(r.id) FILTER (WHERE r.created_at <= ts.period), 0)),
        0
      ) as resource_utilization_percent,
      COALESCE(SUM(d.affected_population) FILTER (WHERE d.created_at <= ts.period), 0) as total_affected_population
    FROM time_series ts
    LEFT JOIN disasters d ON d.created_at <= ts.period
    LEFT JOIN sos_reports s ON s.created_at <= ts.period
    LEFT JOIN shelters sh ON sh.created_at <= ts.period
    LEFT JOIN resources r ON r.created_at <= ts.period
    GROUP BY ts.period
    ORDER BY ts.period ASC
  `.execute(db);

  return data.rows.map((r) => ({
    period: r.period,
    active_disasters: parseInt(r.active_disasters, 10),
    pending_sos: parseInt(r.pending_sos, 10),
    shelters_occupied_percent: parseFloat(r.shelters_occupied_percent),
    resource_utilization_percent: parseFloat(r.resource_utilization_percent),
    total_affected_population: parseInt(r.total_affected_population, 10),
  }));
}
