import { NextRequest } from "next/server";
import { z } from "zod";
import { runApi, zodFieldIssues } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth } from "@/server/core/authGuards";
import { getFleetLocations } from "@/server/services/analyticsService";

export const runtime = "nodejs";

const querySchema = z.object({
  region_id: z.string().uuid().optional(),
  resource_type: z.string().optional(),
  status: z.string().optional(),
});

export async function GET(request: NextRequest) {
  return runApi(request, async () => {
    await requireAuth(request);

    const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "Fleet tracking query failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const locations = await getFleetLocations({
      regionId: parsed.data.region_id,
      resourceType: parsed.data.resource_type,
      status: parsed.data.status,
    });

    return {
      data: {
        type: "FeatureCollection",
        features: locations.map((loc) => ({
          type: "Feature",
          id: loc.resource_id,
          geometry: loc.location,
          properties: {
            resource_name: loc.resource_name,
            resource_type: loc.resource_type,
            status: loc.status,
            last_updated: loc.last_updated,
            assigned_to: loc.assigned_to,
          },
        })),
      },
    };
  });
}
