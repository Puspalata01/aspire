import pg from "pg";
import { Kysely, PostgresDialect, sql } from "kysely";
import type { Database } from "../src/server/db/types.ts";
import { TABLE_NAMES } from "../src/server/db/types.ts";
import { touch } from "../src/server/db/updates.ts";

const INTERNAL = ["pgmigrations", "spatial_ref_sys", "geometry_columns", "geography_columns"];

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing (run with --env-file=.env)");

  const pool = new pg.Pool({ connectionString: url, max: 2 });
  const db = new Kysely<Database>({ dialect: new PostgresDialect({ pool }) });

  const { rows } = await pool.query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
  );
  const dbTables = rows.map((r) => r.table_name).filter((t) => !INTERNAL.includes(t)).sort();
  const typedSet = new Set<string>(TABLE_NAMES);

  const missingTypes = dbTables.filter((t) => !typedSet.has(t));
  const missingTables = [...TABLE_NAMES].filter((t) => !dbTables.includes(t));

  const roles = await db.selectFrom("roles").selectAll().orderBy("name").execute();
  const mv = await sql<{ n: number }>`SELECT count(*)::int AS n FROM mv_region_risk_summary`.execute(db);

  const geom =
    "ST_GeomFromText('POLYGON((0 0,1 0,1 1,0 1,0 0))',4326)";
  await sql`INSERT INTO regions (name, type, geometry) VALUES ('__verify__', 'district', ${sql.raw(geom)})`.execute(db);
  const before = await db
    .selectFrom("regions")
    .select("updated_at")
    .where("name", "=", "__verify__")
    .executeTakeFirstOrThrow();
  await db
    .updateTable("regions")
    .set(touch({ name: "__verify__2" }))
    .where("name", "=", "__verify__")
    .execute();
  const after = await db
    .selectFrom("regions")
    .select("updated_at")
    .where("name", "=", "__verify__2")
    .executeTakeFirstOrThrow();
  await sql`DELETE FROM regions WHERE name IN ('__verify__', '__verify__2')`.execute(db);

  console.log(`DB tables: ${dbTables.length} | typed: ${typedSet.size}`);
  console.log(`roles via Kysely: ${roles.map((r) => r.name).join(", ")}`);
  console.log(`mv_region_risk_summary rows: ${mv.rows[0]?.n}`);
  console.log(`touch() updated_at: ${before.updated_at} -> ${after.updated_at}`);

  await db.destroy();

  if (
    missingTypes.length ||
    missingTables.length ||
    roles.length !== 4 ||
    !(before.updated_at instanceof Date) ||
    !(after.updated_at instanceof Date) ||
    after.updated_at.getTime() <= before.updated_at.getTime()
  ) {
    console.error("FAIL", { missingTypes, missingTables, before, after });
    process.exit(1);
  }
  console.log("PASS: every public table is typed; Kysely round-trip OK; updated_at helper works");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
