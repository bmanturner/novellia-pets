import type { Selectable } from "kysely";
import { z } from "zod";
import { db } from "@/db";
import type { DB } from "@/db/types";
import { nowIso, nullableDate, nullableText } from "./shared";

export const PET_SEXES = ["female", "male", "unknown"] as const;
export type PetSex = (typeof PET_SEXES)[number];

/**
 * Optional microchip number: blank becomes `null`; spaces, dashes and dots are
 * stripped and the rest must be 9 to 15 digits, stored as digits only.
 */
export const microchipSchema = z
  .string()
  .trim()
  .max(50)
  .nullish()
  .transform((value) => (value ? value.replace(/[\s.-]/g, "") : null))
  .pipe(
    z
      .string()
      .regex(/^\d{9,15}$/, "Enter 9 to 15 digits. Spaces and dashes are fine.")
      .nullable(),
  );

export const PetInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  speciesId: z.string().min(1),
  breed: nullableText(100),
  sex: z.enum(PET_SEXES).default("unknown"),
  neutered: z
    .boolean()
    .nullish()
    .transform((value) => value ?? null),
  dateOfBirth: nullableDate,
  microchipId: microchipSchema,
  notes: nullableText(2000),
});

export type PetInput = z.input<typeof PetInputSchema>;

export type Pet = {
  id: number;
  householdId: number;
  name: string;
  species: { id: string; name: string; emoji: string };
  breed: string | null;
  sex: PetSex;
  neutered: boolean | null;
  dateOfBirth: string | null;
  microchipId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type PetRow = Selectable<DB["pet"]> & {
  speciesName: string;
  speciesEmoji: string;
};

// Kysely builders are immutable, so this base query is safe to share.
const petsWithSpecies = db
  .selectFrom("pet")
  .innerJoin("species", "species.id", "pet.speciesId")
  .selectAll("pet")
  .select(["species.name as speciesName", "species.emoji as speciesEmoji"]);

function toPet({ speciesId, speciesName, speciesEmoji, ...row }: PetRow): Pet {
  return {
    ...row,
    species: { id: speciesId, name: speciesName, emoji: speciesEmoji },
    sex: z.enum(PET_SEXES).parse(row.sex),
    neutered: row.neutered === null ? null : row.neutered === 1,
  };
}

function toColumns(input: PetInput) {
  const { neutered, ...values } = PetInputSchema.parse(input);
  return { ...values, neutered: neutered === null ? null : Number(neutered) };
}

export async function listPets(householdId: number): Promise<Pet[]> {
  const rows = await petsWithSpecies
    .where("pet.householdId", "=", householdId)
    .orderBy((eb) => eb.fn("lower", ["pet.name"]))
    .orderBy("pet.id")
    .execute();
  return rows.map(toPet);
}

export async function getPet(
  householdId: number,
  petId: number,
): Promise<Pet | undefined> {
  const row = await petsWithSpecies
    .where("pet.householdId", "=", householdId)
    .where("pet.id", "=", petId)
    .executeTakeFirst();
  return row && toPet(row);
}

export async function createPet(
  householdId: number,
  input: PetInput,
): Promise<Pet> {
  const { id } = await db
    .insertInto("pet")
    .values({ ...toColumns(input), householdId })
    .returning("id")
    .executeTakeFirstOrThrow();
  const pet = await getPet(householdId, id);
  if (!pet) throw new Error(`Pet ${id} not found after insert`);
  return pet;
}

/** Replaces every editable field; omitted optional fields are cleared. */
export async function updatePet(
  householdId: number,
  petId: number,
  input: PetInput,
): Promise<Pet | undefined> {
  const { numUpdatedRows } = await db
    .updateTable("pet")
    .set({ ...toColumns(input), updatedAt: nowIso })
    .where("id", "=", petId)
    .where("householdId", "=", householdId)
    .executeTakeFirst();
  if (Number(numUpdatedRows) === 0) return undefined;
  return getPet(householdId, petId);
}

/** Deletes the pet and, by cascade, its medical records. */
export async function deletePet(
  householdId: number,
  petId: number,
): Promise<boolean> {
  const { numDeletedRows } = await db
    .deleteFrom("pet")
    .where("id", "=", petId)
    .where("householdId", "=", householdId)
    .executeTakeFirst();
  return Number(numDeletedRows) > 0;
}
