import { NextRequest } from "next/server";
import { z } from "zod";
import { runApi, zodFieldIssues, getSearchParams } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth, requireRole, requirePermission } from "@/server/core/authGuards";
import { listCitizenReports, REPORT_TYPES, VERIFICATION_STATUSES, SEVERITIES } from "@/server/services/citizenReportService";

export const runtime = "nodejs";

const listQuerySchema = z.object({
  report_type: z.enum(REPORT_TYPES).optional(),
  verification_status: z.enum(VERIFICATION_STATUSES).optional(),
  severity: z.enum(SEVERITIES).optional(),
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
    requireRole(auth, ["authority", "admin", "super_admin"]);
    requirePermission(auth, "manage:alerts");

    const parsed = listQuerySchema.safeParse(Object.fromEntries(getSearchParams(request)));
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "Citizen reports list query failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const { items, total_records } = await listCitizenReports({
      reportType: parsed.data.report_type,
      verificationStatus: parsed.data.verification_status,
      severity: parsed.data.severity,
      disasterId: parsed.data.disaster_id,
      page: parsed.data.page,
      limit: parsed.data.limit,
    });

    return { data: items, pagination: pagination(parsed.data, total_records) };
  });
}