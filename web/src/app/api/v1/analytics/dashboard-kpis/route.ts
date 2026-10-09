import { NextRequest } from "next/server";
import { runApi } from "@/server/core/http";
import { requireAuth } from "@/server/core/authGuards";
import { getDashboardKpis } from "@/server/services/analyticsService";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return runApi(request, async () => {
    try {
      await requireAuth(request);
      const kpis = await getDashboardKpis();
      return { data: kpis };
    } catch (err) {
      console.error("DASHBOARD KPIS ROUTE ERROR:", err);
      throw err;
    }
  });
}
