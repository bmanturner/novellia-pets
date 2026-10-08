import { beforeEach, expect, test } from "vitest";
import { db } from "@/db";
import { getCurrentHouseholdId } from "./household";
import {
  createMedicalRecord,
  deleteMedicalRecord,
  getMedicalRecord,
  listMedicalRecords,
  MedicalRecordInputSchema,
  updateMedicalRecord,
} from "./medical-record";
import type { MedicalRecordInput } from "./medical-record";
import { createPet } from "./pet";

let householdId: number;
let petId: number;
const otherHouseholdId = 2;

const rabies: MedicalRecordInput = {
  typeId: "vaccination",
  title: "Rabies",
  occurredOn: "2026-01-10",
  dueOn: "2027-01-10",
  details: { clinic: "Fictional Vet" },
};

beforeEach(async () => {
  householdId = await getCurrentHouseholdId();
  await db
    .insertInto("household")
    .values({ id: otherHouseholdId, name: "Other" })
    .execute();
  ({ id: petId } = await createPet(householdId, {
    name: "Milo",
    speciesId: "dog",
  }));
});

test("a vaccination round-trips with normalized details", async () => {
  const created = await createMedicalRecord(householdId, petId, rabies);

  expect(created).toMatchObject({
    petId,
    typeId: "vaccination",
    title: "Rabies",
    occurredOn: "2026-01-10",
    endedOn: null,
    dueOn: "2027-01-10",
    notes: null,
    details: { clinic: "Fictional Vet", lotNumber: null },
  });
  expect(await getMedicalRecord(householdId, created!.id)).toEqual(created);
});

test("updateMedicalRecord can change the record type", async () => {
  const created = await createMedicalRecord(householdId, petId, rabies);

  const updated = await updateMedicalRecord(householdId, created!.id, {
    typeId: "condition",
    title: "Chicken allergy",
    details: { kind: "allergy", severity: "mild" },
  });

  expect(updated).toMatchObject({
    typeId: "condition",
    occurredOn: null,
    dueOn: null,
    details: { kind: "allergy", severity: "mild", reaction: null },
  });
});

// Form input is untyped, so these rules must also hold at runtime.
test("a condition can't have a due date", () => {
  const result = MedicalRecordInputSchema.safeParse({
    typeId: "condition",
    title: "Arthritis",
    dueOn: "2027-01-01",
    details: { kind: "condition" },
  });

  expect(result.error?.issues.map((issue) => issue.path)).toEqual([["dueOn"]]);
});

test("the end date can't be before the start date", () => {
  const result = MedicalRecordInputSchema.safeParse({
    typeId: "medication",
    title: "Carprofen",
    occurredOn: "2026-05-01",
    endedOn: "2026-04-01",
    details: {},
  });

  expect(result.error?.issues.map((issue) => issue.path)).toEqual([
    ["endedOn"],
  ]);
});

test("records are invisible and immutable from another household", async () => {
  const created = await createMedicalRecord(householdId, petId, rabies);
  const id = created!.id;

  expect(
    await createMedicalRecord(otherHouseholdId, petId, rabies),
  ).toBeUndefined();
  expect(await getMedicalRecord(otherHouseholdId, id)).toBeUndefined();
  expect(await listMedicalRecords(otherHouseholdId, petId)).toEqual([]);
  expect(
    await updateMedicalRecord(otherHouseholdId, id, { ...rabies, title: "X" }),
  ).toBeUndefined();
  expect(await deleteMedicalRecord(otherHouseholdId, id)).toBe(false);

  expect(await getMedicalRecord(householdId, id)).toEqual(created);
  expect(await deleteMedicalRecord(householdId, id)).toBe(true);
});

test("records list newest first, undated ones last", async () => {
  await createMedicalRecord(householdId, petId, {
    typeId: "condition",
    title: "Undated allergy",
    details: { kind: "allergy" },
  });
  await createMedicalRecord(householdId, petId, rabies);
  await createMedicalRecord(householdId, petId, {
    ...rabies,
    title: "Distemper",
    occurredOn: "2026-03-01",
  });

  const records = await listMedicalRecords(householdId, petId);

  expect(records.map((record) => record.title)).toEqual([
    "Distemper",
    "Rabies",
    "Undated allergy",
  ]);
});

test("JSON-looking notes come back as plain text", async () => {
  const created = await createMedicalRecord(householdId, petId, {
    ...rabies,
    notes: "[1,2]",
  });

  expect((await getMedicalRecord(householdId, created!.id))?.notes).toBe(
    "[1,2]",
  );
});
