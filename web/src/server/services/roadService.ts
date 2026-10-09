import { sql, type SqlBool } from "kysely";
import { z } from "zod";
import { getDb } from "@/server/db";
import { httpErrors } from "@/server/core/errors";
import { audit, type AuditContext } from "@/server/core/audit";
import { logger } from "@/server/logger";
import { touch } from "@/server/db/updates";
import type { RoadType, RoadStatus, Severity, JsonValue } from "@/server/db/types";

export const ROAD_TYPES = ["highway", "primary", "secondary", "tertiary", "local", "bridge"] as const;

export const ROAD_STATUSES = ["open", "partially_blocked", "blocked", "destroyed", "under_water"] as const;

export const SEVERITIES = ["low", "medium", "high", "critical"] as const;

const CONDITION_MAP: Record<RoadStatus, string> = {
  open: "passable",
  partially_blocked: "caution",
  blocked: "blocked",
  destroyed: "blocked",
  under_water: "flooded",
};

export type FeatureCollection = {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    id: string;
    geometry: unknown;
    properties: Record<string, unknown>;
  }[];
};

export type RoadRecord = {
  id: string;
  name: string;
  road_type: RoadType;
  region_id: string | null;
  status: RoadStatus;
  condition: string;
  blockage_level: string | number | null;
  blockage_reason: string | null;
  accessibility: string;
  flood_risk: Severity | null;
  length_km: string | number | null;
  speed_limit_kmh: number | null;
  current_speed_kmh: number | null;
  connects_hospital: boolean;
  connects_shelter: boolean;
  last_status_update: string | Date;
  metadata: unknown;
  updated_at: string | Date;
};

const ROAD_FIELDS = [
  "roads.id",
  "roads.name",
  "roads.road_type",
  "roads.region_id",
  "roads.status",
  "roads.blockage_level",
  "roads.blockage_reason",
  "roads.accessibility",
  "roads.flood_risk",
  "roads.length_km",
  "roads.speed_limit_kmh",
  "roads.current_speed_kmh",
  "roads.connects_hospital",
  "roads.connects_shelter",
  "roads.last_status_update",
  "roads.metadata",
  "roads.updated_at",
] as const;

function baseSelect(db: NonNullable<ReturnType<typeof getDb>>) {
  return db.selectFrom("roads").select([
    ...ROAD_FIELDS,
    sql<unknown>`ST_AsGeoJSON(roads.geometry)::text`.as("feature_geometry"),
  ]);
}

function mapRow(row: Record<string, unknown>): RoadRecord {
  return {
    id: row.id as string,
    name: row.name as string,
    road_type: row.road_type as RoadType,
    region_id: (row.region_id as string) ?? null,
    status: row.status as RoadStatus,
    condition: CONDITION_MAP[row.status as RoadStatus] ?? "passable",
    blockage_level: (row.blockage_level as string | number) ?? null,
    blockage_reason: (row.blockage_reason as string) ?? null,
    accessibility: (row.accessibility as string) ?? "accessible",
    flood_risk: (row.flood_risk as Severity | null) ?? null,
    length_km: (row.length_km as string | number) ?? null,
    speed_limit_kmh: (row.speed_limit_kmh as number) ?? null,
    current_speed_kmh: (row.current_speed_kmh as number) ?? null,
    connects_hospital: Boolean(row.connects_hospital),
    connects_shelter: Boolean(row.connects_shelter),
    last_status_update: row.last_status_update as string | Date,
    metadata: (row.metadata ?? {}) as unknown,
    updated_at: row.updated_at as string | Date,
  };
}

export const roadQuerySchema = z.object({
  status: z.enum(ROAD_STATUSES).optional(),
  region_id: z.uuid().optional(),
  bbox: z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return undefined;
      const parts = v.split(",").map((n) => Number(n));
      if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
        throw httpErrors.invalidPayload("bbox must be `minLng,minLat,maxLng,maxLat`");
      }
      const [minLng, minLat, maxLng, maxLat] = parts;
      if (minLng >= maxLng || minLat >= maxLat) {
        throw httpErrors.invalidPayload("bbox min must be < max for both axes");
      }
      return { minLng, minLat, maxLng, maxLat };
    }),
});

export type RoadQuery = z.infer<typeof roadQuerySchema>;

export async function roadOverlays(input: RoadQuery): Promise<FeatureCollection> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  let q = baseSelect(db).orderBy("roads.last_status_update", "desc").limit(200);

  if (input.status) q = q.where("roads.status", "=", input.status);
  if (input.region_id) q = q.where("roads.region_id", "=", input.region_id);
  if (input.bbox) {
    const { minLng, minLat, maxLng, maxLat } = input.bbox;
    q = q.where(
      sql<SqlBool>`ST_Intersects(ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326),
        "roads"."geometry")`,
    );
  }

  const rows = (await q.execute()) as unknown as Record<string, unknown>[];
  return {
    type: "FeatureCollection",
    features: rows
      .filter((r) => r.feature_geometry != null)
      .map((r) => {
        const record = mapRow(r);
        return {
          type: "Feature",
          id: record.id,
          geometry: JSON.parse(r.feature_geometry as string),
          properties: {
            road_name: record.name,
            road_type: record.road_type,
            condition: record.condition,
            flood_risk: record.flood_risk,
            water_depth_cm: record.metadata && typeof record.metadata === "object"
              ? (record.metadata as Record<string, unknown>).water_depth_cm
              : undefined,
            blockage_level: record.blockage_level,
            blockage_reason: record.blockage_reason,
            length_km: record.length_km,
            speed_limit_kmh: record.speed_limit_kmh,
            current_speed_kmh: record.current_speed_kmh,
            connects_hospital: record.connects_hospital,
            connects_shelter: record.connects_shelter,
          },
        };
      }),
  };
}

export const updateRoadSchema = z.object({
  status: z.enum(ROAD_STATUSES).optional(),
  blockage_level: z.number().min(0).max(1).optional(),
  blockage_reason: z.string().max(255).nullable().optional(),
  current_speed_kmh: z.number().int().nonnegative().nullable().optional(),
  speed_limit_kmh: z.number().int().positive().nullable().optional(),
  length_km: z.number().nonnegative().max(9999.999).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type UpdateRoadInput = z.infer<typeof updateRoadSchema>;

export async function getRoadById(id: string): Promise<RoadRecord | null> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");
  const row = await baseSelect(db).where("roads.id", "=", id).executeTakeFirst();
  return row ? mapRow(row) : null;
}

export async function updateRoad(
  id: string,
  input: UpdateRoadInput,
  ctx: AuditContext,
): Promise<RoadRecord | null> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");
  const existing = await getRoadById(id);
  if (!existing) return null;

  const values: Record<string, unknown> = touch({
    last_status_update: new Date(),
  });
  if (input.status !== undefined) values.status = input.status;
  if (input.blockage_level !== undefined) values.blockage_level = input.blockage_level;
  if (input.blockage_reason !== undefined) values.blockage_reason = input.blockage_reason;
  if (input.current_speed_kmh !== undefined) values.current_speed_kmh = input.current_speed_kmh;
  if (input.speed_limit_kmh !== undefined) values.speed_limit_kmh = input.speed_limit_kmh;
  if (input.length_km !== undefined) values.length_km = input.length_km;
  if (input.metadata !== undefined) values.metadata = input.metadata as unknown as JsonValue;

  try {
    await db.updateTable("roads").set(values as never).where("roads.id", "=", id).execute();
  } catch (error) {
    logger.error({ err: error }, "update road failed");
    throw error;
  }

  const record = await getRoadById(id);
  if (record) {
    await audit(ctx, "ROAD_STATUS_UPDATE", "road", id, {
      status: existing.status,
      condition: existing.condition,
    }, {
      status: record.status,
      condition: record.condition,
    });
  }
  return record;
}