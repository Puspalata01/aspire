import { sql } from "kysely";
import { getDb } from "@/server/db";
import { httpErrors } from "@/server/core/errors";
import type { RegionType } from "@/server/db/types";

export type RegionRecord = {
  id: string;
  name: string;
  type: RegionType;
  code: string | null;
  parent_id: string | null;
  area_sq_km: number | null;
  population: number | null;
  population_density: number | null;
  elevation_avg_m: number | null;
  metadata: unknown;
  created_at: string | Date;
  updated_at: string | Date;
};

export type RegionKpi = {
  region_id: string;
  region_name: string;
  active_disasters: number;
  active_sos_reports: number;
  unresolved_sos_reports: number;
  open_shelters: number;
  total_shelter_capacity: number;
  shelter_occupancy: number;
  available_resources: number;
  highest_risk_level: string | null;
  highest_risk_score: number | null;
  unverified_citizen_reports: number;
  population: number | null;
  area_sq_km: number | null;
};

const REGION_FIELDS = [
  "regions.id",
  "regions.name",
  "regions.type",
  "regions.code",
  "regions.parent_id",
  "regions.area_sq_km",
  "regions.population",
  "regions.population_density",
  "regions.elevation_avg_m",
  "regions.metadata",
  "regions.created_at",
  "regions.updated_at",
] as const;

function mapRow(row: Record<string, unknown>): RegionRecord {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as RegionType,
    code: (row.code as string) ?? null,
    parent_id: (row.parent_id as string) ?? null,
    area_sq_km: (row.area_sq_km as number) ?? null,
    population: (row.population as number) ?? null,
    population_density: (row.population_density as number) ?? null,
    elevation_avg_m: (row.elevation_avg_m as number) ?? null,
    metadata: (row.metadata ?? {}) as unknown,
    created_at: row.created_at as string | Date,
    updated_at: row.updated_at as string | Date,
  };
}

export async function listRegions(input: {
  type?: string;
  parentId?: string;
  page: number;
  limit: number;
}) {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  let count = db.selectFrom("regions").select((eb) => eb.fn.countAll().as("total"));
  let q = db
    .selectFrom("regions")
    .select(REGION_FIELDS)
    .orderBy("regions.name", "asc")
    .offset((input.page - 1) * input.limit)
    .limit(input.limit);

  if (input.type) {
    count = count.where("regions.type", "=", input.type as never);
    q = q.where("regions.type", "=", input.type as never);
  }
  if (input.parentId) {
    count = count.where("regions.parent_id", "=", input.parentId);
    q = q.where("regions.parent_id", "=", input.parentId);
  }

  const [total, rows] = await Promise.all([count.executeTakeFirst(), q.execute()]);
  return { items: rows.map(mapRow), total_records: Number(total?.total ?? 0) };
}

export async function getRegionKpi(regionId: string): Promise<RegionKpi | null> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const region = await db
    .selectFrom("regions")
    .select(["regions.id", "regions.name", "regions.population", "regions.area_sq_km"])
    .where("regions.id", "=", regionId)
    .executeTakeFirst();

  if (!region) return null;

  // Aggregate KPIs
  const [disasters, sosReports, shelters, resources, riskAssessments, citizenReports] = await Promise.all([
    db
      .selectFrom("disasters")
      .select((eb) => eb.fn.countAll().as("count"))
      .where("disasters.region_id", "=", regionId)
      .where("disasters.status", "in", ["active", "monitoring"])
      .executeTakeFirst(),

    db
      .selectFrom("sos_reports")
      .select([
        sql<number>`COUNT(*)`.as("total"),
        sql<number>`COUNT(*) FILTER (WHERE status IN ('received', 'verified', 'assigned', 'in_progress'))`.as(
          "active",
        ),
        sql<number>`COUNT(*) FILTER (WHERE status NOT IN ('resolved', 'rejected'))`.as("unresolved"),
      ])
      .where("sos_reports.region_id", "=", regionId)
      .executeTakeFirst(),

    db
      .selectFrom("shelters")
      .select([
        sql<number>`COUNT(*) FILTER (WHERE status IN ('open', 'preparing'))`.as("open"),
        sql<number>`SUM(capacity)`.as("total_capacity"),
        sql<number>`SUM(current_occupancy)`.as("occupancy"),
      ])
      .where("shelters.region_id", "=", regionId)
      .executeTakeFirst(),

    db
      .selectFrom("resources")
      .select((eb) => eb.fn.countAll().as("count"))
      .where("resources.region_id", "=", regionId)
      .where("resources.status", "=", "available")
      .executeTakeFirst(),

        // Latest risk assessment (filter valid ones in memory or query without WHERE)
    db
      .selectFrom("risk_assessments")
      .select(["risk_assessments.risk_level", "risk_assessments.risk_score", "risk_assessments.valid_until"])
      .where("risk_assessments.region_id", "=", regionId)
      .orderBy("risk_assessments.created_at", "desc")
      .limit(1)
      .executeTakeFirst(),

    db
      .selectFrom("citizen_reports")
      .select((eb) => eb.fn.countAll().as("count"))
      .where("citizen_reports.region_id", "=", regionId)
      .where("citizen_reports.verification_status", "=", "unverified")
      .executeTakeFirst(),
  ]);

  return {
    region_id: region.id as string,
    region_name: region.name as string,
    active_disasters: Number(disasters?.count ?? 0),
    active_sos_reports: Number(sosReports?.active ?? 0),
    unresolved_sos_reports: Number(sosReports?.unresolved ?? 0),
    open_shelters: Number(shelters?.open ?? 0),
    total_shelter_capacity: Number(shelters?.total_capacity ?? 0),
    shelter_occupancy: Number(shelters?.occupancy ?? 0),
    available_resources: Number(resources?.count ?? 0),
    highest_risk_level:
      riskAssessments?.valid_until && new Date(riskAssessments.valid_until) > new Date()
        ? (riskAssessments.risk_level as string | null) ?? null
        : null,
    highest_risk_score:
      riskAssessments?.valid_until && new Date(riskAssessments.valid_until) > new Date()
        ? Number(riskAssessments.risk_score ?? 0)
        : 0,
    unverified_citizen_reports: Number(citizenReports?.count ?? 0),
    population: (region.population as number | null) ?? null,
    area_sq_km: (region.area_sq_km as number | null) ?? null,
  };
}