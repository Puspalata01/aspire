import { NextRequest } from "next/server";
import { z } from "zod";
import { runApi, zodFieldIssues } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth } from "@/server/core/authGuards";
import { generateRiskHeatmap } from "@/server/services/analyticsService";

export const runtime = "nodejs";

const querySchema = z.object({
  region_id: z.string().uuid().optional(),
  bbox: z.string().optional(),
  cell_size_km: z.coerce.number().min(1).max(50).optional(),
});

export async function GET(request: NextRequest) {
  return runApi(request, async () => {
    await requireAuth(request);

    const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "Risk heatmap query failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    let bbox: { minLng: number; minLat: number; maxLng: number; maxLat: number } | undefined;
    if (parsed.data.bbox) {
      const [minLng, minLat, maxLng, maxLat] = parsed.data.bbox.split(",").map(Number);
      if ([minLng, minLat, maxLng, maxLat].some(isNaN)) {
        throw httpErrors.invalidPayload("bbox must be in format: minLng,minLat,maxLng,maxLat");
      }
      bbox = { minLng, minLat, maxLng, maxLat };
    }

    const cells = await generateRiskHeatmap({
      regionId: parsed.data.region_id,
      bbox,
      cellSizeKm: parsed.data.cell_size_km,
    });

    return {
      data: {
        type: "FeatureCollection",
        features: cells.map((cell) => ({
          type: "Feature",
          id: cell.cell_id,
          geometry: cell.geometry,
          properties: {
            risk_score: cell.risk_score,
            disaster_count: cell.disaster_count,
            sos_count: cell.sos_count,
            hazard_count: cell.hazard_count,
            affected_population_estimate: cell.affected_population_estimate,
            center_lat: cell.center_lat,
            center_lng: cell.center_lng,
          },
        })),
      },
    };
  });
}
