export type ErrorDetail = { field?: string; issue: string };

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ErrorDetail[];

  constructor(status: number, code: string, message: string, details?: ErrorDetail[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const httpErrors = {
  invalidPayload: (message = "Request payload failed schema validation", details?: ErrorDetail[]) =>
    new ApiError(400, "INVALID_PAYLOAD", message, details),
  unauthorized: (message = "Missing or expired JWT access token") =>
    new ApiError(401, "UNAUTHORIZED", message),
  forbiddenRole: (message = "Role lacks permission for this endpoint") =>
    new ApiError(403, "FORBIDDEN_ROLE", message),
  notFound: (message = "Requested entity not found") =>
    new ApiError(404, "ENTITY_NOT_FOUND", message),
  conflict: (message = "Resource conflict") => new ApiError(409, "RESOURCE_CONFLICT", message),
  invalidGeometry: (message = "Invalid PostGIS geometry", details?: ErrorDetail[]) =>
    new ApiError(422, "POSTGIS_INVALID_GEOMETRY", message, details),
  rateLimited: (message = "Request rate limit exceeded (120 req/min)") =>
    new ApiError(429, "RATE_LIMIT_EXCEEDED", message),
  mlInference: (message = "ML inference failed", details?: ErrorDetail[]) =>
    new ApiError(500, "INTERNAL_ML_INFERENCE_ERROR", message, details),
  serviceDegraded: (
    message = "Database or Redis cache temporarily unavailable",
    details?: ErrorDetail[],
  ) => new ApiError(503, "SERVICE_DEGRADED", message, details),
  internal: (message = "Internal server error") => new ApiError(500, "INTERNAL_ERROR", message),
};
