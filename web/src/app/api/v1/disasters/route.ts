import { NextRequest } from "next/server";
import { z } from "zod";
import { requestContext, runApi, zodFieldIssues } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth, requireRole, requirePermission } from "@/server/core/authGuards";
import {
  createDisasterSchema,
  createDisaster,
  listDisasters,
  HAZARD_TYPES,
  SEVERITIES,
  DISASTER_STATUSES,
} from "@/server/services/disasterService";

export const runtime = "nodejs";

const listQuerySchema = z.object({
  status: z.enum(DISASTER_STATUSES).optional(),
  hazard_type: z.enum(HAZARD_TYPES).optional(),
  severity: z.enum(SEVERITIES).optional(),
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
    requirePermission(auth, "read:risk");

    const parsed = listQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams),
    );
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "disasters list query failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const { items, total_records } = await listDisasters({
      status: parsed.data.status,
      hazardType: parsed.data.hazard_type,
      severity: parsed.data.severity,
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
    requirePermission(auth, "write:disasters");

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw httpErrors.invalidPayload("Request body must be valid JSON");
    }

    const parsed = createDisasterSchema.safeParse(body);
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "disaster payload failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const { ip, userAgent } = requestContext(request);
    const record = await createDisaster(parsed.data, {
      actorId: auth.sub,
      ip,
      userAgent,
    });

    return { status: 201, data: record };
  });
}