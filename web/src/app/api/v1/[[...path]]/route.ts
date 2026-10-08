import { NextRequest } from "next/server";
import { httpErrors } from "@/server/core/errors";
import { runApi } from "@/server/core/http";

export const runtime = "nodejs";

function notFound(request: NextRequest) {
  return runApi(request, async () => {
    throw httpErrors.notFound(`Route ${request.method} ${new URL(request.url).pathname} not found`);
  });
}

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
export const HEAD = notFound;
export const OPTIONS = notFound;
