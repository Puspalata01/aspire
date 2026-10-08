import { NextRequest } from "next/server";
import { runApi, zodFieldIssues } from "@/server/core/http";
import { httpErrors } from "@/server/core/errors";
import { env } from "@/server/config";
import { REFRESH_COOKIE, REFRESH_TOKEN_TTL } from "@/server/core/tokens";
import { refreshSchema, refreshSession } from "@/server/services/authService";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return runApi(request, async () => {
    const cookieToken = request.cookies.get(REFRESH_COOKIE)?.value;

    let bodyToken: string | undefined;
    if (!cookieToken) {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        throw httpErrors.invalidPayload("Request body must be valid JSON");
      }
      const parsed = refreshSchema.safeParse(body);
      if (!parsed.success) {
        throw httpErrors.invalidPayload("refresh payload failed schema validation", zodFieldIssues(parsed.error.issues));
      }
      bodyToken = parsed.data.refresh_token;
    }

    const token = cookieToken ?? bodyToken;
    if (!token) throw httpErrors.invalidPayload("refresh_token missing");

    const data = await refreshSession(token);
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