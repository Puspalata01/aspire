import { sql } from "kysely";
import { z } from "zod";
import { getDb } from "@/server/db";
import { httpErrors } from "@/server/core/errors";

export const vehicleTypes = ["standard_car", "ambulance", "rescue_vehicle", "motorcycle", "on_foot"] as const;

export const evacuationRouteSchema = z.object({
  origin: z.object({
    lat: z.number().refine((v) => v >= -90 && v <= 90, "Invalid latitude"),
    lng: z.number().refine((v) => v >= -180 && v <= 180, "Invalid longitude"),
  }),
  destination_shelter_id: z.uuid(),
  vehicle_type: z.enum(vehicleTypes).default("standard_car"),
  avoid_hazards: z.string().array().default([]),
});

export type EvacuationRouteInput = z.infer<typeof evacuationRouteSchema>;

const VEHICLE_SPEEDS_KMH: Record<string, number> = {
  standard_car: 40,
  ambulance: 50,
  rescue_vehicle: 45,
  motorcycle: 35,
  on_foot: 5,
};

export type EvacuationRoute = {
  route_geojson: {
    type: "Feature";
    geometry: {
      type: "LineString";
      coordinates: number[][];
    };
    properties: Record<string, unknown>;
  };
  distance_meters: number;
  estimated_time_minutes: number;
  risk_index: number;
  shelter_name: string;
  shelter_capacity_available: number;
  note: string;
};

export async function computeEvacuationRoute(input: EvacuationRouteInput): Promise<EvacuationRoute> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  // Fetch destination shelter
  const shelter = await db
    .selectFrom("shelters")
    .select([
      "shelters.id",
      "shelters.name",
      "shelters.capacity",
      "shelters.current_occupancy",
      sql<number>`ST_Y(shelters.location)`.as("lat"),
      sql<number>`ST_X(shelters.location)`.as("lng"),
      sql<number>`ROUND((ST_Distance(
        geography(shelters.location),
        geography(ST_SetSRID(ST_MakePoint(${input.origin.lng}, ${input.origin.lat}), 4326))
      ))::numeric, 2)::float8`.as("distance_meters"),
    ])
    .where("shelters.id", "=", input.destination_shelter_id)
    .executeTakeFirst();

  if (!shelter) {
    throw httpErrors.notFound("Destination shelter not found");
  }

  const distanceMeters = Number(shelter.distance_meters ?? 0);
  const distanceKm = distanceMeters / 1000;
  const speedKmh = VEHICLE_SPEEDS_KMH[input.vehicle_type] ?? 40;
  const estimatedTimeMin = Math.max(Math.round((distanceKm / speedKmh) * 60), 1);

  // Simple straight-line route (Phase 3 placeholder; Phase 4 will use pgRouting + road network)
  const routeCoordinates = [
    [input.origin.lng, input.origin.lat],
    [Number(shelter.lng), Number(shelter.lat)],
  ];

  // Risk index placeholder (Phase 4: compute from hazards along route)
  const riskIndex = 0.15;

  const availableCapacity = Math.max(Number(shelter.capacity ?? 0) - Number(shelter.current_occupancy ?? 0), 0);

  return {
    route_geojson: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: routeCoordinates,
      },
      properties: {
        vehicle_type: input.vehicle_type,
        avoid_hazards: input.avoid_hazards,
      },
    },
    distance_meters: Math.round(distanceMeters),
    estimated_time_minutes: estimatedTimeMin,
    risk_index: riskIndex,
    shelter_name: shelter.name as string,
    shelter_capacity_available: availableCapacity,
    note: "Phase 3: straight-line route. Phase 4 will compute hazard-aware pathfinding with pgRouting + road network graph.",
  };
}