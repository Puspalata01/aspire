import { NextRequest } from "next/server";
import { runApi } from "@/server/core/http.ts";
import { requireAuth } from "@/server/core/authGuards.ts";
import { assessRisk } from "@/server/services/riskAssessmentService.ts";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius_km: z.number().positive().max(100),
  hazard_types: z.array(z.enum(["flood", "cyclone", "earthquake", "heatwave", "landslide"])).nonempty(),
  include_explanation: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  return runApi(req, async () => {
    const actor = await requireAuth(req);
    const body = bodySchema.parse(await req.json());

    const result = await assessRisk(body);
    return { status: 200 as const, data: result };
  });
}