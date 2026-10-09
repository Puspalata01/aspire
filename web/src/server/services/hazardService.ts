import { sql, type SqlBool } from "kysely";
import { z } from "zod";
import { getDb } from "@/server/db";
import { httpErrors } from "@/server/core/errors";
import { logger } from "@/server/logger";
import { HAZARD_TYPES, SEVERITIES } from "@/server/services/disasterService";
import type { HazardType, Severity } from "@/server/db/types";

const SEVERITY_RANK: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export const overlayQuerySchema = z.object({
  hazard_type: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",").filter((t): t is HazardType => (HAZARD_TYPES as readonly string[]).includes(t)) : undefined)),
  min_severity: z.enum(SEVERITIES).optional(),
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

export type OverlayInput = z.infer<typeof overlayQuerySchema>;

export type FeatureCollection = {
  type: "FeatureCollection";
  features: Feature[];
};

export type Feature = {
  type: "Feature";
  id: string;
  geometry: unknown;
  properties: Record<string, unknown>;
};

type HazardRow = {
  id: string;
  type: HazardType;
  severity: Severity;
  score: string | number;
  data_source: string;
  observed_at: string | Date;
  valid_until: string | Date | null;
  confidence: string | number | null;
  parameters: unknown;
  feature_geometry: string | null;
};

const RESERVED_PROPERTIES = new Set([
  "hazard_type",
  "severity",
  "score",
  "data_source",
  "observed_at",
  "valid_until",
  "confidence",
]);

function toProperties(row: HazardRow): Record<string, unknown> {
  const properties: Record<string, unknown> = {
    hazard_type: row.type,
    severity: row.severity,
    score: Number(row.score),
    data_source: row.data_source,
    observed_at: row.observed_at,
    valid_until: row.valid_until,
    confidence: row.confidence != null ? Number(row.confidence) : null,
  };
  const parameters =
    row.parameters && typeof row.parameters === "object"
      ? (row.parameters as Record<string, unknown>)
      : {};
  for (const [key, value] of Object.entries(parameters)) {
    if (!RESERVED_PROPERTIES.has(key)) properties[key] = value;
  }
  return properties;
}

function fallbackHazardFeatures(): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: "haz-001",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [85.80, 19.78],
              [86.20, 19.86],
              [86.40, 20.15],
              [86.00, 20.10],
              [85.78, 19.80],
            ],
          ],
        },
        properties: {
          id: "haz-001",
          hazard_type: "cyclone",
          severity: "critical",
          score: 95,
          color: "#FF4D5E",
          data_source: "IMD Doppler Radar",
          observed_at: new Date().toISOString(),
          confidence: 0.94,
        },
      },
      {
        type: "Feature",
        id: "haz-002",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [85.82, 20.42],
              [86.35, 20.48],
              [86.60, 20.65],
              [86.15, 20.60],
              [85.82, 20.42],
            ],
          ],
        },
        properties: {
          id: "haz-002",
          hazard_type: "flood",
          severity: "high",
          score: 82,
          color: "#3B6CFF",
          data_source: "CWC River Gauges",
          observed_at: new Date().toISOString(),
          confidence: 0.88,
        },
      },
    ],
  };
}

export async function hazardOverlays(input: OverlayInput): Promise<FeatureCollection> {
  const db = getDb();
  if (!db) return fallbackHazardFeatures();

  let q = db
    .selectFrom("hazards")
    .select([
      "hazards.id",
      "hazards.type",
      "hazards.severity",
      "hazards.score",
      "hazards.data_source",
      "hazards.observed_at",
      "hazards.valid_until",
      "hazards.confidence",
      "hazards.parameters",
      sql<unknown>`COALESCE(ST_AsGeoJSON(hazards.affected_area), ST_AsGeoJSON(hazards.location))::text`.as(
        "feature_geometry",
      ),
    ])
    .where((eb) =>
      eb.or([eb("hazards.valid_until", "is", null), eb("hazards.valid_until", ">", new Date())]),
    )
    .orderBy("hazards.observed_at", "desc")
    .limit(200);

  if (input.hazard_type && input.hazard_type.length > 0) {
    q = q.where("hazards.type", "in", input.hazard_type);
  }
  if (input.min_severity) {
    q = q.where(
      sql`CASE "hazards"."severity"
        WHEN 'low' THEN 1 WHEN 'medium' THEN 2 WHEN 'high' THEN 3 WHEN 'critical' THEN 4 END`,
      ">=",
      SEVERITY_RANK[input.min_severity],
    );
  }
  if (input.bbox) {
    const { minLng, minLat, maxLng, maxLat } = input.bbox;
    q = q.where(
      sql<SqlBool>`ST_Intersects(ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326),
        COALESCE("hazards"."affected_area", "hazards"."location"))`,
    );
  }

  try {
    const rows = (await q.execute()) as unknown as HazardRow[];
    if (!rows || rows.length === 0) {
      return fallbackHazardFeatures();
    }
    return {
      type: "FeatureCollection",
      features: rows
        .filter((row) => row.feature_geometry != null)
        .map((row) => ({
          type: "Feature",
          id: row.id,
          geometry: JSON.parse(row.feature_geometry as string),
          properties: toProperties(row),
        })),
    };
  } catch (err) {
    logger.warn({ err }, "hazardOverlays DB query failed, using domain fallback");
    return fallbackHazardFeatures();
  }
}