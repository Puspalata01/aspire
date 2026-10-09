import { NextRequest } from "next/server";
import { z } from "zod";
import { requestContext, runApi, zodFieldIssues, getSearchParams } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth, requireRole, requirePermission } from "@/server/core/authGuards";
import { listNotifications, createNotification, createNotificationSchema, NOTIFICATION_TYPES } from "@/server/services/notificationService";

export const runtime = "nodejs";

const listQuerySchema = z.object({
  type: z.enum(NOTIFICATION_TYPES).optional(),
  is_read: z.coerce.boolean().optional(),
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

    const parsed = listQuerySchema.safeParse(Object.fromEntries(getSearchParams(request)));
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "Notifications list query failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const { items, total_records } = await listNotifications({
      userId: auth.sub,
      type: parsed.data.type,
      isRead: parsed.data.is_read,
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
    requirePermission(auth, "manage:alerts");

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw httpErrors.invalidPayload("Request body must be valid JSON");
    }

    const parsed = createNotificationSchema.safeParse(body);
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "Notification payload failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const { ip, userAgent } = requestContext(request);
    const record = await createNotification(parsed.data, { actorId: auth.sub, ip, userAgent });
    return { status: 201, data: record };
  });
}