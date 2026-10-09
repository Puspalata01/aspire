import { NextRequest } from "next/server";
import { z } from "zod";
import { requestContext, runApi, zodFieldIssues, getSearchParams } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth, requireRole, requirePermission } from "@/server/core/authGuards";
import { createHospitalSchema, createHospital, listHospitals, HOSPITAL_TYPES, EMERGENCY_STATUSES } from "@/server/services/hospitalService";

export const runtime = "nodejs";

const listQuerySchema = z.object({
  emergency_status: z.enum(EMERGENCY_STATUSES).optional(),
  type: z.enum(HOSPITAL_TYPES).optional(),
  region_id: z.uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

function pagination(input: { page: number; limit: number }, total: number) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / input.limit);
  return {
    page: input.page,
    limit: input.limit,
    total_records: total,
    total_pages: totalPages,
    has_next: input.page < totalPages,
    has_prev: input.page > 1,
  };
}

export async function GET(request: NextRequest) {
  return runApi(request, async () => {
    const auth = await requireAuth(request);
    requirePermission(auth, "read:hospitals");

    const parsed = listQuerySchema.safeParse(Object.fromEntries(getSearchParams(request)));
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "hospitals list query failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const { items, total_records } = await listHospitals({
      emergencyStatus: parsed.data.emergency_status,
      type: parsed.data.type,
      regionId: parsed.data.region_id,
      page: parsed.data.page,
      limit: parsed.data.limit,
    });

    return { data: items, pagination: pagination(parsed.data, total_records) };
  });
}

export async function POST(request: NextRequest) {
  return runApi(request, async () => {
    const auth = await requireAuth(request);
    requireRole(auth, ["authority", "admin", "super_admin"]);
    requirePermission(auth, "write:hospitals");

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw httpErrors.invalidPayload("Request body must be valid JSON");
    }

    const parsed = createHospitalSchema.safeParse(body);
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "hospital payload failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const { ip, userAgent } = requestContext(request);
    const record = await createHospital(parsed.data, { actorId: auth.sub, ip, userAgent });
    return { status: 201, data: record };
  });
}