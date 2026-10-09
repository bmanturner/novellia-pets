import { beforeEach, expect, test } from "vitest";
import { ZodError } from "zod";
import { db } from "@/db";
import { getCurrentHouseholdId } from "./household";
import { createMedicalRecord } from "./medical-record";
import {
  createPet,
  deletePet,
  getPet,
  listPets,
  PetInputSchema,
  updatePet,
} from "./pet";

let householdId: number;
const otherHouseholdId = 2;

beforeEach(async () => {
  householdId = await getCurrentHouseholdId();
  await db
    .insertInto("household")
    .values({ id: otherHouseholdId, name: "Other" })
    .execute();
});

test("createPet fills defaults and joins the species", async () => {
  const pet = await createPet(householdId, { name: "Milo", speciesId: "dog" });

  expect(pet).toMatchObject({
    householdId,
    name: "Milo",
    species: { id: "dog", name: "Dog", emoji: "🐶" },
    breed: null,
    sex: "unknown",
    neutered: null,
  });
});

test("neutered round-trips as a boolean", async () => {
  const pet = await createPet(householdId, {
    name: "Luna",
    speciesId: "cat",
    neutered: false,
  });

  expect(pet.neutered).toBe(false);
  const updated = await updatePet(householdId, pet.id, {
    name: "Luna",
    speciesId: "cat",
    neutered: true,
  });
  expect(updated?.neutered).toBe(true);
});

test("listPets sorts by name case-insensitively", async () => {
  // Binary (case-sensitive) order would be Bella, Luna, alfie, milo.
  for (const name of ["milo", "Bella", "Luna", "alfie"]) {
    await createPet(householdId, { name, speciesId: "dog" });
  }

  const pets = await listPets(householdId);

  expect(pets.map((pet) => pet.name)).toEqual([
    "alfie",
    "Bella",
    "Luna",
    "milo",
  ]);
});

test("pets are invisible and immutable from another household", async () => {
  const milo = await createPet(householdId, { name: "Milo", speciesId: "dog" });

  expect(await getPet(otherHouseholdId, milo.id)).toBeUndefined();
  expect(await listPets(otherHouseholdId)).toEqual([]);
  expect(
    await updatePet(otherHouseholdId, milo.id, {
      name: "Stolen",
      speciesId: "cat",
    }),
  ).toBeUndefined();
  expect(await deletePet(otherHouseholdId, milo.id)).toBe(false);

  expect(await getPet(householdId, milo.id)).toEqual(milo);
});

test("createPet rejects an unknown species", async () => {
  await expect(
    createPet(householdId, { name: "X", speciesId: "dragon" }),
  ).rejects.toThrow(/FOREIGN KEY/);
});

test("createPet rejects a blank name", async () => {
  await expect(
    createPet(householdId, { name: "  ", speciesId: "dog" }),
  ).rejects.toThrow(ZodError);
});

test("microchip numbers are normalized to digits and validated", () => {
  const parse = (microchipId: string | null | undefined) =>
    PetInputSchema.safeParse({ name: "Milo", speciesId: "dog", microchipId });

  expect(parse("985 141 000 987 612").data?.microchipId).toBe(
    "985141000987612",
  );
  expect(parse("985-141.000 123451").data?.microchipId).toBe("985141000123451");
  expect(parse("  ").data?.microchipId).toBeNull();
  expect(parse(undefined).data?.microchipId).toBeNull();

  for (const bad of [
    "abc!!",
    "12345678",
    "1234567890123456",
    "985 141 x00 987",
  ]) {
    const result = parse(bad);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["microchipId"]);
  }
});

test("deletePet removes the pet's medical records", async () => {
  const milo = await createPet(householdId, { name: "Milo", speciesId: "dog" });
  const record = await createMedicalRecord(householdId, milo.id, {
    typeId: "vaccination",
    title: "Rabies",
    occurredOn: "2026-01-10",
    details: {},
  });
  expect(record).toBeDefined();

  expect(await deletePet(householdId, milo.id)).toBe(true);

  expect(await getPet(householdId, milo.id)).toBeUndefined();
  const { count } = await db
    .selectFrom("medicalRecord")
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .executeTakeFirstOrThrow();
  expect(count).toBe(0);
});
