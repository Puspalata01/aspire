import { NextRequest } from "next/server";
import { requestContext, runApi, zodFieldIssues } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth, requireRole, requirePermission } from "@/server/core/authGuards";
import { dispatchSchema, dispatchResources } from "@/server/services/resourceService";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return runApi(request, async () => {
    const auth = await requireAuth(request);
    requireRole(auth, ["authority", "admin", "super_admin"]);
    requirePermission(auth, "write:resources");

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw httpErrors.invalidPayload("Request body must be valid JSON");
    }

    const parsed = dispatchSchema.safeParse(body);
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "dispatch payload failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const { ip, userAgent } = requestContext(request);
    const data = await dispatchResources(parsed.data, { actorId: auth.sub, ip, userAgent });
    return { data };
  });
}