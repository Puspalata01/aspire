import { NextRequest } from "next/server";
import { z } from "zod";
import { runApi, zodFieldIssues } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth, requirePermission } from "@/server/core/authGuards";
import { listSos, SOS_STATUSES, SOS_TYPES, SEVERITIES } from "@/server/services/sosService";

export const runtime = "nodejs";

const paramsSchema = z.object({ id: z.uuid() });

const listQuerySchema = z.object({
  status: z.enum(SOS_STATUSES).optional(),
  urgency: z.enum(SEVERITIES).optional(),
  request_type: z.enum(SOS_TYPES).optional(),
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
    requirePermission(auth, "manage:sos");

    const parsed = listQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "SOS list query failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const { items, total_records } = await listSos({
      status: parsed.data.status,
      urgency: parsed.data.urgency,
      requestType: parsed.data.request_type,
      disasterId: parsed.data.disaster_id,
      page: parsed.data.page,
      limit: parsed.data.limit,
    });

    return { data: items, pagination: pagination(parsed.data, total_records) };
  });
}
