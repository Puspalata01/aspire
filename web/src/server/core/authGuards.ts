import { NextRequest } from "next/server";
import { httpErrors } from "@/server/core/errors";
import { verifyToken, type VerifiedToken } from "@/server/core/tokens";

export const ROLES = ["citizen", "authority", "admin", "super_admin"] as const;
export type RoleName = (typeof ROLES)[number];

export async function requireAuth(request: NextRequest): Promise<VerifiedToken> {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) throw httpErrors.unauthorized();

  const payload = await verifyToken(token).catch(() => {
    throw httpErrors.unauthorized();
  });
  if (!payload.sub) throw httpErrors.unauthorized();
  if (payload.token_type !== "access") throw httpErrors.unauthorized();

  return payload;
}

export function requireRole(auth: VerifiedToken, roles: readonly RoleName[]): void {
  const role = (auth.role ?? "").toLowerCase() as RoleName;
  if (!roles.includes(role)) throw httpErrors.forbiddenRole();
}

export function requirePermission(auth: VerifiedToken, permission: string): void {
  const permissions = Array.isArray(auth.permissions) ? auth.permissions : [];
  if (permissions.includes("*")) return;
  if (!permissions.includes(permission)) throw httpErrors.forbiddenRole();
}