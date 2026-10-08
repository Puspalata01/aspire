import { NextRequest, NextResponse } from "next/server";
import { ApiError, ErrorDetail } from "@/server/core/errors";
import { logger } from "@/server/logger";

export type Pagination = {
  page: number;
  limit: number;
  total_records: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};

export type ApiResult = {
  status?: number;
  data?: unknown;
  pagination?: Pagination;
};

function successMeta(requestId: string, startedAt: number) {
  return {
    timestamp: new Date().toISOString(),
    request_id: requestId,
    processing_time_ms: Math.round((performance.now() - startedAt) * 10) / 10,
  };
}

function errorMeta(requestId: string) {
  return { timestamp: new Date().toISOString(), request_id: requestId };
}

export function getRequestId(request: NextRequest): string {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}

export async function runApi(
  request: NextRequest,
  handler: () => Promise<ApiResult>,
): Promise<NextResponse> {
  const startedAt = performance.now();
  const requestId = getRequestId(request);
  try {
    const result = await handler();
    const body: Record<string, unknown> = {
      status: "success",
      data: result.data ?? null,
      meta: successMeta(requestId, startedAt),
    };
    if (result.pagination) body.pagination = result.pagination;
    const response = NextResponse.json(body, { status: result.status ?? 200 });
    response.headers.set("x-request-id", requestId);
    return response;
  } catch (error) {
    return errorResponse(request, error, requestId);
  }
}

function errorResponse(request: NextRequest, error: unknown, requestId: string): NextResponse {
  const apiError = error instanceof ApiError ? error : null;
  const status = apiError?.status ?? 500;
  const code = apiError?.code ?? "INTERNAL_ERROR";
  const message = apiError?.message ?? "Internal server error";

  const logPayload = { err: error, request_id: requestId, method: request.method, path: request.nextUrl.pathname };
  if (status >= 500) {
    logger.error(logPayload, "request failed");
  } else {
    logger.debug(logPayload, "request rejected");
  }

  const errorBody: Record<string, unknown> = { code, message };
  if (apiError?.details) errorBody.details = apiError.details;
  const response = NextResponse.json(
    { status: "error", error: errorBody, meta: errorMeta(requestId) },
    { status },
  );
  response.headers.set("x-request-id", requestId);
  return response;
}

export function zodFieldIssues(
  issues: { path: (string | number)[]; message: string }[],
): ErrorDetail[] {
  return issues.map((i) => ({
    field: i.path.map(String).join(".") || undefined,
    issue: i.message,
  }));
}
