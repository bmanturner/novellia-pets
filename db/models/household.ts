import { db } from "@/db";

export const DEFAULT_HOUSEHOLD_ID = 1;

/**
 * The household the current request acts on. There's no auth yet, so everyone
 * shares one default household, created on first use. This is the single seam
 * to replace with a session lookup once auth exists.
 */
export async function getCurrentHouseholdId(): Promise<number> {
  await db
    .insertInto("household")
    .values({ id: DEFAULT_HOUSEHOLD_ID, name: "My household" })
    .onConflict((oc) => oc.column("id").doNothing())
    .execute();
  return DEFAULT_HOUSEHOLD_ID;
}
