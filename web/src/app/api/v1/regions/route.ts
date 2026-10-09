import { NextRequest } from "next/server";
import { z } from "zod";
import { runApi, zodFieldIssues, getSearchParams } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth } from "@/server/core/authGuards";
import { listRegions } from "@/server/services/regionService";

export const runtime = "nodejs";

const listQuerySchema = z.object({
  type: z.string().optional(),
  parent_id: z.string().optional(),
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
    await requireAuth(request);

    const parsed = listQuerySchema.safeParse(Object.fromEntries(getSearchParams(request)));
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "Regions list query failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const { items, total_records } = await listRegions({
      type: parsed.data.type,
      parentId: parsed.data.parent_id,
      page: parsed.data.page,
      limit: parsed.data.limit,
    });

    return { data: items, pagination: pagination(parsed.data, total_records) };
  });
}