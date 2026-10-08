import { NextRequest } from "next/server";
import { z } from "zod";
import { requestContext, runApi, zodFieldIssues } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth, requireRole, requirePermission } from "@/server/core/authGuards";
import { getCitizenReportById, verifyCitizenReport, verifyCitizenReportSchema } from "@/server/services/citizenReportService";

export const runtime = "nodejs";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return runApi(request, async () => {
    const auth = await requireAuth(request);
    requireRole(auth, ["authority", "admin", "super_admin"]);
    requirePermission(auth, "manage:alerts");

    const { id } = paramsSchema.parse(await params);
    const record = await getCitizenReportById(id);
    if (!record) throw httpErrors.notFound("Citizen report not found");
    return { data: record };
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return runApi(request, async () => {
    const auth = await requireAuth(request);
    requireRole(auth, ["authority", "admin", "super_admin"]);
    requirePermission(auth, "manage:alerts");

    const { id } = paramsSchema.parse(await params);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw httpErrors.invalidPayload("Request body must be valid JSON");
    }

    const parsed = verifyCitizenReportSchema.safeParse(body);
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "Verification payload failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const { ip, userAgent } = requestContext(request);
    const record = await verifyCitizenReport(id, parsed.data, auth.sub, { actorId: auth.sub, ip, userAgent });
    if (!record) throw httpErrors.notFound("Citizen report not found");
    return { data: record };
  });
}