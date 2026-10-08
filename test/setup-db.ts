import { Migrator, NO_MIGRATIONS } from "kysely/migration";
import type { MigrationResultSet } from "kysely/migration";
import { beforeEach } from "vitest";
import { db } from "@/db";
import { migrations } from "@/db/bootstrap";

// Each test file gets its own in-memory database (DATABASE_URL=:memory:).
// Before every test, roll back all migrations and re-apply them: tests start
// from an empty schema, and every down() is exercised against its up().
const migrator = new Migrator({
  // Same connection as the app's `db` (each :memory: connection is a separate
  // database), but without CamelCasePlugin: migrations use snake_case.
  db: db.withoutPlugins(),
  provider: { getMigrations: async () => migrations },
});

function throwOnError({ error }: MigrationResultSet): void {
  if (error) throw error;
}

beforeEach(async () => {
  throwOnError(await migrator.migrateTo(NO_MIGRATIONS));
  throwOnError(await migrator.migrateToLatest());
});
