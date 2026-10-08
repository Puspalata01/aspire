import { sql } from "kysely";
import { z } from "zod";
import { getDb } from "@/server/db";
import { httpErrors } from "@/server/core/errors";
import { audit, type AuditContext } from "@/server/core/audit";
import type { ReportType, Severity, Verification, JsonValue } from "@/server/db/types";

export const REPORT_TYPES = [
  "flooding",
  "road_damage",
  "building_collapse",
  "fire",
  "power_outage",
  "water_supply_disruption",
  "landslide",
  "tree_fall",
  "stranded_people",
  "other",
] as const;

export const SEVERITIES = ["low", "medium", "high", "critical"] as const;

export const VERIFICATION_STATUSES = ["unverified", "verified", "disputed", "false_report"] as const;

export type CitizenReportRecord = {
  id: string;
  user_id: string;
  location: { lat: number; lng: number } | null;
  report_type: ReportType;
  severity: Severity;
  description: string;
  media_urls: unknown[];
  verification_status: Verification;
  verified_by: string | null;
  verified_at: string | Date | null;
  is_duplicate: boolean;
  upvote_count: number;
  disaster_id: string | null;
  region_id: string | null;
  metadata: unknown;
  created_at: string | Date;
};

export const createCitizenReportSchema = z.object({
  report_type: z.enum(REPORT_TYPES),
  latitude: z.number().refine((v) => v >= -90 && v <= 90, "Invalid latitude"),
  longitude: z.number().refine((v) => v >= -180 && v <= 180, "Invalid longitude"),
  severity_observed: z.enum(SEVERITIES),
  description: z.string().trim().min(1).max(2000),
  media_url: z.string().url().optional(),
});

export type CreateCitizenReportInput = z.infer<typeof createCitizenReportSchema>;

export const verifyCitizenReportSchema = z.object({
  verification_status: z.enum(VERIFICATION_STATUSES),
  notes: z.string().max(500).optional(),
});

export type VerifyCitizenReportInput = z.infer<typeof verifyCitizenReportSchema>;

const REPORT_FIELDS = [
  "citizen_reports.id",
  "citizen_reports.user_id",
  "citizen_reports.report_type",
  "citizen_reports.severity",
  "citizen_reports.description",
  "citizen_reports.media_urls",
  "citizen_reports.verification_status",
  "citizen_reports.verified_by",
  "citizen_reports.verified_at",
  "citizen_reports.is_duplicate",
  "citizen_reports.upvote_count",
  "citizen_reports.disaster_id",
  "citizen_reports.region_id",
  "citizen_reports.metadata",
  "citizen_reports.created_at",
] as const;

function baseSelect(db: NonNullable<ReturnType<typeof getDb>>) {
  return db.selectFrom("citizen_reports").select([
    ...REPORT_FIELDS,
    sql<unknown>`ST_Y(citizen_reports.location)`.as("lat"),
    sql<unknown>`ST_X(citizen_reports.location)`.as("lng"),
  ]);
}

function mapRow(row: Record<string, unknown>): CitizenReportRecord {
  const lat = row.lat as number | undefined;
  const lng = row.lng as number | undefined;
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    location: lat != null && lng != null ? { lat, lng } : null,
    report_type: row.report_type as ReportType,
    severity: row.severity as Severity,
    description: row.description as string,
    media_urls: ((row.media_urls as unknown[]) ?? []) as unknown[],
    verification_status: row.verification_status as Verification,
    verified_by: (row.verified_by as string) ?? null,
    verified_at: (row.verified_at as string | Date) ?? null,
    is_duplicate: Boolean(row.is_duplicate),
    upvote_count: Number(row.upvote_count ?? 0),
    disaster_id: (row.disaster_id as string) ?? null,
    region_id: (row.region_id as string) ?? null,
    metadata: (row.metadata ?? {}) as unknown,
    created_at: row.created_at as string | Date,
  };
}

export async function createCitizenReport(
  input: CreateCitizenReportInput,
  userId: string,
  ctx: AuditContext,
): Promise<CitizenReportRecord> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const locPoint = sql`ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)`;
  const mediaUrls = input.media_url ? [input.media_url] : [];

  const inserted = await db
    .insertInto("citizen_reports")
    .values({
      user_id: userId,
      location: locPoint as unknown as string,
      report_type: input.report_type,
      severity: input.severity_observed,
      description: input.description,
      media_urls: JSON.stringify(mediaUrls) as unknown as JsonValue,
      verification_status: "unverified",
      disaster_id: null,
      region_id: null,
      metadata: sql`'{}'::jsonb` as unknown as JsonValue,
    })
    .returning(["id", "created_at"])
    .executeTakeFirstOrThrow();

  const record = await getCitizenReportById(inserted.id);
  if (!record) throw httpErrors.internal("Citizen report created but could not be read back");

  await audit(ctx, "CITIZEN_REPORT_CREATE", "citizen_report", record.id, null, {
    report_type: record.report_type,
    severity: record.severity,
    verification_status: record.verification_status,
  });

  return record;
}

export async function listCitizenReports(input: {
  reportType?: ReportType;
  verificationStatus?: Verification;
  severity?: Severity;
  disasterId?: string;
  page: number;
  limit: number;
}) {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  let count = db.selectFrom("citizen_reports").select((eb) => eb.fn.countAll().as("total"));
  let q = baseSelect(db)
    .orderBy("citizen_reports.created_at", "desc")
    .offset((input.page - 1) * input.limit)
    .limit(input.limit);

  if (input.reportType) {
    count = count.where("citizen_reports.report_type", "=", input.reportType);
    q = q.where("citizen_reports.report_type", "=", input.reportType);
  }
  if (input.verificationStatus) {
    count = count.where("citizen_reports.verification_status", "=", input.verificationStatus);
    q = q.where("citizen_reports.verification_status", "=", input.verificationStatus);
  }
  if (input.severity) {
    count = count.where("citizen_reports.severity", "=", input.severity);
    q = q.where("citizen_reports.severity", "=", input.severity);
  }
  if (input.disasterId) {
    count = count.where("citizen_reports.disaster_id", "=", input.disasterId);
    q = q.where("citizen_reports.disaster_id", "=", input.disasterId);
  }

  const [total, rows] = await Promise.all([count.executeTakeFirst(), q.execute()]);
  return { items: rows.map(mapRow), total_records: Number(total?.total ?? 0) };
}

export async function getCitizenReportById(id: string): Promise<CitizenReportRecord | null> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");
  const row = await baseSelect(db).where("citizen_reports.id", "=", id).executeTakeFirst();
  return row ? mapRow(row) : null;
}

export async function verifyCitizenReport(
  id: string,
  input: VerifyCitizenReportInput,
  verifierId: string,
  ctx: AuditContext,
): Promise<CitizenReportRecord | null> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const existing = await getCitizenReportById(id);
  if (!existing) return null;

  const updates: Record<string, unknown> = {
    verification_status: input.verification_status,
    verified_by: verifierId,
    verified_at: sql`NOW()`,
  };

  if (input.notes) {
    updates.metadata = sql`jsonb_set(COALESCE(metadata, '{}'::jsonb), '{verification_notes}', ${JSON.stringify(input.notes)}::jsonb)` as unknown as JsonValue;
  }

  await db.updateTable("citizen_reports").set(updates as never).where("citizen_reports.id", "=", id).execute();

  const record = await getCitizenReportById(id);
  if (record) {
    await audit(
      ctx,
      "CITIZEN_REPORT_VERIFY",
      "citizen_report",
      id,
      { verification_status: existing.verification_status },
      { verification_status: input.verification_status },
    );
  }
  return record;
}