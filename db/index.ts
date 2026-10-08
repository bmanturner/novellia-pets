import "server-only";
import { CamelCasePlugin, Kysely } from "kysely";
import { bootstrapDatabase } from "./bootstrap";
import { createDialect } from "./dialect";
import type { DB } from "./types";

export const db = new Kysely<DB>({
  dialect: createDialect({
    onOpen:
      process.env.DATABASE_BOOTSTRAP === "true" ? bootstrapDatabase : undefined,
  }),
  plugins: [new CamelCasePlugin()],
});
