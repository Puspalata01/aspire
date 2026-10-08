import { NextRequest } from "next/server";
import { requestContext, runApi, zodFieldIssues } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { env } from "@/server/config";
import { REFRESH_COOKIE, REFRESH_TOKEN_TTL } from "@/server/core/tokens";
import { rateLimitHit } from "@/server/core/rateLimit";
import { loginSchema, loginUser } from "@/server/services/authService";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return runApi(request, async () => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw httpErrors.invalidPayload("Request body must be valid JSON");
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw httpErrors.invalidPayload("login payload failed schema validation", zodFieldIssues(parsed.error.issues));
    }

    const { ip } = requestContext(request);
    await rateLimitHit(ip ?? "unknown", "auth-login");

    const data = await loginUser(parsed.data, requestContext(request));
    return {
      status: 200,
      data,
      cookies: [
        {
          name: REFRESH_COOKIE,
          value: data.refresh_token,
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/api/v1/auth",
          maxAge: REFRESH_TOKEN_TTL,
        },
      ],
    };
  });
}