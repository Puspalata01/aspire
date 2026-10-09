import { NextRequest } from "next/server";
import { z } from "zod";
import { requestContext, runApi, zodFieldIssues, getSearchParams } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth, requireRole, requirePermission } from "@/server/core/authGuards";
import { createResourceSchema, createResource, listResources, RESOURCE_TYPES, RESOURCE_STATUSES } from "@/server/services/resourceService";

export const runtime = "nodejs";

const listQuerySchema = z.object({
  type: z.enum(RESOURCE_TYPES).optional(),
  status: z.enum(RESOURCE_STATUSES).optional(),
  region_id: z.uuid().optional(),
  disaster_id: z.uuid().optional(),
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
    requirePermission(auth, "read:resources");

    const parsed = listQuerySchema.safeParse(Object.fromEntries(getSearchParams(request)));
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "resources list query failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const { items, total_records } = await listResources({
      type: parsed.data.type,
      status: parsed.data.status,
      regionId: parsed.data.region_id,
      disasterId: parsed.data.disaster_id,
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
    requirePermission(auth, "write:resources");

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw httpErrors.invalidPayload("Request body must be valid JSON");
    }

    const parsed = createResourceSchema.safeParse(body);
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "resource payload failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const { ip, userAgent } = requestContext(request);
    const record = await createResource(parsed.data, { actorId: auth.sub, ip, userAgent });
    return { status: 201, data: record };
  });
}