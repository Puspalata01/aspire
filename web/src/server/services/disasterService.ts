import { sql } from "kysely";
import { z } from "zod";
import { getDb } from "@/server/db";
import { httpErrors } from "@/server/core/errors";
import { audit, type AuditContext } from "@/server/core/audit";
import { logger } from "@/server/logger";
import type { HazardType, Severity, DisasterStatus, JsonValue } from "@/server/db/types";

export const HAZARD_TYPES = [
  "flood",
  "cyclone",
  "heatwave",
  "landslide",
  "earthquake",
  "tsunami",
  "drought",
  "wildfire",
] as const;

export const SEVERITIES = ["low", "medium", "high", "critical"] as const;

export const DISASTER_STATUSES = [
  "monitoring",
  "active",
  "resolving",
  "resolved",
  "archived",
] as const;

export type DisasterRecord = {
  id: string;
  name: string;
  type: HazardType;
  severity: Severity;
  status: DisasterStatus;
  region_id: string | null;
  region_name: string | null;
  geometry: unknown;
  center_point: unknown;
  start_time: string | Date;
  end_time: string | Date | null;
  peak_severity: Severity | null;
  peak_time: string | Date | null;
  description: string | null;
  source: string | null;
  estimated_affected_population: number | null;
  estimated_damage_score: string | number | null;
  metadata: unknown;
  created_by: string | null;
  created_at: string | Date;
  updated_at: string | Date;
};

export type DisasterListInput = {
  status?: DisasterStatus;
  hazardType?: HazardType;
  severity?: Severity;
  regionId?: string;
  page: number;
  limit: number;
};

export type ListResult = { items: DisasterRecord[]; total_records: number };

const geojsonGeometrySchema = z.object({
  type: z.enum(["Polygon", "MultiPolygon"]),
  coordinates: z.array(z.unknown()).min(1),
});

const geojsonPointSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([z.number(), z.number()]),
});

export const createDisasterSchema = z.object({
  name: z.string().trim().min(1).max(255),
  type: z.enum(HAZARD_TYPES),
  severity: z.enum(SEVERITIES).default("low"),
  status: z.enum(DISASTER_STATUSES).default("monitoring"),
  region_id: z.uuid().nullable().optional(),
  geometry: z.union([z.string().min(1), geojsonGeometrySchema]).optional(),
  center_point: z
    .union([z.string().min(1), geojsonPointSchema, z.tuple([z.number(), z.number()])])
    .optional(),
  start_time: z.iso.datetime().optional(),
  end_time: z.iso.datetime().nullish(),
  peak_severity: z.enum(SEVERITIES).nullish(),
  peak_time: z.iso.datetime().nullish(),
  description: z.string().max(10_000).nullish(),
  source: z.string().max(255).nullish(),
  estimated_affected_population: z.number().int().nonnegative().max(2_147_483_647).nullish(),
  estimated_damage_score: z.number().min(0).max(999.999).nullish(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type CreateDisasterInput = z.infer<typeof createDisasterSchema>;

function geometryExpr(value: CreateDisasterInput["geometry"]): ReturnType<typeof sql> | null {
  if (value == null) return null;
  if (typeof value === "string") return sql`ST_Multi(ST_GeomFromText(${value}, 4326))`;
  return sql`ST_Multi(ST_GeomFromGeoJSON(${JSON.stringify(value)}::jsonb))`;
}

function pointExpr(value: CreateDisasterInput["center_point"]): ReturnType<typeof sql> | null {
  if (value == null) return null;
  if (typeof value === "string") return sql`ST_GeomFromText(${value}, 4326)`;
  if (Array.isArray(value)) {
    const [lng, lat] = value;
    return sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`;
  }
  return sql`ST_GeomFromGeoJSON(${JSON.stringify(value)}::jsonb)`;
}

function isGeometryError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const code = (error as { code?: string }).code;
  return ["22023", "22024", "22P02", "XX000"].includes(code ?? "");
}

function mapRow(row: Record<string, unknown>): DisasterRecord {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as HazardType,
    severity: row.severity as Severity,
    status: row.status as DisasterStatus,
    region_id: (row.region_id as string) ?? null,
    region_name: (row.region_name as string) ?? null,
    geometry:
      typeof row.geometry === "string" ? JSON.parse(row.geometry) : (row.geometry ?? null),
    center_point:
      typeof row.center_point === "string" ? JSON.parse(row.center_point) : (row.center_point ?? null),
    start_time: row.start_time as string | Date,
    end_time: (row.end_time as string | Date) ?? null,
    peak_severity: (row.peak_severity as Severity) ?? null,
    peak_time: (row.peak_time as string | Date) ?? null,
    description: (row.description as string) ?? null,
    source: (row.source as string) ?? null,
    estimated_affected_population: (row.estimated_affected_population as number) ?? null,
    estimated_damage_score: (row.estimated_damage_score as string | number) ?? null,
    metadata: (row.metadata ?? {}) as unknown,
    created_by: (row.created_by as string) ?? null,
    created_at: row.created_at as string | Date,
    updated_at: row.updated_at as string | Date,
  };
}

export async function listDisasters(input: DisasterListInput): Promise<ListResult> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  let countQuery = db
    .selectFrom("disasters")
    .select((eb) => eb.fn.countAll().as("total"));

  let listQuery = db
    .selectFrom("disasters")
    .leftJoin("regions", "regions.id", "disasters.region_id")
    .select([
      "disasters.id",
      "disasters.name",
      "disasters.type",
      "disasters.severity",
      "disasters.status",
      "disasters.region_id",
      "regions.name as region_name",
      "disasters.start_time",
      "disasters.end_time",
      "disasters.peak_severity",
      "disasters.peak_time",
      "disasters.description",
      "disasters.source",
      "disasters.estimated_affected_population",
      "disasters.estimated_damage_score",
      "disasters.metadata",
      "disasters.created_by",
      "disasters.created_at",
      "disasters.updated_at",
      sql<unknown>`ST_AsGeoJSON(disasters.geometry)::text`.as("geometry"),
      sql<unknown>`ST_AsGeoJSON(disasters.center_point)::text`.as("center_point"),
    ])
    .orderBy("disasters.start_time", "desc")
    .offset((input.page - 1) * input.limit)
    .limit(input.limit);

  if (input.status) {
    countQuery = countQuery.where("disasters.status", "=", input.status);
    listQuery = listQuery.where("disasters.status", "=", input.status);
  }
  if (input.hazardType) {
    countQuery = countQuery.where("disasters.type", "=", input.hazardType);
    listQuery = listQuery.where("disasters.type", "=", input.hazardType);
  }
  if (input.severity) {
    countQuery = countQuery.where("disasters.severity", "=", input.severity);
    listQuery = listQuery.where("disasters.severity", "=", input.severity);
  }
  if (input.regionId) {
    countQuery = countQuery.where("disasters.region_id", "=", input.regionId);
    listQuery = listQuery.where("disasters.region_id", "=", input.regionId);
  }

  const [countRow, rows] = await Promise.all([
    countQuery.executeTakeFirst(),
    listQuery.execute(),
  ]);

  return {
    items: rows.map(mapRow),
    total_records: Number(countRow?.total ?? 0),
  };
}

export async function getDisasterById(id: string): Promise<DisasterRecord | null> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const row = await db
    .selectFrom("disasters")
    .leftJoin("regions", "regions.id", "disasters.region_id")
    .select([
      "disasters.id",
      "disasters.name",
      "disasters.type",
      "disasters.severity",
      "disasters.status",
      "disasters.region_id",
      "regions.name as region_name",
      "disasters.start_time",
      "disasters.end_time",
      "disasters.peak_severity",
      "disasters.peak_time",
      "disasters.description",
      "disasters.source",
      "disasters.estimated_affected_population",
      "disasters.estimated_damage_score",
      "disasters.metadata",
      "disasters.created_by",
      "disasters.created_at",
      "disasters.updated_at",
      sql<unknown>`ST_AsGeoJSON(disasters.geometry)::text`.as("geometry"),
      sql<unknown>`ST_AsGeoJSON(disasters.center_point)::text`.as("center_point"),
    ])
    .where("disasters.id", "=", id)
    .executeTakeFirst();

  return row ? mapRow(row) : null;
}

export async function createDisaster(
  input: CreateDisasterInput,
  ctx: AuditContext,
): Promise<DisasterRecord> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const now = new Date();

  try {
    const inserted = await db
      .insertInto("disasters")
      .values({
        name: input.name,
        type: input.type,
        severity: input.severity,
        status: input.status,
        region_id: input.region_id ?? null,
        geometry: (geometryExpr(input.geometry) ?? null) as unknown as string,
        center_point: (pointExpr(input.center_point) ?? null) as unknown as string,
        start_time: input.start_time ? new Date(input.start_time) : now,
        end_time: input.end_time != null ? new Date(input.end_time) : null,
        peak_severity: input.peak_severity ?? null,
        peak_time: input.peak_time != null ? new Date(input.peak_time) : null,
        description: input.description ?? null,
        source: input.source ?? null,
        estimated_affected_population: input.estimated_affected_population ?? null,
        estimated_damage_score: input.estimated_damage_score ?? null,
        metadata: input.metadata as unknown as JsonValue,
        created_by: ctx.actorId ?? null,
      })
      .returning(["id", "created_at", "updated_at"])
      .executeTakeFirstOrThrow();

    const record = await getDisasterById(inserted.id);
    if (!record) {
      throw httpErrors.internal("disaster created but could not be read back");
    }

    await audit(ctx, "DISASTER_CREATE", "disaster", record.id, null, {
      name: record.name,
      type: record.type,
      severity: record.severity,
      status: record.status,
      region_id: record.region_id,
    });

    return record;
  } catch (error) {
    if (isGeometryError(error)) throw httpErrors.invalidGeometry();
    logger.error({ err: error }, "create disaster failed");
    throw error;
  }
}