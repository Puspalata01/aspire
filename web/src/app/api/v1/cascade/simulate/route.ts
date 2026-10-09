import { NextRequest } from "next/server";
import { runApi } from "@/server/core/http.ts";
import { requireAuth } from "@/server/core/authGuards.ts";
import { predictCascade } from "@/server/services/cascadePredictionService.ts";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  primary_event: z.object({
    hazard_type: z.enum(["flood", "cyclone", "earthquake", "heatwave", "landslide"]),
    wind_speed_kmh: z.number().optional(),
    landfall_lat: z.number().min(-90).max(90).optional(),
    landfall_lng: z.number().min(-180).max(180).optional(),
    duration_hours: z.number().positive(),
  }),
  max_cascade_depth: z.number().int().min(1).max(10),
});

export async function POST(req: NextRequest) {
  return runApi(req, async () => {
    const actor = await requireAuth(req);
    const body = bodySchema.parse(await req.json());

    const result = await predictCascade(body);
    return { status: 200 as const, data: result };
  });
}
