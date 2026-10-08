import { NextRequest } from "next/server";
import { z } from "zod";
import { runApi } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth } from "@/server/core/authGuards";
import { getRegionKpi } from "@/server/services/regionService";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return runApi(request, async () => {
    await requireAuth(request);
    const { id } = await params;
    z.string().uuid().parse(id);

    const data = await getRegionKpi(id);
    if (!data) throw httpErrors.notFound("Region not found");
    return { data };
  });
}