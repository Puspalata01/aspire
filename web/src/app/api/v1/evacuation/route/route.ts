import { NextRequest } from "next/server";
import { runApi, zodFieldIssues } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth } from "@/server/core/authGuards";
import { evacuationRouteSchema, computeEvacuationRoute } from "@/server/services/evacuationService";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return runApi(request, async () => {
    await requireAuth(request);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw httpErrors.invalidPayload("Request body must be valid JSON");
    }

    const parsed = evacuationRouteSchema.safeParse(body);
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "Evacuation route payload failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const data = await computeEvacuationRoute(parsed.data);
    return { data };
  });
}