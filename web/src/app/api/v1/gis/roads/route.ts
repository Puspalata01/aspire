import { NextRequest } from "next/server";
import { runApi, zodFieldIssues, getSearchParams } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth, requirePermission } from "@/server/core/authGuards";
import { roadQuerySchema, roadOverlays } from "@/server/services/roadService";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return runApi(request, async () => {
    const auth = await requireAuth(request);
    requirePermission(auth, "read:risk");

    const parsed = roadQuerySchema.safeParse(Object.fromEntries(getSearchParams(request)));
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "roads query failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const data = await roadOverlays(parsed.data);
    return { data };
  });
}