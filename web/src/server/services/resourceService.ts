import { sql } from "kysely";
import { z } from "zod";
import { getDb } from "@/server/db";
import { httpErrors } from "@/server/core/errors";
import { audit, type AuditContext } from "@/server/core/audit";
import { touch } from "@/server/db/updates";
import type { ResourceType, ResourceStatus, Severity, JsonValue } from "@/server/db/types";

export const RESOURCE_TYPES = [
  "rescue_boat",
  "rescue_team",
  "ambulance",
  "helicopter",
  "food_packet",
  "water_tanker",
  "medicine_kit",
  "tent",
  "blanket",
  "generator",
  "fuel",
  "communication_kit",
  "medical_team",
  "police_force",
  "fire_engine",
  "other",
] as const;

export const RESOURCE_STATUSES = ["available", "deployed", "in_transit", "maintenance", "depleted"] as const;

export const DEPLOYMENT_STATUSES = ["planned", "approved", "in_transit", "delivered", "returned", "cancelled"] as const;

export const SEVERITIES = ["low", "medium", "high", "critical"] as const;

export type ResourceRecord = {
  id: string;
  type: ResourceType;
  name: string;
  quantity: number;
  unit: string;
  coordinates: { lat: number; lng: number } | null;
  region_id: string | null;
  status: ResourceStatus;
  assigned_disaster_id: string | null;
  condition: string | null;
  estimated_cost: string | number | null;
  expiry_date: string | null;
  custodian: string | null;
  contact_phone: string | null;
  metadata: unknown;
  created_at: string | Date;
  updated_at: string | Date;
};

const pointSchema = z.union([
  z.object({ lat: z.number(), lng: z.number() }),
  z.tuple([z.number(), z.number()]),
]);

export const createResourceSchema = z.object({
  type: z.enum(RESOURCE_TYPES),
  name: z.string().trim().min(1).max(255),
  quantity: z.number().int().nonnegative(),
  unit: z.string().trim().min(1).max(50),
  location: pointSchema,
  region_id: z.uuid().nullish(),
  status: z.enum(RESOURCE_STATUSES).default("available"),
  assigned_disaster_id: z.uuid().nullish(),
  condition: z.string().max(50).default("good"),
  estimated_cost: z.number().nonnegative().max(999_999_999_999.99).nullish(),
  expiry_date: z.iso.date().nullish(),
  custodian: z.string().max(255).nullish(),
  contact_phone: z.string().max(20).nullish(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;

export const updateResourceSchema = createResourceSchema.partial();

export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;

const dispatchPointSchema = z.union([
  z.object({ lat: z.number(), lng: z.number() }),
  z.tuple([z.number(), z.number()]),
]);

export const dispatchSchema = z.object({
  capability: z.enum(RESOURCE_TYPES),
  destination: dispatchPointSchema,
  destination_label: z.string().max(255).optional(),
  quantity: z.number().int().positive().default(1),
  priority: z.enum(SEVERITIES).default("high"),
  disaster_id: z.uuid().nullish(),
  notes: z.string().max(2000).nullish(),
});

export type DispatchInput = z.infer<typeof dispatchSchema>;

const RESOURCE_FIELDS = [
  "resources.id",
  "resources.type",
  "resources.name",
  "resources.quantity",
  "resources.unit",
  "resources.region_id",
  "resources.status",
  "resources.assigned_disaster_id",
  "resources.condition",
  "resources.estimated_cost",
  "resources.expiry_date",
  "resources.custodian",
  "resources.contact_phone",
  "resources.metadata",
  "resources.created_at",
  "resources.updated_at",
] as const;

function baseSelect(db: NonNullable<ReturnType<typeof getDb>>) {
  return db.selectFrom("resources").select([
    ...RESOURCE_FIELDS,
    sql<unknown>`ST_Y(resources.location)`.as("lat"),
    sql<unknown>`ST_X(resources.location)`.as("lng"),
  ]);
}

function pointSql(value: { lat: number; lng: number } | [number, number]): ReturnType<typeof sql> {
  if (Array.isArray(value)) {
    const [lng, lat] = value;
    return sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`;
  }
  return sql`ST_SetSRID(ST_MakePoint(${value.lng}, ${value.lat}), 4326)`;
}

function mapRow(row: Record<string, unknown>): ResourceRecord {
  const lat = row.lat as number | undefined;
  const lng = row.lng as number | undefined;
  return {
    id: row.id as string,
    type: row.type as ResourceType,
    name: row.name as string,
    quantity: Number(row.quantity ?? 0),
    unit: row.unit as string,
    coordinates: lat != null && lng != null ? { lat, lng } : null,
    region_id: (row.region_id as string) ?? null,
    status: row.status as ResourceStatus,
    assigned_disaster_id: (row.assigned_disaster_id as string) ?? null,
    condition: (row.condition as string) ?? null,
    estimated_cost: (row.estimated_cost as string | number) ?? null,
    expiry_date: (row.expiry_date as string) ?? null,
    custodian: (row.custodian as string) ?? null,
    contact_phone: (row.contact_phone as string) ?? null,
    metadata: (row.metadata ?? {}) as unknown,
    created_at: row.created_at as string | Date,
    updated_at: row.updated_at as string | Date,
  };
}

export async function listResources(input: {
  type?: ResourceType;
  status?: ResourceStatus;
  regionId?: string;
  disasterId?: string;
  page: number;
  limit: number;
}) {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  let count = db.selectFrom("resources").select((eb) => eb.fn.countAll().as("total"));
  let q = baseSelect(db).orderBy("resources.created_at", "desc").offset((input.page - 1) * input.limit).limit(input.limit);

  if (input.type) {
    count = count.where("resources.type", "=", input.type);
    q = q.where("resources.type", "=", input.type);
  }
  if (input.status) {
    count = count.where("resources.status", "=", input.status);
    q = q.where("resources.status", "=", input.status);
  }
  if (input.regionId) {
    count = count.where("resources.region_id", "=", input.regionId);
    q = q.where("resources.region_id", "=", input.regionId);
  }
  if (input.disasterId) {
    count = count.where("resources.assigned_disaster_id", "=", input.disasterId);
    q = q.where("resources.assigned_disaster_id", "=", input.disasterId);
  }

  const [total, rows] = await Promise.all([count.executeTakeFirst(), q.execute()]);
  return { items: rows.map(mapRow), total_records: Number(total?.total ?? 0) };
}

export async function getResourceById(id: string): Promise<ResourceRecord | null> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");
  const row = await baseSelect(db).where("resources.id", "=", id).executeTakeFirst();
  return row ? mapRow(row) : null;
}

export async function createResource(input: CreateResourceInput, ctx: AuditContext): Promise<ResourceRecord> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const inserted = await db
    .insertInto("resources")
    .values({
      type: input.type,
      name: input.name,
      quantity: input.quantity,
      unit: input.unit,
      location: pointSql(input.location) as unknown as string,
      region_id: input.region_id ?? null,
      status: input.status,
      assigned_disaster_id: input.assigned_disaster_id ?? null,
      condition: input.condition ?? "good",
      estimated_cost: input.estimated_cost ?? null,
      expiry_date: input.expiry_date ?? null,
      custodian: input.custodian ?? null,
      contact_phone: input.contact_phone ?? null,
      metadata: input.metadata as unknown as JsonValue,
    })
    .returning(["id", "created_at"])
    .executeTakeFirstOrThrow();

  const record = await getResourceById(inserted.id);
  if (!record) throw httpErrors.internal("resource created but could not be read back");
  await audit(ctx, "RESOURCE_CREATE", "resource", record.id, null, {
    name: record.name,
    type: record.type,
    quantity: record.quantity,
    status: record.status,
  });
  return record;
}

export async function updateResource(
  id: string,
  input: UpdateResourceInput,
  ctx: AuditContext,
): Promise<ResourceRecord | null> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");
  const existing = await getResourceById(id);
  if (!existing) return null;

  const values: Record<string, unknown> = touch({});
  if (input.type !== undefined) values.type = input.type;
  if (input.name !== undefined) values.name = input.name;
  if (input.quantity !== undefined) values.quantity = input.quantity;
  if (input.unit !== undefined) values.unit = input.unit;
  if (input.location !== undefined) values.location = pointSql(input.location) as unknown as string;
  if (input.region_id !== undefined) values.region_id = input.region_id;
  if (input.status !== undefined) values.status = input.status;
  if (input.assigned_disaster_id !== undefined) values.assigned_disaster_id = input.assigned_disaster_id;
  if (input.condition !== undefined) values.condition = input.condition;
  if (input.estimated_cost !== undefined) values.estimated_cost = input.estimated_cost;
  if (input.expiry_date !== undefined) values.expiry_date = input.expiry_date;
  if (input.custodian !== undefined) values.custodian = input.custodian;
  if (input.contact_phone !== undefined) values.contact_phone = input.contact_phone;
  if (input.metadata !== undefined) values.metadata = input.metadata as unknown as JsonValue;

  await db.updateTable("resources").set(values as never).where("resources.id", "=", id).execute();

  const record = await getResourceById(id);
  if (record) {
    await audit(ctx, "RESOURCE_UPDATE", "resource", id, {
      name: existing.name,
      quantity: existing.quantity,
      status: existing.status,
    }, {
      name: record.name,
      quantity: record.quantity,
      status: record.status,
    });
  }
  return record;
}

const PRIORITY_SCORE: Record<Severity, number> = {
  critical: 0.98,
  high: 0.9,
  medium: 0.8,
  low: 0.7,
};

const AVG_SPEED_KMH = 40;

export type DispatchAssignment = {
  resource_id: string;
  resource_name: string;
  current_depot: string | null;
  assigned_cluster: string;
  distance_km: number | null;
  estimated_travel_time_min: number | null;
  safe_route_id: string | null;
  confidence_score: number | null;
  quantity_deployed: number;
};

export type DispatchResult = {
  optimization_algorithm: string;
  recommended_assignments: DispatchAssignment[];
  unmet_needs: { capability: ResourceType; reason: string }[];
};

export async function dispatchResources(input: DispatchInput, ctx: AuditContext): Promise<DispatchResult> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const destPoint = pointSql(input.destination);
  const { lng: dLng, lat: dLat } =
    Array.isArray(input.destination)
      ? { lng: input.destination[0], lat: input.destination[1] }
      : input.destination;

  const nearby = await db
    .selectFrom("resources")
    .select([
      ...RESOURCE_FIELDS,
      sql<unknown>`ST_Y(resources.location)`.as("lat"),
      sql<unknown>`ST_X(resources.location)`.as("lng"),
      sql<unknown>`ROUND((ST_Distance(geography(resources.location),
        geography(ST_SetSRID(ST_MakePoint(${dLng}, ${dLat}), 4326))) / 1000)::numeric, 2)::float8`.as("distance_km"),
    ])
    .where("resources.type", "=", input.capability)
    .where("resources.status", "=", "available")
    .where("resources.quantity", ">", 0)
    .orderBy(sql`ST_Distance(geography(resources.location),
      geography(ST_SetSRID(ST_MakePoint(${dLng}, ${dLat}), 4326)))`)
    .limit(10)
    .execute() as unknown as Record<string, unknown>[];

  const assignments: DispatchAssignment[] = [];
  let remaining = input.quantity;

  for (const row of nearby) {
    if (remaining <= 0) break;
    const resource = mapRow(row);
    const distanceKm = Number(row.distance_km);
    const travelMin = Math.max(Math.round((distanceKm / AVG_SPEED_KMH) * 60), 1);
    const deployQty = Math.min(resource.quantity, remaining);

    await db
      .insertInto("resource_deployments")
      .values({
        resource_id: resource.id,
        disaster_id: input.disaster_id ?? null,
        quantity_deployed: deployQty,
        source_location: sql`ST_SetSRID(ST_MakePoint(${resource.coordinates?.lng ?? 0}, ${resource.coordinates?.lat ?? 0}), 4326)` as unknown as string,
        destination_location: destPoint as unknown as string,
        destination_region_id: null,
        status: "planned",
        priority: input.priority,
        priority_score: PRIORITY_SCORE[input.priority],
        estimated_travel_time_min: travelMin,
        deployed_by: ctx.actorId ?? null,
        ai_recommended: false,
        notes: input.notes ?? null,
      })
      .execute();

    await db
      .updateTable("resources")
      .set(
        touch({
          status: deployQty < resource.quantity ? "available" : "in_transit",
          ...(input.disaster_id ? { assigned_disaster_id: input.disaster_id } : {}),
        }),
      )
      .where("resources.id", "=", resource.id)
      .execute();

    assignments.push({
      resource_id: resource.id,
      resource_name: resource.name,
      current_depot: resource.custodian ?? null,
      assigned_cluster: input.destination_label ?? `incident@${dLat},${dLng}`,
      distance_km: distanceKm,
      estimated_travel_time_min: travelMin,
      safe_route_id: null,
      confidence_score: 0.96,
      quantity_deployed: deployQty,
    });

    remaining -= deployQty;
  }

  if (assignments.length > 0) {
    await audit(ctx, "RESOURCE_DISPATCH", "resource_deployment", null, null, {
      capability: input.capability,
      quantity: input.quantity,
      assigned: assignments.length,
      destination: input.destination_label ?? `${dLat},${dLng}`,
      remaining_unmet: Math.max(remaining, 0),
    });
  }

  return {
    optimization_algorithm: "rule-based greedy (nearest-first); MILP optimization delegated to ML service when online",
    recommended_assignments: assignments,
    unmet_needs:
      remaining > 0
        ? [{ capability: input.capability, reason: `inventory shortfall (${remaining}/${input.quantity} unmet)` }]
        : [],
  };
}