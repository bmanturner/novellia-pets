import type SQLite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import { Migrator } from "kysely/migration";
import type { Migration } from "kysely/migration";
import * as initialSchema from "./migrations/20261008164937_initial_schema";
import { seed as seedDemoPets } from "./seeds/20261008183047_demo_pets";
import type { DB } from "./types";

// Static imports so the app bundle carries migrations and seeds; kysely-ctl's
// file loader doesn't work inside a deployed Next.js server. Add each new
// migration here (tests migrate through this list, so a missing one fails
// them).
export const migrations: Record<string, Migration> = {
  "20261008164937_initial_schema": initialSchema,
};

const seeds = [seedDemoPets];

/**
 * Migrates `database` to latest and, if it had never been migrated, seeds it.
 * For ephemeral hosts (Vercel functions write only to their own /tmp): each
 * new instance starts from a fresh demo database.
 */
export async function bootstrapDatabase(
  database: SQLite.Database,
): Promise<void> {
  const fresh = !database
    .prepare(
      "select 1 from sqlite_master where type = 'table' and name = 'kysely_migration'",
    )
    .get();
  // Not destroyed: that would close `database`, which the caller keeps using.
  const db = new Kysely<DB>({ dialect: new SqliteDialect({ database }) });
  const { error } = await new Migrator({
    db,
    provider: { getMigrations: async () => migrations },
  }).migrateToLatest();
  if (error) throw error;
  if (fresh) {
    for (const seed of seeds) await seed(db);
  }
}
