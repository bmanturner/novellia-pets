import path from "node:path";
import { Migrator, NO_MIGRATIONS } from "kysely/migration";
import type { Migration, MigrationResultSet } from "kysely/migration";
import { beforeEach } from "vitest";
import { db } from "@/db";

// Load migrations through Vite so they get the same TypeScript transform as
// the code under test (Kysely's FileMigrationProvider uses Node's import()).
const migrationModules = import.meta.glob<Migration>("../db/migrations/*.ts", {
  eager: true,
});
const migrations = Object.fromEntries(
  Object.entries(migrationModules).map(([file, migration]) => [
    path.basename(file, ".ts"),
    migration,
  ]),
);

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
