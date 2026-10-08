import { NextRequest } from "next/server";
import { runApi } from "@/server/core/http.ts";
import { requireAuth } from "@/server/core/authGuards.ts";
import { getTrendAnalysis } from "@/server/services/analyticsService.ts";
import { z } from "zod";

export const runtime = "nodejs";

const querySchema = z.object({
  period: z.enum(["24h", "7d", "30d"]).default("24h"),
  interval: z.enum(["1h", "1d"]).default("1h"),
});

export async function GET(req: NextRequest) {
  return runApi(req, async () => {
    const actor = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const query = querySchema.parse({
      period: searchParams.get("period") || "24h",
      interval: searchParams.get("interval") || "1h",
    });

    const data = await getTrendAnalysis(query);
    return { status: 200 as const, data };
  });
}
