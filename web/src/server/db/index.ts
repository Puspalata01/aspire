import pg from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { env } from "@/server/config";

const { Pool } = pg;

export type DatabaseSchema = Record<string, never>;

type Globals = { __aspirePool?: pg.Pool; __aspireDb?: Kysely<DatabaseSchema> };
const g = globalThis as unknown as Globals;

export function getPool(): pg.Pool | null {
  if (!env.DATABASE_URL) return null;
  g.__aspirePool ??= new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
  return g.__aspirePool;
}

export function getDb(): Kysely<DatabaseSchema> | null {
  const pool = getPool();
  if (!pool) return null;
  g.__aspireDb ??= new Kysely<DatabaseSchema>({ dialect: new PostgresDialect({ pool }) });
  return g.__aspireDb;
}

export type DatabaseCheck = { status: "connected" | "not_configured" | "error"; detail?: string };

export async function checkDatabase(): Promise<DatabaseCheck> {
  const pool = getPool();
  if (!pool) return { status: "not_configured" };
  try {
    const { rows } = await pool.query<{ postgis: string }>("SELECT PostGIS_Version() AS postgis");
    return { status: "connected", detail: rows[0]?.postgis };
  } catch (error) {
    return { status: "error", detail: error instanceof Error ? error.message : String(error) };
  }
}
