import "server-only";
import { CamelCasePlugin, Kysely } from "kysely";
import { createDialect } from "./dialect";
import type { DB } from "./types";

export const db = new Kysely<DB>({
  dialect: createDialect(),
  plugins: [new CamelCasePlugin()],
});
