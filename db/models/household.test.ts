import { expect, test } from "vitest";
import { db } from "@/db";
import { DEFAULT_HOUSEHOLD_ID, getCurrentHouseholdId } from "./household";

test("concurrent first calls create a single default household", async () => {
  const ids = await Promise.all([
    getCurrentHouseholdId(),
    getCurrentHouseholdId(),
  ]);

  expect(ids).toEqual([DEFAULT_HOUSEHOLD_ID, DEFAULT_HOUSEHOLD_ID]);
  const { count } = await db
    .selectFrom("household")
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .executeTakeFirstOrThrow();
  expect(count).toBe(1);
});
