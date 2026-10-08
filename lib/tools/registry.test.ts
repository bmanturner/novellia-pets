import { beforeEach, expect, test } from "vitest";
import { db } from "@/db";
import { getCurrentHouseholdId } from "@/db/models/household";
import { createMedicalRecord } from "@/db/models/medical-record";
import { createPet } from "@/db/models/pet";
import {
  type AnyToolDef,
  allTools,
  type ToolContext,
  writeTools,
} from "@/lib/tools/registry";

let ctx: ToolContext;

beforeEach(async () => {
  ctx = { householdId: await getCurrentHouseholdId(), today: "2026-10-08" };
});

// Both SDKs validate input with the tool's schema before calling execute.
function run(def: AnyToolDef, raw: unknown) {
  return def.execute(ctx, def.inputSchema.parse(raw));
}

test("updatePet changes only the given fields", async () => {
  const rex = await createPet(ctx.householdId, {
    name: "Rex",
    speciesId: "dog",
    breed: "Beagle",
    sex: "male",
    notes: "Shy",
  });

  await run(allTools.updatePet, {
    petId: rex.id,
    changes: { breed: "Basset" },
  });

  expect(await run(allTools.getPet, { petId: rex.id })).toMatchObject({
    pet: { name: "Rex", breed: "Basset", sex: "male", notes: "Shy" },
  });
});

test("updatePet clears a field set to null", async () => {
  const rex = await createPet(ctx.householdId, {
    name: "Rex",
    speciesId: "dog",
    notes: "Shy",
  });

  await run(allTools.updatePet, { petId: rex.id, changes: { notes: null } });

  expect(await run(allTools.getPet, { petId: rex.id })).toMatchObject({
    pet: { notes: null },
  });
});

test("updateMedicalRecord merges details and keeps the type", async () => {
  const rex = await createPet(ctx.householdId, {
    name: "Rex",
    speciesId: "dog",
  });
  const record = await createMedicalRecord(ctx.householdId, rex.id, {
    typeId: "medication",
    title: "Apoquel",
    occurredOn: "2026-09-01",
    details: { dosage: "5 mg", frequency: "daily", prescribedBy: null },
  });

  await run(allTools.updateMedicalRecord, {
    recordId: record!.id,
    changes: { details: { dosage: "10 mg" } },
  });

  expect(
    await run(allTools.getMedicalRecord, { recordId: record!.id }),
  ).toMatchObject({
    typeId: "medication",
    title: "Apoquel",
    occurredOn: "2026-09-01",
    details: { dosage: "10 mg", frequency: "daily", prescribedBy: null },
  });
});

test("missing ids reject instead of reporting success", async () => {
  await expect(run(allTools.getPet, { petId: 999 })).rejects.toThrow(
    "No pet with id 999 in this household.",
  );
  await expect(
    run(allTools.deleteMedicalRecord, { recordId: 999 }),
  ).rejects.toThrow("No medical record with id 999 in this household.");
});

test("tools can't reach another household's pets", async () => {
  await db.insertInto("household").values({ id: 2, name: "Other" }).execute();
  const other = await createPet(2, { name: "Stranger", speciesId: "cat" });

  await expect(run(allTools.getPet, { petId: other.id })).rejects.toThrow(
    `No pet with id ${other.id} in this household.`,
  );
  await expect(run(allTools.deletePet, { petId: other.id })).rejects.toThrow();
});

test("createPet rejects an unknown species", async () => {
  await expect(
    run(allTools.createPet, { name: "X", speciesId: "dragon" }),
  ).rejects.toThrow('Unknown species "dragon"');
});

test("a medical record confirmation names the pet and the due date", async () => {
  const rex = await createPet(ctx.householdId, {
    name: "Rex",
    speciesId: "dog",
  });

  const message = await writeTools.createMedicalRecord.confirmMessage(
    ctx,
    writeTools.createMedicalRecord.inputSchema.parse({
      petId: rex.id,
      record: {
        typeId: "vaccination",
        title: "Rabies (3-year)",
        occurredOn: "2026-10-08",
        dueOn: "2029-10-08",
        details: {},
      },
    }),
  );

  expect(message).toContain("Rex");
  expect(message).toContain("Oct 8, 2029");
});

test("clearing a field is confirmed as a clear", async () => {
  const rex = await createPet(ctx.householdId, {
    name: "Rex",
    speciesId: "dog",
    microchipId: "123456789",
  });

  const message = await writeTools.updatePet.confirmMessage(
    ctx,
    writeTools.updatePet.inputSchema.parse({
      petId: rex.id,
      changes: { microchipId: null },
    }),
  );

  expect(message).toMatch(/clear/i);
  expect(message).toContain("Rex");
});
