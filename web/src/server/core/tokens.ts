import { SignJWT, jwtVerify } from "jose";
import { env } from "@/server/config";

export type TokenUser = {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  region_id: string | null;
};

export type VerifiedToken = {
  sub: string;
  token_type?: string;
  email?: string;
  role?: string;
  permissions?: string[];
  region_id?: string | null;
  exp?: number;
  iat?: number;
};

export const ACCESS_TOKEN_TTL = 15 * 60;
export const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;
export const REFRESH_COOKIE = "aspire_refresh";

function secretKey(): Uint8Array {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET not configured — set it in web/.env");
  }
  return new TextEncoder().encode(env.JWT_SECRET);
}

export async function signAccessToken(user: TokenUser): Promise<string> {
  return new SignJWT({
    token_type: "access",
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    region_id: user.region_id,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer("aspire")
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL}s`)
    .sign(secretKey());
}

export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({
    token_type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer("aspire")
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_TTL}s`)
    .sign(secretKey());
}

export async function verifyToken(token: string): Promise<VerifiedToken> {
  const { payload } = await jwtVerify(token, secretKey(), { issuer: "aspire" });
  return payload as VerifiedToken;
}