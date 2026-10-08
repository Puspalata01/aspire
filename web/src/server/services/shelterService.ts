import { sql, type SqlBool } from "kysely";
import { z } from "zod";
import { getDb } from "@/server/db";
import { httpErrors } from "@/server/core/errors";
import { audit, type AuditContext } from "@/server/core/audit";
import { logger } from "@/server/logger";
import { touch } from "@/server/db/updates";
import type { ShelterType, ShelterStatus, Accessibility, Severity, JsonValue } from "@/server/db/types";

export const SHELTER_TYPES = [
  "community_hall",
  "school",
  "stadium",
  "government_building",
  "religious_place",
  "temporary_camp",
  "other",
] as const;

export const SHELTER_STATUSES = ["open", "closed", "full", "damaged", "preparing"] as const;

export const ACCESSIBILITIES = ["accessible", "limited", "inaccessible"] as const;

export const SEVERITIES = ["low", "medium", "high", "critical"] as const;

export type ShelterRecord = {
  id: string;
  name: string;
  type: ShelterType;
  coordinates: { lat: number; lng: number } | null;
  address: string | null;
  region_id: string | null;
  capacity: number;
  current_occupancy: number;
  available_capacity: number;
  occupancy_rate: number;
  status: ShelterStatus;
  accessibility: Accessibility;
  amenities: unknown;
  contact_phone: string | null;
  contact_person: string | null;
  flood_risk: Severity | null;
  nearest_hospital_km: string | number | null;
  last_inspection_at: string | Date | null;
  metadata: unknown;
  created_at: string | Date;
  updated_at: string | Date;
};

export type ShelterListItem = ShelterRecord & { distance_km?: number };

const pointSchema = z.union([
  z.object({ lat: z.number(), lng: z.number() }),
  z.tuple([z.number(), z.number()]),
  z.object({ type: z.literal("Point"), coordinates: z.tuple([z.number(), z.number()]) }),
]);

export const createShelterSchema = z.object({
  name: z.string().trim().min(1).max(255),
  type: z.enum(SHELTER_TYPES),
  location: pointSchema,
  address: z.string().max(1000).nullish(),
  region_id: z.uuid().nullish(),
  capacity: z.number().int().positive().max(100_000),
  current_occupancy: z.number().int().nonnegative().max(100_000).default(0),
  status: z.enum(SHELTER_STATUSES).default("open"),
  accessibility: z.enum(ACCESSIBILITIES).default("accessible"),
  amenities: z.array(z.string()).default([]),
  contact_phone: z.string().max(20).nullish(),
  contact_person: z.string().max(255).nullish(),
  flood_risk: z.enum(SEVERITIES).nullish(),
  nearest_hospital_km: z.number().nonnegative().max(9999.99).nullish(),
  last_inspection_at: z.iso.datetime().nullish(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type CreateShelterInput = z.infer<typeof createShelterSchema>;

export const updateShelterSchema = createShelterSchema.partial();

export type UpdateShelterInput = z.infer<typeof updateShelterSchema>;

export const safeSearchSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  required_capacity: z.coerce.number().int().nonnegative().default(1),
  max_distance_km: z.coerce.number().positive().max(500).default(25),
});

export type SafeSearchInput = z.infer<typeof safeSearchSchema>;

function pointSql(value: CreateShelterInput["location"]): ReturnType<typeof sql> {
  if ("lat" in value && "lng" in value) {
    return sql`ST_SetSRID(ST_MakePoint(${value.lng}, ${value.lat}), 4326)`;
  }
  if (Array.isArray(value)) {
    const [lng, lat] = value;
    return sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`;
  }
  return sql`ST_GeomFromGeoJSON(${JSON.stringify(value)}::jsonb)`;
}

const SHELTER_FIELDS = [
  "shelters.id",
  "shelters.name",
  "shelters.type",
  "shelters.address",
  "shelters.region_id",
  "shelters.capacity",
  "shelters.current_occupancy",
  "shelters.status",
  "shelters.accessibility",
  "shelters.amenities",
  "shelters.contact_phone",
  "shelters.contact_person",
  "shelters.flood_risk",
  "shelters.nearest_hospital_km",
  "shelters.last_inspection_at",
  "shelters.metadata",
  "shelters.created_at",
  "shelters.updated_at",
] as const;

function baseSelect(db: NonNullable<ReturnType<typeof getDb>>) {
  return db.selectFrom("shelters").select([
    ...SHELTER_FIELDS,
    sql<unknown>`ST_Y(shelters.location)`.as("lat"),
    sql<unknown>`ST_X(shelters.location)`.as("lng"),
  ]);
}

function mapRow(row: Record<string, unknown>): ShelterRecord {
  let coordinates: ShelterRecord["coordinates"] = null;
  const lat = row.lat as number | undefined;
  const lng = row.lng as number | undefined;
  if (lat != null && lng != null) coordinates = { lat, lng };

  const capacity = Number(row.capacity ?? 0);
  const currentOccupancy = Number(row.current_occupancy ?? 0);
  const availableCapacity = Math.max(capacity - currentOccupancy, 0);

  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as ShelterType,
    coordinates,
    address: (row.address as string) ?? null,
    region_id: (row.region_id as string) ?? null,
    capacity,
    current_occupancy: currentOccupancy,
    available_capacity: availableCapacity,
    occupancy_rate: capacity > 0 ? Math.round((currentOccupancy / capacity) * 1000) / 1000 : 0,
    status: row.status as ShelterStatus,
    accessibility: row.accessibility as Accessibility,
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    contact_phone: (row.contact_phone as string) ?? null,
    contact_person: (row.contact_person as string) ?? null,
    flood_risk: (row.flood_risk as Severity | null) ?? null,
    nearest_hospital_km: (row.nearest_hospital_km as string | number) ?? null,
    last_inspection_at: (row.last_inspection_at as string | Date) ?? null,
    metadata: (row.metadata ?? {}) as unknown,
    created_at: row.created_at as string | Date,
    updated_at: row.updated_at as string | Date,
  };
}

const HA1 = 1, HA2 = 2, HA3 = 3, HA4 = 4;
function hazardRank(risk: Severity | null): number {
  if (risk === "low") return HA1;
  if (risk === "medium") return HA2;
  if (risk === "high") return HA3;
  if (risk === "critical") return HA4;
  return 0;
}
const HAZARD_LABEL = { 0: "SAFE", 1: "SAFE", 2: "CAUTION", 3: "RISKY", 4: "RISKY" } as const;

function hazardStatus(row: ShelterRecord): "SAFE" | "CAUTION" | "RISKY" {
  return HAZARD_LABEL[hazardRank(row.flood_risk) as keyof typeof HAZARD_LABEL];
}

export async function listShelters(input: {
  status?: ShelterStatus;
  type?: ShelterType;
  regionId?: string;
  page: number;
  limit: number;
}) {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  let count = db.selectFrom("shelters").select((eb) => eb.fn.countAll().as("total"));
  let q = baseSelect(db)
    .orderBy("shelters.created_at", "desc")
    .offset((input.page - 1) * input.limit)
    .limit(input.limit);

  if (input.status) {
    count = count.where("shelters.status", "=", input.status);
    q = q.where("shelters.status", "=", input.status);
  }
  if (input.type) {
    count = count.where("shelters.type", "=", input.type);
    q = q.where("shelters.type", "=", input.type);
  }
  if (input.regionId) {
    count = count.where("shelters.region_id", "=", input.regionId);
    q = q.where("shelters.region_id", "=", input.regionId);
  }

  const [total, rows] = await Promise.all([count.executeTakeFirst(), q.execute()]);
  return {
    items: rows.map(mapRow),
    total_records: Number(total?.total ?? 0),
  };
}

export async function getShelterById(id: string): Promise<ShelterRecord | null> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");
  const row = await baseSelect(db).where("shelters.id", "=", id).executeTakeFirst();
  return row ? mapRow(row) : null;
}

export async function createShelter(input: CreateShelterInput, ctx: AuditContext): Promise<ShelterRecord> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  try {
    const inserted = await db
      .insertInto("shelters")
      .values({
        name: input.name,
        type: input.type,
        location: pointSql(input.location) as unknown as string,
        address: input.address ?? null,
        region_id: input.region_id ?? null,
        capacity: input.capacity,
        current_occupancy: input.current_occupancy,
        status: input.status,
        accessibility: input.accessibility,
        amenities: input.amenities as unknown as JsonValue,
        contact_phone: input.contact_phone ?? null,
        contact_person: input.contact_person ?? null,
        flood_risk: input.flood_risk ?? null,
        nearest_hospital_km: input.nearest_hospital_km ?? null,
        last_inspection_at: input.last_inspection_at ? new Date(input.last_inspection_at) : null,
        metadata: input.metadata as unknown as JsonValue,
      })
      .returning(["id", "created_at"])
      .executeTakeFirstOrThrow();

    const record = await getShelterById(inserted.id);
    if (!record) throw httpErrors.internal("shelter created but could not be read back");
    await audit(ctx, "SHELTER_CREATE", "shelter", record.id, null, {
      name: record.name,
      type: record.type,
      capacity: record.capacity,
      status: record.status,
    });
    return record;
  } catch (error) {
    const err = error as { code?: string };
    if (["22023", "22024", "22P02", "XX000"].includes(err.code ?? "")) {
      throw httpErrors.invalidGeometry();
    }
    logger.error({ err: error }, "create shelter failed");
    throw error;
  }
}

export async function updateShelter(
  id: string,
  input: UpdateShelterInput,
  ctx: AuditContext,
): Promise<ShelterRecord | null> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");
  const existing = await getShelterById(id);
  if (!existing) return null;

  const values: Record<string, unknown> = touch({});
  if (input.name !== undefined) values.name = input.name;
  if (input.type !== undefined) values.type = input.type;
  if (input.location !== undefined) values.location = pointSql(input.location) as unknown as string;
  if (input.address !== undefined) values.address = input.address;
  if (input.region_id !== undefined) values.region_id = input.region_id;
  if (input.capacity !== undefined) values.capacity = input.capacity;
  if (input.current_occupancy !== undefined) values.current_occupancy = input.current_occupancy;
  if (input.status !== undefined) values.status = input.status;
  if (input.accessibility !== undefined) values.accessibility = input.accessibility;
  if (input.amenities !== undefined) values.amenities = input.amenities as unknown as JsonValue;
  if (input.contact_phone !== undefined) values.contact_phone = input.contact_phone;
  if (input.contact_person !== undefined) values.contact_person = input.contact_person;
  if (input.flood_risk !== undefined) values.flood_risk = input.flood_risk;
  if (input.nearest_hospital_km !== undefined) values.nearest_hospital_km = input.nearest_hospital_km;
  if (input.last_inspection_at !== undefined) {
    values.last_inspection_at = input.last_inspection_at ? new Date(input.last_inspection_at) : null;
  }
  if (input.metadata !== undefined) values.metadata = input.metadata as unknown as JsonValue;

  try {
    await db.updateTable("shelters").set(values as never).where("shelters.id", "=", id).execute();
  } catch (error) {
    const err = error as { code?: string };
    if (["22023", "22024", "22P02", "XX000"].includes(err.code ?? "")) {
      throw httpErrors.invalidGeometry();
    }
    throw error;
  }

  const record = await getShelterById(id);
  if (record) {
    await audit(ctx, "SHELTER_UPDATE", "shelter", id, {
      name: existing.name,
      status: existing.status,
      capacity: existing.capacity,
    }, {
      name: record.name,
      status: record.status,
      capacity: record.capacity,
    });
  }
  return record;
}

export async function safeSearchShelters(input: SafeSearchInput): Promise<ShelterListItem[]> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const rows = await db
    .selectFrom("shelters")
    .select([
      ...SHELTER_FIELDS,
      sql<unknown>`ST_Y(shelters.location)`.as("lat"),
      sql<unknown>`ST_X(shelters.location)`.as("lng"),
      sql<unknown>`ROUND((ST_Distance(geography(shelters.location),
        geography(ST_SetSRID(ST_MakePoint(${input.lng}, ${input.lat}), 4326))) / 1000)::numeric, 2)::float8`.as(
        "distance_km",
      ),
    ])
    .where("shelters.status", "in", ["open", "preparing"])
    .where(
      sql<SqlBool>`ST_DWithin(geography(shelters.location),
        geography(ST_SetSRID(ST_MakePoint(${input.lng}, ${input.lat}), 4326)),
        ${input.max_distance_km * 1000})`,
    )
    .orderBy(sql`ST_Distance(geography(shelters.location),
      geography(ST_SetSRID(ST_MakePoint(${input.lng}, ${input.lat}), 4326)))`)
    .limit(25)
    .execute() as unknown as Record<string, unknown>[];

  return rows
    .filter((row) => {
      const capacity = Number(row.capacity ?? 0);
      const occupied = Number(row.current_occupancy ?? 0);
      return capacity - occupied >= input.required_capacity;
    })
    .map((row) => {
      const record = { ...mapRow(row), distance_km: Number(row.distance_km) };
      return {
        ...record,
        hazard_status: hazardStatus(record),
      } as ShelterListItem & { hazard_status: string };
    });
}