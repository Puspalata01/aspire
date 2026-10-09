import { sql } from "kysely";
import { z } from "zod";
import { getDb } from "@/server/db";
import { httpErrors } from "@/server/core/errors";
import { audit, type AuditContext } from "@/server/core/audit";
import type { NotificationType, Severity, JsonValue } from "@/server/db/types";

export const NOTIFICATION_TYPES = ["alert", "sos_update", "resource", "system", "weather", "risk_change"] as const;

export const SEVERITIES = ["low", "medium", "high", "critical"] as const;

export type NotificationRecord = {
  id: string;
  user_id: string;
  type: NotificationType;
  channel: string;
  title: string;
  message: string;
  severity: Severity | null;
  is_read: boolean;
  read_at: string | Date | null;
  action_url: string | null;
  metadata: unknown;
  sent_at: string | Date;
  created_at: string | Date;
};

export const createNotificationSchema = z.object({
  user_id: z.uuid(),
  type: z.enum(NOTIFICATION_TYPES),
  channel: z.string().max(50).default("in_app_push"),
  title: z.string().trim().min(1).max(255),
  message: z.string().trim().min(1).max(2000),
  severity: z.enum(SEVERITIES).optional(),
  action_url: z.string().url().max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

const NOTIFICATION_FIELDS = [
  "notifications.id",
  "notifications.user_id",
  "notifications.type",
  "notifications.channel",
  "notifications.title",
  "notifications.message",
  "notifications.severity",
  "notifications.is_read",
  "notifications.read_at",
  "notifications.action_url",
  "notifications.metadata",
  "notifications.sent_at",
  "notifications.created_at",
] as const;

function baseSelect(db: NonNullable<ReturnType<typeof getDb>>) {
  return db.selectFrom("notifications").select(NOTIFICATION_FIELDS);
}

function mapRow(row: Record<string, unknown>): NotificationRecord {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    type: row.type as NotificationType,
    channel: row.channel as string,
    title: row.title as string,
    message: row.message as string,
    severity: (row.severity as Severity) ?? null,
    is_read: Boolean(row.is_read),
    read_at: (row.read_at as string | Date) ?? null,
    action_url: (row.action_url as string) ?? null,
    metadata: (row.metadata ?? {}) as unknown,
    sent_at: row.sent_at as string | Date,
    created_at: row.created_at as string | Date,
  };
}

export async function listNotifications(input: {
  userId: string;
  type?: NotificationType;
  isRead?: boolean;
  page: number;
  limit: number;
}) {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  let count = db
    .selectFrom("notifications")
    .select((eb) => eb.fn.countAll().as("total"))
    .where("notifications.user_id", "=", input.userId);

  let q = baseSelect(db)
    .where("notifications.user_id", "=", input.userId)
    .orderBy("notifications.created_at", "desc")
    .offset((input.page - 1) * input.limit)
    .limit(input.limit);

  if (input.type) {
    count = count.where("notifications.type", "=", input.type);
    q = q.where("notifications.type", "=", input.type);
  }
  if (input.isRead !== undefined) {
    count = count.where("notifications.is_read", "=", input.isRead);
    q = q.where("notifications.is_read", "=", input.isRead);
  }

  const [total, rows] = await Promise.all([count.executeTakeFirst(), q.execute()]);
  return { items: rows.map(mapRow), total_records: Number(total?.total ?? 0) };
}

export async function createNotification(input: CreateNotificationInput, ctx: AuditContext): Promise<NotificationRecord> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const inserted = await db
    .insertInto("notifications")
    .values({
      user_id: input.user_id,
      type: input.type,
      channel: input.channel,
      title: input.title,
      message: input.message,
      severity: input.severity ?? null,
      action_url: input.action_url ?? null,
      metadata: JSON.stringify(input.metadata) as unknown as JsonValue,
    })
    .returning(["id", "created_at"])
    .executeTakeFirstOrThrow();

  const record = await baseSelect(db).where("notifications.id", "=", inserted.id).executeTakeFirstOrThrow();

  await audit(ctx, "NOTIFICATION_CREATE", "notification", inserted.id, null, {
    user_id: input.user_id,
    type: input.type,
    title: input.title,
  });

  return mapRow(record);
}

export async function markNotificationRead(id: string, userId: string): Promise<NotificationRecord | null> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const existing = await baseSelect(db)
    .where("notifications.id", "=", id)
    .where("notifications.user_id", "=", userId)
    .executeTakeFirst();

  if (!existing) return null;

  await db
    .updateTable("notifications")
    .set({
      is_read: true,
      read_at: sql`NOW()`,
    })
    .where("notifications.id", "=", id)
    .where("notifications.user_id", "=", userId)
    .execute();

  const record = await baseSelect(db).where("notifications.id", "=", id).executeTakeFirstOrThrow();
  return mapRow(record);
}