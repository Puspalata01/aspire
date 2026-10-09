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

const DEFAULT_REGIONS: RegionRecord[] = [
  {
    id: "reg-puri-01",
    name: "Puri",
    type: "district",
    code: "OD-PUR",
    parent_id: null,
    area_sq_km: 3479,
    population: 1698730,
    population_density: 488,
    elevation_avg_m: 6,
    metadata: { hazard: "cyclone", risk_level: "critical", risk_score: 94 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "reg-jagatsingh-01",
    name: "Jagatsinghpur",
    type: "district",
    code: "OD-JAG",
    parent_id: null,
    area_sq_km: 1668,
    population: 1136971,
    population_density: 681,
    elevation_avg_m: 8,
    metadata: { hazard: "cyclone", risk_level: "critical", risk_score: 91 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "reg-kendrapara-01",
    name: "Kendrapara",
    type: "district",
    code: "OD-KEN",
    parent_id: null,
    area_sq_km: 2644,
    population: 1440218,
    population_density: 545,
    elevation_avg_m: 13,
    metadata: { hazard: "cyclone", risk_level: "high", risk_score: 84 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "reg-cuttack-02",
    name: "Cuttack",
    type: "district",
    code: "OD-CUT",
    parent_id: null,
    area_sq_km: 3932,
    population: 2624470,
    population_density: 667,
    elevation_avg_m: 36,
    metadata: { hazard: "flood", risk_level: "high", risk_score: 78 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "reg-ganjam-01",
    name: "Ganjam",
    type: "district",
    code: "OD-GAN",
    parent_id: null,
    area_sq_km: 8206,
    population: 3529031,
    population_density: 430,
    elevation_avg_m: 42,
    metadata: { hazard: "flood", risk_level: "medium", risk_score: 62 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "reg-khurda-01",
    name: "Khordha",
    type: "district",
    code: "OD-KHO",
    parent_id: null,
    area_sq_km: 2813,
    population: 2251673,
    population_density: 800,
    elevation_avg_m: 45,
    metadata: { hazard: "wind", risk_level: "medium", risk_score: 58 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "reg-sambalpur-03",
    name: "Sambalpur",
    type: "district",
    code: "OD-SAM",
    parent_id: null,
    area_sq_km: 6657,
    population: 1041099,
    population_density: 156,
    elevation_avg_m: 135,
    metadata: { hazard: "heatwave", risk_level: "medium", risk_score: 52 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function listRegions(input: {
  type?: string;
  parentId?: string;
  page: number;
  limit: number;
}) {
  const fallback = () => {
    let filtered = DEFAULT_REGIONS;
    if (input.type) {
      filtered = filtered.filter((r) => r.type === input.type);
    }
    const offset = (input.page - 1) * input.limit;
    return {
      items: filtered.slice(offset, offset + input.limit),
      total_records: filtered.length,
    };
  };

  const db = getDb();
  if (!db) return fallback();

  try {
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
    if (!rows || rows.length === 0) return fallback();
    return { items: rows.map(mapRow), total_records: Number(total?.total ?? 0) };
  } catch (err) {
    return fallback();
  }
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