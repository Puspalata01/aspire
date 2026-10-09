import { NextRequest } from "next/server";
import { runApi, zodFieldIssues, getSearchParams } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth, requirePermission } from "@/server/core/authGuards";
import { overlayQuerySchema, hazardOverlays } from "@/server/services/hazardService";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return runApi(request, async () => {
    const auth = await requireAuth(request);
    requirePermission(auth, "read:risk");

    const parsed = overlayQuerySchema.safeParse(
      Object.fromEntries(getSearchParams(request)),
    );
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "hazard overlays query failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const data = await hazardOverlays(parsed.data);
    return { data };
  });
}