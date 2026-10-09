import { NextRequest } from "next/server";
import { z } from "zod";
import { requestContext, runApi } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth, requirePermission } from "@/server/core/authGuards";
import { acknowledgeAlert } from "@/server/services/alertService";

export const runtime = "nodejs";

const paramsSchema = z.object({ id: z.uuid() });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return runApi(request, async () => {
    const auth = await requireAuth(request);
    requirePermission(auth, "read:alerts");

    const { id } = paramsSchema.parse(await params);
    const { ip, userAgent } = requestContext(request);
    const record = await acknowledgeAlert(id, { actorId: auth.sub, ip, userAgent });
    if (!record) throw httpErrors.notFound("Alert not found");
    return { data: record };
  });
}