import bcrypt from "bcrypt";
import { z } from "zod";
import { getDb } from "@/server/db";
import { httpErrors } from "@/server/core/errors";
import { audit, type AuditContext } from "@/server/core/audit";
import { logger } from "@/server/logger";
import {
  ACCESS_TOKEN_TTL,
  signAccessToken,
  signRefreshToken,
  verifyToken,
  type TokenUser,
} from "@/server/core/tokens";

const BCRYPT_COST = 12;

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(100),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a digit"),
  full_name: z.string().trim().min(1).max(255),
  phone: z
    .union([z.string().regex(/^\+?[0-9]{8,15}$/, "Invalid phone number"), z.literal("")])
    .optional(),
  role: z.enum(["citizen"]).default("citizen"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export type RegisteredUser = {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  is_verified: boolean;
  created_at: string | Date;
};

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";
}

export async function registerUser(input: RegisterInput, ctx: AuditContext): Promise<RegisteredUser> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const citizenRole = await db
    .selectFrom("roles")
    .select("id")
    .where("name", "=", "citizen")
    .executeTakeFirst();

  if (!citizenRole) throw httpErrors.internal("citizen role missing from roles table");

  const password_hash = await bcrypt.hash(input.password, BCRYPT_COST);

  try {
    const user = await db
      .insertInto("users")
      .values({
        email: input.email,
        password_hash,
        full_name: input.full_name,
        role_id: citizenRole.id,
        phone: input.phone || null,
      })
      .returning(["id", "email", "full_name", "is_verified", "created_at"])
      .executeTakeFirstOrThrow();

    logger.info({ user_id: user.id }, "user registered");
    await audit({ ...ctx, actorId: user.id }, "AUTH_REGISTER", "user", user.id, null, {
      email: user.email,
      full_name: user.full_name,
      role: "citizen",
    });
    return {
      user_id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: "citizen",
      is_verified: user.is_verified,
      created_at: user.created_at,
    };
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw httpErrors.conflict("Email or phone already registered");
    }
    throw error;
  }
}

export type LoginResult = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    permissions: string[];
  };
};

export const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

export type RefreshInput = z.infer<typeof refreshSchema>;

function toPermissions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((p): p is string => typeof p === "string");
}

type AuthUserRow = {
  id: string;
  email: string;
  full_name: string;
  password_hash: string;
  is_active: boolean;
  region_id: string | null;
  role: string;
  permissions: unknown;
};

function authUserQuery(db: NonNullable<ReturnType<typeof getDb>>) {
  return db
    .selectFrom("users")
    .innerJoin("roles", "roles.id", "users.role_id")
    .select([
      "users.id",
      "users.email",
      "users.full_name",
      "users.password_hash",
      "users.is_active",
      "users.region_id",
      "roles.name as role",
      "roles.permissions",
    ]);
}

function requireActiveUser(user: AuthUserRow | undefined, notFoundMessage: string): asserts user is AuthUserRow {
  if (!user) throw httpErrors.unauthorized(notFoundMessage);
  if (!user.is_active) throw httpErrors.unauthorized("Account is inactive");
}

async function buildSessionResult(user: AuthUserRow): Promise<LoginResult> {
  const permissions = toPermissions(user.permissions);
  const tokenUser: TokenUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    permissions,
    region_id: user.region_id ?? null,
  };

  const [access_token, refresh_token] = await Promise.all([
    signAccessToken(tokenUser),
    signRefreshToken(user.id),
  ]);

  return {
    access_token,
    refresh_token,
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_TTL,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      permissions,
    },
  };
}

export async function loginUser(input: LoginInput, ctx: AuditContext): Promise<LoginResult> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const user = await authUserQuery(db).where("users.email", "=", input.email).executeTakeFirst();
  if (!user) throw httpErrors.unauthorized("Invalid email or password");

  const valid = await bcrypt.compare(input.password, user.password_hash);
  if (!valid) throw httpErrors.unauthorized("Invalid email or password");
  if (!user.is_active) throw httpErrors.unauthorized("Account is inactive");

  const result = await buildSessionResult(user);
  logger.info({ user_id: user.id }, "user logged in");
  await audit({ ...ctx, actorId: user.id }, "AUTH_LOGIN", "user", user.id);
  return result;
}

export async function refreshSession(refreshToken: string): Promise<LoginResult> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const payload = await verifyToken(refreshToken).catch(() => {
    throw httpErrors.unauthorized("Invalid refresh token");
  });
  if (payload.token_type !== "refresh" || !payload.sub) {
    throw httpErrors.unauthorized("Invalid refresh token");
  }

  const user = await authUserQuery(db).where("users.id", "=", payload.sub).executeTakeFirst();
  requireActiveUser(user, "Invalid refresh token");

  const result = await buildSessionResult(user);
  logger.info({ user_id: user.id }, "session refreshed");
  return result;
}

export type CurrentUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  permissions: string[];
  region_id: string | null;
  is_active: boolean;
  is_verified: boolean;
  last_login_at: string | Date | null;
  created_at: string | Date;
};

export async function getCurrentUser(userId: string): Promise<CurrentUser> {
  const db = getDb();
  if (!db) throw httpErrors.serviceDegraded("Database unavailable");

  const user = await db
    .selectFrom("users")
    .innerJoin("roles", "roles.id", "users.role_id")
    .select([
      "users.id",
      "users.email",
      "users.full_name",
      "users.phone",
      "users.avatar_url",
      "users.region_id",
      "users.is_active",
      "users.is_verified",
      "users.last_login_at",
      "users.created_at",
      "roles.name as role",
      "roles.permissions",
    ])
    .where("users.id", "=", userId)
    .executeTakeFirst();

  if (!user) throw httpErrors.notFound("User not found");

  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    phone: user.phone,
    avatar_url: user.avatar_url,
    role: user.role,
    permissions: toPermissions(user.permissions),
    region_id: user.region_id,
    is_active: user.is_active,
    is_verified: user.is_verified,
    last_login_at: user.last_login_at,
    created_at: user.created_at,
  };
}