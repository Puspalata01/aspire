import { getDb } from "@/server/db";
import { httpErrors } from "@/server/core/errors";
import { logger } from "@/server/logger";
import type { JsonValue } from "@/server/db/types";

export type AuditContext = {
  actorId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

export async function audit(
  ctx: AuditContext,
  action: string,
  entityType: string,
  entityId?: string | null,
  oldValues?: JsonValue | null,
  newValues?: JsonValue | null,
): Promise<void> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");
  if (!ctx.actorId) return;

  try {
    await db
      .insertInto("audit_logs")
      .values({
        user_id: ctx.actorId,
        action,
        entity_type: entityType,
        entity_id: entityId ?? null,
        old_values: oldValues ?? null,
        new_values: newValues ?? null,
        ip_address: ctx.ip ?? null,
        user_agent: ctx.userAgent ?? null,
      })
      .execute();
  } catch (error) {
    logger.warn({ err: error, action }, "audit log write failed");
  }
}