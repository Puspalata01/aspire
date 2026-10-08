import { NextRequest } from "next/server";
import { requestContext, runApi, zodFieldIssues } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { requireAuth } from "@/server/core/authGuards";
import { createSosSchema, createSos } from "@/server/services/sosService";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return runApi(request, async () => {
    const auth = await requireAuth(request);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw httpErrors.invalidPayload("Request body must be valid JSON");
    }

    const parsed = createSosSchema.safeParse(body);
    if (!parsed.success) {
      throw httpErrors.invalidPayload(
        "SOS payload failed schema validation",
        zodFieldIssues(parsed.error.issues),
      );
    }

    const { ip, userAgent } = requestContext(request);
    const record = await createSos(parsed.data, auth.sub, { actorId: auth.sub, ip, userAgent });
    return { status: 201, data: record };
  });
}