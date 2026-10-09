import { sql } from "kysely";
import { z } from "zod";
import { getDb } from "@/server/db";
import { httpErrors } from "@/server/core/errors";
import { audit, type AuditContext } from "@/server/core/audit";
import { logger } from "@/server/logger";
import type {
  AlertType,
  AlertAudience,
  AlertStatus,
  Severity,
  JsonValue,
} from "@/server/db/types";

export const ALERT_TYPES = [
  "hazard_warning",
  "risk_escalation",
  "evacuation_order",
  "resource_shortage",
  "shelter_overflow",
  "road_closure",
  "hospital_isolation",
  "sos_hotspot",
  "system",
] as const;

export const ALERT_AUDIENCES = ["authority", "citizen", "all"] as const;

export const ALERT_STATUSES = ["active", "acknowledged", "resolved", "expired"] as const;

export const BROADCAST_CHANNELS = ["sms", "whatsapp", "in_app_push", "siren", "email", "tv", "radio"] as const;

export type AlertRecord = {
  id: string;
  disaster_id: string | null;
  disaster_name: string | null;
  type: AlertType;
  severity: Severity;
  title: string;
  message: string;
  target_audience: AlertAudience;
  target_region_id: string | null;
  target_area: unknown;
  status: AlertStatus;
  auto_generated: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | Date | null;
  expires_at: string | Date | null;
  metadata: unknown;
  created_at: string | Date;
};

const geojsonAreaSchema = z.object({
  type: z.enum(["Polygon", "MultiPolygon"]),
  coordinates: z.array(z.unknown()).min(1),
});

function areaExpr(value: string | { type: "Polygon" | "MultiPolygon"; coordinates: unknown[] }): ReturnType<typeof sql> | null {
  if (typeof value === "string") return sql`ST_Multi(ST_GeomFromText(${value}, 4326))`;
  return sql`ST_Multi(ST_GeomFromGeoJSON(${JSON.stringify(value)}::jsonb))`;
}

function isGeometryError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const code = (error as { code?: string }).code;
  return ["22023", "22024", "22P02", "XX000"].includes(code ?? "");
}

export const createAlertSchema = z.object({
  disaster_id: z.uuid().nullable().optional(),
  type: z.enum(ALERT_TYPES).default("hazard_warning"),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  title: z.string().trim().min(1).max(255),
  message: z.string().trim().min(1).max(10_000),
  target_audience: z.enum(ALERT_AUDIENCES).default("all"),
  target_region_id: z.uuid().nullable().optional(),
  target_area: z.union([z.string().min(1), geojsonAreaSchema]).optional(),
  expires_at: z.iso.datetime().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;

export const updateAlertSchema = createAlertSchema.partial().extend({
  status: z.enum(ALERT_STATUSES).optional(),
});

export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;

export const broadcastAlertSchema = z.object({
  disaster_id: z.uuid().nullable().optional(),
  title: z.string().trim().min(1).max(255),
  severity: z.enum(["low", "medium", "high", "critical"]),
  message: z.string().trim().min(1).max(10_000).optional(),
  channels: z.array(z.enum(BROADCAST_CHANNELS)).max(20).default([]),
  target_geofence: geojsonAreaSchema.optional(),
  target_region_id: z.uuid().nullable().optional(),
  target_audience: z.enum(ALERT_AUDIENCES).default("all"),
  message_templates: z.record(z.string(), z.string().max(10_000)).default({}),
  expires_at: z.iso.datetime().nullable().optional(),
});

export type BroadcastAlertInput = z.infer<typeof broadcastAlertSchema>;

type AlertRow = Record<string, unknown>;

function mapRow(row: AlertRow): AlertRecord {
  return {
    id: row.id as string,
    disaster_id: (row.disaster_id as string) ?? null,
    disaster_name: (row.disaster_name as string) ?? null,
    type: row.type as AlertType,
    severity: row.severity as Severity,
    title: row.title as string,
    message: row.message as string,
    target_audience: row.target_audience as AlertAudience,
    target_region_id: (row.target_region_id as string) ?? null,
    target_area:
      typeof row.target_area === "string" ? JSON.parse(row.target_area) : (row.target_area ?? null),
    status: row.status as AlertStatus,
    auto_generated: Boolean(row.auto_generated),
    acknowledged_by: (row.acknowledged_by as string) ?? null,
    acknowledged_at: (row.acknowledged_at as string | Date) ?? null,
    expires_at: (row.expires_at as string | Date) ?? null,
    metadata: (row.metadata ?? {}) as unknown,
    created_at: row.created_at as string | Date,
  };
}

function baseSelect(db: NonNullable<ReturnType<typeof getDb>>) {
  return db
    .selectFrom("alerts")
    .leftJoin("disasters", "disasters.id", "alerts.disaster_id")
    .select([
      "alerts.id",
      "alerts.disaster_id",
      "disasters.name as disaster_name",
      "alerts.type",
      "alerts.severity",
      "alerts.title",
      "alerts.message",
      "alerts.target_audience",
      "alerts.target_region_id",
      "alerts.status",
      "alerts.auto_generated",
      "alerts.acknowledged_by",
      "alerts.acknowledged_at",
      "alerts.expires_at",
      "alerts.metadata",
      "alerts.created_at",
      sql<unknown>`ST_AsGeoJSON(alerts.target_area)::text`.as("target_area"),
    ]);
}

export async function listAlerts(input: {
  status?: AlertStatus;
  severity?: Severity;
  disasterId?: string;
  page: number;
  limit: number;
}) {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  let count = db
    .selectFrom("alerts")
    .select((eb) => eb.fn.countAll().as("total"));

  let q = baseSelect(db).orderBy("alerts.created_at", "desc").offset((input.page - 1) * input.limit).limit(input.limit);

  if (input.status) {
    count = count.where("alerts.status", "=", input.status);
    q = q.where("alerts.status", "=", input.status);
  }
  if (input.severity) {
    count = count.where("alerts.severity", "=", input.severity);
    q = q.where("alerts.severity", "=", input.severity);
  }
  if (input.disasterId) {
    count = count.where("alerts.disaster_id", "=", input.disasterId);
    q = q.where("alerts.disaster_id", "=", input.disasterId);
  }

  const [total, rows] = await Promise.all([count.executeTakeFirst(), q.execute()]);
  return { items: rows.map(mapRow), total_records: Number(total?.total ?? 0) };
}

export async function getAlertById(id: string): Promise<AlertRecord | null> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");
  const row = await baseSelect(db).where("alerts.id", "=", id).executeTakeFirst();
  return row ? mapRow(row) : null;
}

export async function createAlert(input: CreateAlertInput, ctx: AuditContext): Promise<AlertRecord> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");
  try {
    const inserted = await db
      .insertInto("alerts")
      .values({
        disaster_id: input.disaster_id ?? null,
        type: input.type,
        severity: input.severity,
        title: input.title,
        message: input.message,
        target_audience: input.target_audience,
        target_region_id: input.target_region_id ?? null,
        target_area: (input.target_area ? areaExpr(input.target_area) : null) as unknown as string,
        status: "active",
        auto_generated: false,
        expires_at: input.expires_at != null ? new Date(input.expires_at) : null,
        metadata: input.metadata as unknown as JsonValue,
      })
      .returning(["id", "created_at"])
      .executeTakeFirstOrThrow();

    const record = await getAlertById(inserted.id);
    if (!record) throw httpErrors.internal("alert created but could not be read back");
    await audit(ctx, "ALERT_CREATE", "alert", record.id, null, {
      title: record.title,
      severity: record.severity,
      type: record.type,
      status: record.status,
    });
    return record;
  } catch (error) {
    if (isGeometryError(error)) throw httpErrors.invalidGeometry();
    logger.error({ err: error }, "create alert failed");
    throw error;
  }
}

export async function updateAlert(
  id: string,
  input: UpdateAlertInput,
  ctx: AuditContext,
): Promise<AlertRecord | null> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const existing = await getAlertById(id);
  if (!existing) return null;

  const values: Record<string, unknown> = {};
  if (input.status !== undefined) values.status = input.status;
  if (input.type !== undefined) values.type = input.type;
  if (input.severity !== undefined) values.severity = input.severity;
  if (input.title !== undefined) values.title = input.title;
  if (input.message !== undefined) values.message = input.message;
  if (input.target_audience !== undefined) values.target_audience = input.target_audience;
  if (input.target_region_id !== undefined) values.target_region_id = input.target_region_id;
  if (input.expires_at !== undefined) values.expires_at = input.expires_at ? new Date(input.expires_at) : null;
  if (input.metadata !== undefined) values.metadata = input.metadata as unknown as JsonValue;
  if (input.target_area !== undefined) values.target_area = (input.target_area ? areaExpr(input.target_area) : null) as unknown as string;

  try {
    await db.updateTable("alerts").set(values as never).where("alerts.id", "=", id).execute();
  } catch (error) {
    if (isGeometryError(error)) throw httpErrors.invalidGeometry();
    throw error;
  }

  const record = await getAlertById(id);
  if (record) {
    await audit(ctx, "ALERT_UPDATE", "alert", id, {
      title: existing.title,
      severity: existing.severity,
      status: existing.status,
    }, {
      title: record.title,
      severity: record.severity,
      status: record.status,
    });
  }
  return record;
}

export async function acknowledgeAlert(id: string, ctx: AuditContext): Promise<AlertRecord | null> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const existing = await getAlertById(id);
  if (!existing) return null;

  await db
    .updateTable("alerts")
    .set({
      acknowledged_by: ctx.actorId ?? null,
      acknowledged_at: new Date(),
      status: existing.status === "active" ? "acknowledged" : existing.status,
    })
    .where("alerts.id", "=", id)
    .execute();

  const record = await getAlertById(id);
  if (record) {
    await audit(ctx, "ALERT_ACKNOWLEDGE", "alert", id, {
      status: existing.status,
      acknowledged_by: existing.acknowledged_by,
    }, {
      status: record.status,
      acknowledged_by: record.acknowledged_by,
    });
  }
  return record;
}

export async function broadcastAlert(input: BroadcastAlertInput, ctx: AuditContext): Promise<AlertRecord> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const message =
    input.message ?? (typeof input.message_templates.en === "string" ? input.message_templates.en : "").trim();

  const metadata: Record<string, unknown> = {};
  if (input.channels.length > 0) metadata.channels = input.channels;
  if (Object.keys(input.message_templates).length > 0) {
    metadata.message_templates = input.message_templates;
  }

  try {
    const inserted = await db
      .insertInto("alerts")
      .values({
        disaster_id: input.disaster_id ?? null,
        type: "hazard_warning",
        severity: input.severity,
        title: input.title,
        message,
        target_audience: input.target_audience,
        target_region_id: input.target_region_id ?? null,
        target_area: (input.target_geofence ? areaExpr(input.target_geofence) : null) as unknown as string,
        status: "active",
        auto_generated: true,
        expires_at: input.expires_at != null ? new Date(input.expires_at) : null,
        metadata: metadata as unknown as JsonValue,
      })
      .returning(["id", "created_at"])
      .executeTakeFirstOrThrow();

    const record = await getAlertById(inserted.id);
    if (!record) throw httpErrors.internal("alert broadcast could not be read back");
    await audit(ctx, "ALERT_BROADCAST", "alert", record.id, null, {
      title: record.title,
      severity: record.severity,
      channels: input.channels,
      locale_count: Object.keys(input.message_templates).length,
    });
    return record;
  } catch (error) {
    if (isGeometryError(error)) throw httpErrors.invalidGeometry();
    logger.error({ err: error }, "broadcast alert failed");
    throw error;
  }
}