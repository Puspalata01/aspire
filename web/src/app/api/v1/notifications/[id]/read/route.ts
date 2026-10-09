import { NextRequest } from "next/server";
import { z } from "zod";
import { runApi } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth } from "@/server/core/authGuards";
import { markNotificationRead } from "@/server/services/notificationService";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return runApi(request, async () => {
    const auth = await requireAuth(request);
    const { id } = await params;
    z.string().uuid().parse(id);

    const record = await markNotificationRead(id, auth.sub);
    if (!record) throw httpErrors.notFound("Notification not found or does not belong to user");
    return { data: record };
  });
}