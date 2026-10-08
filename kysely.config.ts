import { loadEnvConfig } from "@next/env";
import { defineConfig, getKnexTimestampPrefix } from "kysely-ctl";
import { createDialect } from "./db/dialect";

// Load .env* files the same way Next.js does.
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

// Migrations run without CamelCasePlugin: write identifiers in snake_case.
export default defineConfig({
  dialect: createDialect(),
  migrations: {
    migrationFolder: "db/migrations",
    getMigrationPrefix: getKnexTimestampPrefix,
  },
  seeds: {
    seedFolder: "db/seeds",
    getSeedPrefix: getKnexTimestampPrefix,
  },
});
