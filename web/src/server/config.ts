import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  ML_SERVICE_URL: z.string().default("http://localhost:8000"),
  JWT_SECRET: z.string().min(32).default("aspire-development-jwt-secret-key-32-characters-minimum"),
  APP_URL: z.string().default("http://localhost:3000"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).optional(),
});

function sanitize(val?: string) {
  return val && val.trim().length > 0 ? val.trim() : undefined;
}

const parsed = EnvSchema.safeParse({
  NODE_ENV: sanitize(process.env.NODE_ENV),
  DATABASE_URL: sanitize(process.env.DATABASE_URL),
  REDIS_URL: sanitize(process.env.REDIS_URL),
  ML_SERVICE_URL: sanitize(process.env.ML_SERVICE_URL),
  JWT_SECRET: sanitize(process.env.JWT_SECRET),
  APP_URL: sanitize(process.env.NEXT_PUBLIC_APP_URL),
  LOG_LEVEL: sanitize(process.env.LOG_LEVEL),
});

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
  throw new Error(`Invalid environment configuration — ${issues}`);
}

export const env = parsed.data;
export type Env = typeof env;
