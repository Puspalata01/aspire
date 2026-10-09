import { sql } from "kysely";
import { z } from "zod";
import { getDb } from "@/server/db";
import { httpErrors } from "@/server/core/errors";
import { audit, type AuditContext } from "@/server/core/audit";
import { touch } from "@/server/db/updates";
import type { SosType, SosStatus, Severity, JsonValue } from "@/server/db/types";

export const SOS_TYPES = ["rescue", "food", "water", "medicine", "shelter", "medical_emergency", "other"] as const;

export const SOS_STATUSES = ["received", "verified", "assigned", "in_progress", "resolved", "rejected", "duplicate"] as const;

export const SEVERITIES = ["low", "medium", "high", "critical"] as const;

export type SosRecord = {
  id: string;
  user_id: string;
  location: { lat: number; lng: number } | null;
  request_type: SosType;
  urgency: Severity;
  priority_score: number | null;
  people_count: number;
  description: string | null;
  media_urls: unknown[];
  status: SosStatus;
  cluster_id: string | null;
  assigned_resource_id: string | null;
  disaster_id: string | null;
  region_id: string | null;
  is_duplicate: boolean;
  duplicate_of: string | null;
  assigned_by: string | null;
  resolved_by: string | null;
  resolved_at: string | Date | null;
  resolution_notes: string | null;
  response_time_min: number | null;
  created_at: string | Date;
  updated_at: string | Date;
};

export const createSosSchema = z.object({
  latitude: z.number().refine((v) => v >= -90 && v <= 90, "Invalid latitude"),
  longitude: z.number().refine((v) => v >= -180 && v <= 180, "Invalid longitude"),
  request_type: z.enum(SOS_TYPES),
  urgency: z.enum(SEVERITIES),
  people_count: z.number().int().positive().default(1),
  special_needs: z.string().array().default([]),
  contact_phone: z.string().max(20).nullish(),
  description: z.string().max(2000).nullish(),
  media_urls: z.string().url().array().default([]),
});

export type CreateSosInput = z.infer<typeof createSosSchema>;

export const updateSosStatusSchema = z.object({
  status: z.enum(SOS_STATUSES),
});

export type UpdateSosStatusInput = z.infer<typeof updateSosStatusSchema>;

const SOS_FIELDS = [
  "sos_reports.id",
  "sos_reports.user_id",
  "sos_reports.request_type",
  "sos_reports.urgency",
  "sos_reports.priority_score",
  "sos_reports.people_count",
  "sos_reports.description",
  "sos_reports.media_urls",
  "sos_reports.status",
  "sos_reports.cluster_id",
  "sos_reports.assigned_resource_id",
  "sos_reports.disaster_id",
  "sos_reports.region_id",
  "sos_reports.is_duplicate",
  "sos_reports.duplicate_of",
  "sos_reports.assigned_by",
  "sos_reports.resolved_by",
  "sos_reports.resolved_at",
  "sos_reports.resolution_notes",
  "sos_reports.response_time_min",
  "sos_reports.created_at",
  "sos_reports.updated_at",
] as const;

function baseSelect(db: NonNullable<ReturnType<typeof getDb>>) {
  return db.selectFrom("sos_reports").select([
    ...SOS_FIELDS,
    sql<unknown>`ST_Y(sos_reports.location)`.as("lat"),
    sql<unknown>`ST_X(sos_reports.location)`.as("lng"),
  ]);
}

function mapRow(row: Record<string, unknown>): SosRecord {
  const lat = row.lat as number | undefined;
  const lng = row.lng as number | undefined;
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    location: lat != null && lng != null ? { lat, lng } : null,
    request_type: row.request_type as SosType,
    urgency: row.urgency as Severity,
    priority_score: (row.priority_score as number) ?? null,
    people_count: Number(row.people_count ?? 1),
    description: (row.description as string) ?? null,
    media_urls: ((row.media_urls as unknown[]) ?? []) as unknown[],
    status: row.status as SosStatus,
    cluster_id: (row.cluster_id as string) ?? null,
    assigned_resource_id: (row.assigned_resource_id as string) ?? null,
    disaster_id: (row.disaster_id as string) ?? null,
    region_id: (row.region_id as string) ?? null,
    is_duplicate: Boolean(row.is_duplicate),
    duplicate_of: (row.duplicate_of as string) ?? null,
    assigned_by: (row.assigned_by as string) ?? null,
    resolved_by: (row.resolved_by as string) ?? null,
    resolved_at: (row.resolved_at as string | Date) ?? null,
    resolution_notes: (row.resolution_notes as string) ?? null,
    response_time_min: (row.response_time_min as number) ?? null,
    created_at: row.created_at as string | Date,
    updated_at: row.updated_at as string | Date,
  };
}

const URGENCY_WEIGHT: Record<Severity, number> = {
  critical: 0.95,
  high: 0.75,
  medium: 0.5,
  low: 0.25,
};

const CLUSTER_SEARCH_RADIUS_KM = 2;

export async function createSos(input: CreateSosInput, userId: string, ctx: AuditContext): Promise<SosRecord & { tracking_token: string; nearest_depot_km: number | null; estimated_contact_min: number }> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const locPoint = sql`ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)`;
  const priorityScore = parseFloat(
    (URGENCY_WEIGHT[input.urgency] * Math.min(input.people_count / 10, 1.0)).toFixed(4),
  );

  // Find or create cluster
  const existingCluster = await db
    .selectFrom("sos_clusters")
    .selectAll()
    .where(
      sql`ST_DWithin(sos_clusters.centroid, ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326), ${CLUSTER_SEARCH_RADIUS_KM * 1000})`,
      "=",
      true,
    )
    .orderBy(sql`ST_Distance(sos_clusters.centroid, ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326))`)
    .executeTakeFirst();

  let clusterId = existingCluster?.id;

  if (!clusterId) {
    const newCluster = await db
      .insertInto("sos_clusters")
      .values({
        centroid: locPoint as unknown as string,
        convex_hull: null,
        report_count: 1,
        dominant_request_type: input.request_type,
        avg_urgency_score: priorityScore,
        priority_score: priorityScore,
        radius_km: 0.5,
        is_hotspot: false,
        status: "active",
        recommended_resources: sql`'[]'::jsonb` as unknown as JsonValue,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    clusterId = newCluster.id;
  } else {
    // Update cluster report count
    await db
      .updateTable("sos_clusters")
      .set({
        report_count: sql`report_count + 1`,
        avg_urgency_score: sql`(avg_urgency_score + ${priorityScore}) / 2`,
        updated_at: sql`NOW()`,
      })
      .where("sos_clusters.id", "=", clusterId)
      .execute();
  }

  // Find nearest resource depot
  const nearestDepot = await db
    .selectFrom("resources")
    .select([sql<number>`ROUND((ST_Distance(geography(resources.location), geography(ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326))) / 1000)::numeric, 2)::float8`.as("distance_km")])
    .where("resources.status", "=", "available")
    .orderBy(sql`ST_Distance(geography(resources.location), geography(ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)))`)
    .limit(1)
    .executeTakeFirst();

  const nearestDepotKm = nearestDepot?.distance_km ?? null;
  const estimatedContactMin = nearestDepotKm
    ? Math.min(Math.round(10 + (nearestDepotKm / 3.5) * 60), 60)
    : 15;

  const metadataObj = {
    contact_phone: input.contact_phone ?? null,
    special_needs: input.special_needs,
  };

  const inserted = await db
    .insertInto("sos_reports")
    .values({
      user_id: userId,
      location: locPoint as unknown as string,
      request_type: input.request_type,
      urgency: input.urgency,
      priority_score: priorityScore,
      people_count: input.people_count,
      description: input.description ?? null,
      media_urls: input.media_urls as unknown as JsonValue,
      status: "received",
      cluster_id: clusterId,
      disaster_id: null,
      region_id: null,
      metadata: JSON.stringify(metadataObj) as unknown as JsonValue,
    })
    .returning(["id", "created_at"])
    .executeTakeFirstOrThrow();

  const record = await getSosById(inserted.id);
  if (!record) throw httpErrors.internal("SOS created but could not be read back");

  const trackingToken = `trk_${userId.substring(0, 8)}_${inserted.id.substring(0, 8)}`;

  await audit(ctx, "SOS_CREATE", "sos_report", record.id, null, {
    request_type: record.request_type,
    urgency: record.urgency,
    people_count: record.people_count,
    priority_score: record.priority_score,
    cluster_id: clusterId,
  });

  return {
    ...record,
    tracking_token: trackingToken,
    nearest_depot_km: nearestDepotKm ?? 0,
    estimated_contact_min: estimatedContactMin,
  };
}

export async function listSos(input: {
  status?: SosStatus;
  urgency?: Severity;
  requestType?: SosType;
  disasterId?: string;
  page: number;
  limit: number;
}) {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  let count = db.selectFrom("sos_reports").select((eb) => eb.fn.countAll().as("total"));
  let q = baseSelect(db)
    .orderBy("sos_reports.created_at", "desc")
    .offset((input.page - 1) * input.limit)
    .limit(input.limit);

  if (input.status) {
    count = count.where("sos_reports.status", "=", input.status);
    q = q.where("sos_reports.status", "=", input.status);
  }
  if (input.urgency) {
    count = count.where("sos_reports.urgency", "=", input.urgency);
    q = q.where("sos_reports.urgency", "=", input.urgency);
  }
  if (input.requestType) {
    count = count.where("sos_reports.request_type", "=", input.requestType);
    q = q.where("sos_reports.request_type", "=", input.requestType);
  }
  if (input.disasterId) {
    count = count.where("sos_reports.disaster_id", "=", input.disasterId);
    q = q.where("sos_reports.disaster_id", "=", input.disasterId);
  }

  const [total, rows] = await Promise.all([count.executeTakeFirst(), q.execute()]);
  return { items: rows.map(mapRow), total_records: Number(total?.total ?? 0) };
}

export async function getSosById(id: string): Promise<SosRecord | null> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");
  const row = await baseSelect(db).where("sos_reports.id", "=", id).executeTakeFirst();
  return row ? mapRow(row) : null;
}

// Status transition rules: received → verified, verified → assigned, assigned → in_progress, in_progress → resolved
// Also: any → rejected, any → duplicate
const STATUS_TRANSITIONS: Record<SosStatus, SosStatus[]> = {
  received: ["verified", "rejected", "duplicate"],
  verified: ["assigned", "rejected", "duplicate"],
  assigned: ["in_progress", "rejected"],
  in_progress: ["resolved", "rejected"],
  resolved: [],
  rejected: [],
  duplicate: [],
};

export async function updateSosStatus(
  id: string,
  newStatus: SosStatus,
  ctx: AuditContext,
): Promise<SosRecord | null> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const existing = await getSosById(id);
  if (!existing) return null;

  if (!STATUS_TRANSITIONS[existing.status].includes(newStatus)) {
    throw httpErrors.invalidPayload(
      `Cannot transition SOS from '${existing.status}' to '${newStatus}'`,
    );
  }

  const updates: Record<string, unknown> = touch({ status: newStatus });

  // Auto-assign resolved_at when transitioning to resolved
  if (newStatus === "resolved" && !existing.resolved_at) {
    updates.resolved_at = sql`NOW()`;
    if (existing.created_at instanceof Date) {
      const responseMinutes = Math.round(
        (Date.now() - existing.created_at.getTime()) / 60000,
      );
      updates.response_time_min = responseMinutes;
    }
  }

  await db.updateTable("sos_reports").set(updates as never).where("sos_reports.id", "=", id).execute();

  const record = await getSosById(id);
  if (record) {
    await audit(ctx, "SOS_STATUS_UPDATE", "sos_report", id, { status: existing.status }, { status: newStatus });
  }
  return record;
}