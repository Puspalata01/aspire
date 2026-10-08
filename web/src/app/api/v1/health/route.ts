import { NextRequest } from "next/server";
import { httpErrors, ErrorDetail } from "@/server/core/errors";
import { runApi } from "@/server/core/http";
import { checkDatabase } from "@/server/db";
import { checkRedis } from "@/server/core/redis";
import { checkMlService } from "@/server/services/mlClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return runApi(request, async () => {
    const [database, redis, ml_service] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkMlService(),
    ]);

    const details: ErrorDetail[] = [];
    if (database.status === "error") {
      details.push({ field: "database", issue: database.detail ?? "unavailable" });
    }
    if (redis.status === "error") {
      details.push({ field: "redis", issue: redis.detail ?? "unavailable" });
    }
    if (details.length > 0) {
      throw httpErrors.serviceDegraded("Database or Redis cache temporarily unavailable", details);
    }

    return { data: { checks: { database, redis, ml_service } } };
  });
}
