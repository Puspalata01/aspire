import { NextRequest } from "next/server";
import { runApi } from "@/server/core/http";
import { requireAuth } from "@/server/core/authGuards";
import { getCurrentUser } from "@/server/services/authService";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return runApi(request, async () => {
    const auth = await requireAuth(request);
    const data = await getCurrentUser(auth.sub);
    return { data };
  });
}