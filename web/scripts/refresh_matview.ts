#!/usr/bin/env tsx
import { getDb } from "../src/server/db/index.ts";
import { sql } from "kysely";

async function refreshMatview() {
  const db = getDb();
  if (!db) {
    console.error("Database unavailable");
    process.exit(1);
  }

  try {
    console.log(`[${new Date().toISOString()}] Refreshing materialized view: region_disaster_summary_mv`);
    await sql`REFRESH MATERIALIZED VIEW CONCURRENTLY region_disaster_summary_mv`.execute(db);
    console.log(`[${new Date().toISOString()}] Refresh complete`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Refresh failed:`, error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

refreshMatview();
