import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import SQLite from "better-sqlite3";
import { SqliteDialect } from "kysely";

// Shared by the app (db/index.ts) and kysely-ctl (kysely.config.ts), so it
// must not import 'server-only'. The connection opens lazily on first query.
export function createDialect(): SqliteDialect {
  return new SqliteDialect({
    database: async () => {
      const url = process.env.DATABASE_URL;
      if (!url) {
        throw new Error("DATABASE_URL is not set. Copy .env.example to .env.");
      }
      if (url !== ":memory:") {
        mkdirSync(dirname(url), { recursive: true });
      }
      const database = new SQLite(url);
      // SQLite leaves foreign key enforcement off unless enabled per connection.
      database.pragma("foreign_keys = ON");
      return database;
    },
  });
}
