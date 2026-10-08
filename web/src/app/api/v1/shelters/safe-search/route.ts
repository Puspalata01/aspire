import { NextRequest } from "next/server";
import { runApi, zodFieldIssues } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth, requirePermission } from "@/server/core/authGuards";
import { safeSearchSchema, safeSearchShelters } from "@/server/services/shelterService";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return runApi(request, async () => {
    const auth = await requireAuth(request);
    requirePermission(auth, "read:shelters");

    const parsed = safeSearchSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "shelter safe-search query failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const data = await safeSearchShelters(parsed.data);
    return { data };
  });
}