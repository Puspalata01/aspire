import { NextRequest } from "next/server";
import { requestContext, runApi, zodFieldIssues } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { registerSchema, registerUser } from "@/server/services/authService";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return runApi(request, async () => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw httpErrors.invalidPayload("Request body must be valid JSON");
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      throw httpErrors.invalidPayload("register payload failed schema validation", zodFieldIssues(parsed.error.issues));
    }

    const data = await registerUser(parsed.data, requestContext(request));
    return { status: 201, data };
  });
}