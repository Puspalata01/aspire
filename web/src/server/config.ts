import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url().optional(),
  REDIS_URL: z.url().optional(),
  ML_SERVICE_URL: z.url().default("http://localhost:8001/api/v1"),
  JWT_SECRET: z.string().min(32).optional(),
  APP_URL: z.url().default("http://localhost:3000"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).optional(),
});

const parsed = EnvSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  ML_SERVICE_URL: process.env.ML_SERVICE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  LOG_LEVEL: process.env.LOG_LEVEL,
});

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
  throw new Error(`Invalid environment configuration — ${issues}`);
}

export const env = parsed.data;
export type Env = typeof env;
