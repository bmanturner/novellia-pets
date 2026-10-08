import type { Selectable } from "kysely";
import { db } from "@/db";
import type { DB } from "@/db/types";

export type Species = Selectable<DB["species"]>;

export async function listSpecies(): Promise<Species[]> {
  return db.selectFrom("species").selectAll().orderBy("sortOrder").execute();
}
