import { NextRequest } from "next/server";
import { z } from "zod";
import { requestContext, runApi, zodFieldIssues } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth, requirePermission } from "@/server/core/authGuards";
import { getSosById, updateSosStatus, updateSosStatusSchema } from "@/server/services/sosService";

export const runtime = "nodejs";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return runApi(request, async () => {
    const auth = await requireAuth(request);
    requirePermission(auth, "manage:sos");

    const { id } = paramsSchema.parse(await params);
    const record = await getSosById(id);
    if (!record) throw httpErrors.notFound("SOS report not found");
    return { data: record };
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return runApi(request, async () => {
    const auth = await requireAuth(request);
    requirePermission(auth, "manage:sos");

    const { id } = paramsSchema.parse(await params);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw httpErrors.invalidPayload("Request body must be valid JSON");
    }

    const parsed = updateSosStatusSchema.safeParse(body);
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "SOS update payload failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const { ip, userAgent } = requestContext(request);
    const record = await updateSosStatus(id, parsed.data.status, { actorId: auth.sub, ip, userAgent });
    if (!record) throw httpErrors.notFound("SOS report not found");
    return { data: record };
  });
}