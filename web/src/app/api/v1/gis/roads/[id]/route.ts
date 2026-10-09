import { NextRequest } from "next/server";
import { z } from "zod";
import { requestContext, runApi, zodFieldIssues } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth, requireRole, requirePermission } from "@/server/core/authGuards";
import { getRoadById, updateRoad, updateRoadSchema } from "@/server/services/roadService";

export const runtime = "nodejs";

const paramsSchema = z.object({ id: z.uuid() });

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return runApi(request, async () => {
    const auth = await requireAuth(request);
    requirePermission(auth, "read:risk");

    const { id } = paramsSchema.parse(await params);
    const record = await getRoadById(id);
    if (!record) throw httpErrors.notFound("Road not found");
    return { data: record };
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return runApi(request, async () => {
    const auth = await requireAuth(request);
    requireRole(auth, ["authority", "admin", "super_admin"]);
    requirePermission(auth, "write:roads");

    const { id } = paramsSchema.parse(await params);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw httpErrors.invalidPayload("Request body must be valid JSON");
    }

    const parsed = updateRoadSchema.safeParse(body);
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "road update payload failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const { ip, userAgent } = requestContext(request);
    const record = await updateRoad(id, parsed.data, { actorId: auth.sub, ip, userAgent });
    if (!record) throw httpErrors.notFound("Road not found");
    return { data: record };
  });
}