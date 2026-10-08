import { sql } from "kysely";
import { z } from "zod";
import { getDb } from "@/server/db";
import { httpErrors } from "@/server/core/errors";
import { audit, type AuditContext } from "@/server/core/audit";
import { logger } from "@/server/logger";
import { touch } from "@/server/db/updates";
import type { HospitalType, Accessibility, Severity, JsonValue } from "@/server/db/types";

export const HOSPITAL_TYPES = [
  "government",
  "private",
  "phc",
  "chc",
  "district",
  "medical_college",
] as const;

export const EMERGENCY_STATUSES = ["normal", "busy", "critical", "full", "overflow"] as const;

export const ACCESSIBILITIES = ["accessible", "limited", "inaccessible"] as const;

export const SEVERITIES = ["low", "medium", "high", "critical"] as const;

export type HospitalRecord = {
  id: string;
  name: string;
  type: HospitalType;
  coordinates: { lat: number; lng: number } | null;
  address: string | null;
  region_id: string | null;
  bed_capacity: number;
  icu_capacity: number;
  current_occupancy: number;
  available_beds: number;
  emergency_status: string;
  accessibility: Accessibility;
  isolation_risk: Severity | null;
  has_emergency_dept: boolean;
  has_ambulance: boolean;
  specialties: unknown;
  contact_phone: string | null;
  metadata: unknown;
  created_at: string | Date;
  updated_at: string | Date;
};

const pointSchema = z.union([
  z.object({ lat: z.number(), lng: z.number() }),
  z.tuple([z.number(), z.number()]),
  z.object({ type: z.literal("Point"), coordinates: z.tuple([z.number(), z.number()]) }),
]);

export const createHospitalSchema = z.object({
  name: z.string().trim().min(1).max(255),
  type: z.enum(HOSPITAL_TYPES),
  location: pointSchema,
  address: z.string().max(1000).nullish(),
  region_id: z.uuid().nullish(),
  bed_capacity: z.number().int().positive().max(10_000),
  icu_capacity: z.number().int().nonnegative().default(0),
  current_occupancy: z.number().int().nonnegative().default(0),
  emergency_status: z.enum(EMERGENCY_STATUSES).default("normal"),
  accessibility: z.enum(ACCESSIBILITIES).default("accessible"),
  isolation_risk: z.enum(SEVERITIES).nullish(),
  has_emergency_dept: z.boolean().default(true),
  has_ambulance: z.boolean().default(false),
  specialties: z.array(z.string()).default([]),
  contact_phone: z.string().max(20).nullish(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type CreateHospitalInput = z.infer<typeof createHospitalSchema>;

export const updateHospitalSchema = createHospitalSchema.partial();

export type UpdateHospitalInput = z.infer<typeof updateHospitalSchema>;

const HOSPITAL_FIELDS = [
  "hospitals.id",
  "hospitals.name",
  "hospitals.type",
  "hospitals.address",
  "hospitals.region_id",
  "hospitals.bed_capacity",
  "hospitals.icu_capacity",
  "hospitals.current_occupancy",
  "hospitals.emergency_status",
  "hospitals.accessibility",
  "hospitals.isolation_risk",
  "hospitals.has_emergency_dept",
  "hospitals.has_ambulance",
  "hospitals.specialties",
  "hospitals.contact_phone",
  "hospitals.metadata",
  "hospitals.created_at",
  "hospitals.updated_at",
] as const;

function baseSelect(db: NonNullable<ReturnType<typeof getDb>>) {
  return db.selectFrom("hospitals").select([
    ...HOSPITAL_FIELDS,
    sql<unknown>`ST_Y(hospitals.location)`.as("lat"),
    sql<unknown>`ST_X(hospitals.location)`.as("lng"),
  ]);
}

function pointSql(value: CreateHospitalInput["location"]): ReturnType<typeof sql> {
  if ("lat" in value && "lng" in value) {
    return sql`ST_SetSRID(ST_MakePoint(${value.lng}, ${value.lat}), 4326)`;
  }
  if (Array.isArray(value)) {
    const [lng, lat] = value;
    return sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`;
  }
  return sql`ST_GeomFromGeoJSON(${JSON.stringify(value)}::jsonb)`;
}

function mapRow(row: Record<string, unknown>): HospitalRecord {
  const lat = row.lat as number | undefined;
  const lng = row.lng as number | undefined;
  const bedCapacity = Number(row.bed_capacity ?? 0);
  const currentOccupancy = Number(row.current_occupancy ?? 0);
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as HospitalType,
    coordinates: lat != null && lng != null ? { lat, lng } : null,
    address: (row.address as string) ?? null,
    region_id: (row.region_id as string) ?? null,
    bed_capacity: bedCapacity,
    icu_capacity: Number(row.icu_capacity ?? 0),
    current_occupancy: currentOccupancy,
    available_beds: Math.max(bedCapacity - currentOccupancy, 0),
    emergency_status: (row.emergency_status as string) ?? "normal",
    accessibility: row.accessibility as Accessibility,
    isolation_risk: (row.isolation_risk as Severity | null) ?? null,
    has_emergency_dept: Boolean(row.has_emergency_dept),
    has_ambulance: Boolean(row.has_ambulance),
    specialties: Array.isArray(row.specialties) ? row.specialties : [],
    contact_phone: (row.contact_phone as string) ?? null,
    metadata: (row.metadata ?? {}) as unknown,
    created_at: row.created_at as string | Date,
    updated_at: row.updated_at as string | Date,
  };
}

export async function listHospitals(input: {
  emergencyStatus?: string;
  type?: HospitalType;
  regionId?: string;
  page: number;
  limit: number;
}) {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  let count = db.selectFrom("hospitals").select((eb) => eb.fn.countAll().as("total"));
  let q = baseSelect(db).orderBy("hospitals.created_at", "desc").offset((input.page - 1) * input.limit).limit(input.limit);

  if (input.emergencyStatus) {
    count = count.where("hospitals.emergency_status", "=", input.emergencyStatus);
    q = q.where("hospitals.emergency_status", "=", input.emergencyStatus);
  }
  if (input.type) {
    count = count.where("hospitals.type", "=", input.type);
    q = q.where("hospitals.type", "=", input.type);
  }
  if (input.regionId) {
    count = count.where("hospitals.region_id", "=", input.regionId);
    q = q.where("hospitals.region_id", "=", input.regionId);
  }

  const [total, rows] = await Promise.all([count.executeTakeFirst(), q.execute()]);
  return { items: rows.map(mapRow), total_records: Number(total?.total ?? 0) };
}

export async function getHospitalById(id: string): Promise<HospitalRecord | null> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");
  const row = await baseSelect(db).where("hospitals.id", "=", id).executeTakeFirst();
  return row ? mapRow(row) : null;
}

export async function createHospital(input: CreateHospitalInput, ctx: AuditContext): Promise<HospitalRecord> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  try {
    const inserted = await db
      .insertInto("hospitals")
      .values({
        name: input.name,
        type: input.type,
        location: pointSql(input.location) as unknown as string,
        address: input.address ?? null,
        region_id: input.region_id ?? null,
        bed_capacity: input.bed_capacity,
        icu_capacity: input.icu_capacity,
        current_occupancy: input.current_occupancy,
        emergency_status: input.emergency_status,
        accessibility: input.accessibility,
        isolation_risk: input.isolation_risk ?? null,
        has_emergency_dept: input.has_emergency_dept,
        has_ambulance: input.has_ambulance,
        specialties: input.specialties as unknown as JsonValue,
        contact_phone: input.contact_phone ?? null,
        metadata: input.metadata as unknown as JsonValue,
      })
      .returning(["id", "created_at"])
      .executeTakeFirstOrThrow();

    const record = await getHospitalById(inserted.id);
    if (!record) throw httpErrors.internal("hospital created but could not be read back");
    await audit(ctx, "HOSPITAL_CREATE", "hospital", record.id, null, {
      name: record.name,
      type: record.type,
      emergency_status: record.emergency_status,
    });
    return record;
  } catch (error) {
    logger.error({ err: error }, "create hospital failed");
    throw error;
  }
}

export async function updateHospital(
  id: string,
  input: UpdateHospitalInput,
  ctx: AuditContext,
): Promise<HospitalRecord | null> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");
  const existing = await getHospitalById(id);
  if (!existing) return null;

  const values: Record<string, unknown> = touch({});
  if (input.name !== undefined) values.name = input.name;
  if (input.type !== undefined) values.type = input.type;
  if (input.location !== undefined) values.location = pointSql(input.location) as unknown as string;
  if (input.address !== undefined) values.address = input.address;
  if (input.region_id !== undefined) values.region_id = input.region_id;
  if (input.bed_capacity !== undefined) values.bed_capacity = input.bed_capacity;
  if (input.icu_capacity !== undefined) values.icu_capacity = input.icu_capacity;
  if (input.current_occupancy !== undefined) values.current_occupancy = input.current_occupancy;
  if (input.emergency_status !== undefined) values.emergency_status = input.emergency_status;
  if (input.accessibility !== undefined) values.accessibility = input.accessibility;
  if (input.isolation_risk !== undefined) values.isolation_risk = input.isolation_risk;
  if (input.has_emergency_dept !== undefined) values.has_emergency_dept = input.has_emergency_dept;
  if (input.has_ambulance !== undefined) values.has_ambulance = input.has_ambulance;
  if (input.specialties !== undefined) values.specialties = input.specialties as unknown as JsonValue;
  if (input.contact_phone !== undefined) values.contact_phone = input.contact_phone;
  if (input.metadata !== undefined) values.metadata = input.metadata as unknown as JsonValue;

  try {
    await db.updateTable("hospitals").set(values as never).where("hospitals.id", "=", id).execute();
  } catch (error) {
    logger.error({ err: error }, "update hospital failed");
    throw error;
  }

  const record = await getHospitalById(id);
  if (record) {
    await audit(ctx, "HOSPITAL_UPDATE", "hospital", id, {
      name: existing.name,
      emergency_status: existing.emergency_status,
    }, {
      name: record.name,
      emergency_status: record.emergency_status,
    });
  }
  return record;
}