import "server-only";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { getPetCare, toLocalDate } from "@/db/models/care";
import { getCurrentHouseholdId } from "@/db/models/household";
import { listMedicalRecords } from "@/db/models/medical-record";
import { getPet } from "@/db/models/pet";

/** The household's pet for a raw route id; 404s on a malformed or unknown id. Cached per request. */
export const loadPet = cache(async (rawId: string) => {
  // The database is synchronous sqlite; opt out of prerendering explicitly.
  await connection();
  const id = /^\d+$/.test(rawId) ? Number(rawId) : NaN;
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  const householdId = await getCurrentHouseholdId();
  const pet = await getPet(householdId, id);
  if (!pet) notFound();
  return { householdId, pet, today: toLocalDate(new Date()) };
});

export const loadPetRecords = cache(async (rawId: string) => {
  const { householdId, pet } = await loadPet(rawId);
  return listMedicalRecords(householdId, pet.id);
});

export const loadPetCare = cache(async (rawId: string) => {
  const { householdId, pet, today } = await loadPet(rawId);
  return getPetCare(householdId, pet, today);
});
