import { CamelCasePlugin } from "kysely";
import type { Kysely } from "kysely";
import type { MedicalRecordInput } from "../models/medical-record";
import type { PetInput } from "../models/pet";
import type { DB } from "../types";

// Fictional development data: famous movie pets in the default household.
// Re-running replaces that household's data. Dates are relative to today so
// care statuses stay stable: Hooch and Toto are due soon, Mr. Jinx is
// overdue, and the rest are up to date.

const HOUSEHOLD_ID = 1;

const today = new Date();
/** Local calendar date `days` from today, as `YYYY-MM-DD`. */
function daysFromToday(days: number): string {
  const date = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + days,
  );
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

const pets: { pet: PetInput; records: MedicalRecordInput[] }[] = [
  {
    // Marley & Me: up to date. His older rabies record is superseded.
    pet: {
      name: "Marley",
      speciesId: "dog",
      breed: "Labrador Retriever",
      sex: "male",
      neutered: true,
      dateOfBirth: "2019-03-14",
      microchipId: "985141000123451",
      notes:
        "Eats anything not nailed down, including a necklace once. Terrified of thunderstorms.",
    },
    records: [
      {
        typeId: "vaccination",
        title: "Rabies (3-year)",
        occurredOn: daysFromToday(-1500),
        dueOn: daysFromToday(-405),
        details: {
          clinic: "Coconut Creek Animal Hospital",
          lotNumber: "RB-1931",
        },
      },
      {
        typeId: "vaccination",
        title: "Rabies (3-year)",
        occurredOn: daysFromToday(-400),
        dueOn: daysFromToday(695),
        details: {
          clinic: "Coconut Creek Animal Hospital",
          lotNumber: "RB-4472",
        },
      },
      {
        typeId: "vaccination",
        title: "DHPP",
        occurredOn: daysFromToday(-200),
        dueOn: daysFromToday(165),
        details: { clinic: "Coconut Creek Animal Hospital" },
      },
      {
        typeId: "visit",
        title: "Annual wellness exam",
        occurredOn: daysFromToday(-200),
        notes: "Healthy. Recommend fewer socks in the diet.",
        details: {
          clinic: "Coconut Creek Animal Hospital",
          veterinarian: "Dr. Platt",
          weight: { value: 44, unit: "kg" },
        },
      },
      {
        typeId: "condition",
        title: "Thunderstorm phobia",
        occurredOn: daysFromToday(-1800),
        details: {
          kind: "condition",
          severity: "moderate",
          reaction: "Panics and chews through doors and drywall during storms.",
        },
      },
      {
        typeId: "medication",
        title: "Trazodone",
        occurredOn: daysFromToday(-180),
        dueOn: daysFromToday(75),
        notes: "Refill date.",
        details: {
          dosage: "100 mg",
          frequency: "Before storms, as needed",
          prescribedBy: "Dr. Platt",
        },
      },
    ],
  },
  {
    // Turner & Hooch: DHPP due soon.
    pet: {
      name: "Hooch",
      speciesId: "dog",
      breed: "Dogue de Bordeaux",
      sex: "male",
      neutered: false,
      dateOfBirth: "2020-08-02",
      microchipId: "985141000987612",
      notes: "Drools on everything. Once ate the inside of a car.",
    },
    records: [
      {
        typeId: "vaccination",
        title: "DHPP",
        occurredOn: daysFromToday(-353),
        dueOn: daysFromToday(12),
        details: { clinic: "Cypress Beach Veterinary", lotNumber: "DH-2208" },
      },
      {
        typeId: "vaccination",
        title: "Rabies (3-year)",
        occurredOn: daysFromToday(-200),
        dueOn: daysFromToday(895),
        details: { clinic: "Cypress Beach Veterinary" },
      },
      {
        typeId: "visit",
        title: "Annual wellness exam",
        occurredOn: daysFromToday(-353),
        details: {
          clinic: "Cypress Beach Veterinary",
          veterinarian: "Dr. Emily Carson",
          weight: { value: 54, unit: "kg" },
        },
      },
      {
        typeId: "condition",
        title: "Chicken",
        occurredOn: daysFromToday(-700),
        details: {
          kind: "allergy",
          severity: "mild",
          reaction: "Itchy ears and paws.",
        },
      },
      {
        typeId: "medication",
        title: "Apoquel",
        occurredOn: daysFromToday(-60),
        dueOn: daysFromToday(40),
        notes: "Refill date.",
        details: {
          dosage: "16 mg",
          frequency: "Once daily",
          prescribedBy: "Dr. Emily Carson",
        },
      },
    ],
  },
  {
    // Meet the Parents: FVRCP overdue.
    pet: {
      name: "Mr. Jinx",
      speciesId: "cat",
      breed: "Himalayan",
      sex: "male",
      neutered: true,
      dateOfBirth: "2017-05-20",
      notes: "Uses the human toilet and flushes. Keep away from urns.",
    },
    records: [
      {
        typeId: "vaccination",
        title: "FVRCP",
        occurredOn: daysFromToday(-374),
        dueOn: daysFromToday(-9),
        details: { clinic: "Oyster Bay Cat Clinic", lotNumber: "FV-0815" },
      },
      {
        typeId: "vaccination",
        title: "Rabies (1-year)",
        occurredOn: daysFromToday(-9),
        dueOn: daysFromToday(356),
        details: { clinic: "Oyster Bay Cat Clinic" },
      },
      {
        typeId: "visit",
        title: "Dental cleaning",
        occurredOn: daysFromToday(-120),
        details: {
          clinic: "Oyster Bay Cat Clinic",
          veterinarian: "Dr. Byrnes",
          weight: { value: 5.2, unit: "kg" },
        },
      },
      {
        typeId: "condition",
        title: "Hairballs",
        occurredOn: daysFromToday(-900),
        details: { kind: "condition", severity: "mild" },
      },
    ],
  },
  {
    // The Wizard of Oz: rabies due soon.
    pet: {
      name: "Toto",
      speciesId: "dog",
      breed: "Cairn Terrier",
      sex: "female",
      neutered: true,
      dateOfBirth: "2021-06-01",
      microchipId: "985141000556677",
      notes: "Pulls back curtains. Bit a neighbor (Miss Gulch); keep leashed.",
    },
    records: [
      {
        typeId: "vaccination",
        title: "Rabies (1-year)",
        occurredOn: daysFromToday(-345),
        dueOn: daysFromToday(20),
        details: { clinic: "Emerald City Animal Clinic" },
      },
      {
        typeId: "vaccination",
        title: "Bordetella",
        occurredOn: daysFromToday(-100),
        dueOn: daysFromToday(265),
        details: { clinic: "Emerald City Animal Clinic", lotNumber: "BD-1939" },
      },
      {
        typeId: "visit",
        title: "Annual wellness exam",
        occurredOn: daysFromToday(-345),
        notes: "Recovering well from a long trip by tornado.",
        details: {
          clinic: "Emerald City Animal Clinic",
          veterinarian: "Dr. Marvel",
          weight: { value: 16, unit: "lb" },
        },
      },
      {
        typeId: "medication",
        title: "Heartgard Plus",
        occurredOn: daysFromToday(-30),
        dueOn: daysFromToday(45),
        notes: "Refill date.",
        details: {
          dosage: "1 chewable (up to 25 lb)",
          frequency: "Monthly",
          prescribedBy: "Dr. Marvel",
        },
      },
    ],
  },
  {
    // Harry Potter: up to date; a resolved condition.
    pet: {
      name: "Hedwig",
      speciesId: "bird",
      breed: "Snowy owl",
      sex: "female",
      notes: "Delivers mail. Prefers to be fed bacon.",
    },
    records: [
      {
        typeId: "visit",
        title: "Avian wellness exam",
        occurredOn: daysFromToday(-90),
        dueOn: daysFromToday(275),
        details: {
          clinic: "Eeylops Owl Emporium",
          veterinarian: "Dr. Grubbly-Plank",
          weight: { value: 2.1, unit: "kg" },
        },
      },
      {
        typeId: "condition",
        title: "Feather plucking",
        occurredOn: daysFromToday(-400),
        endedOn: daysFromToday(-300),
        notes: "Resolved after the cage door was left open.",
        details: { kind: "condition", severity: "mild" },
      },
    ],
  },
  {
    // Ratatouille: up to date. The ended medication's past due date doesn't count.
    pet: {
      name: "Remy",
      speciesId: "rat",
      breed: "Brown rat",
      sex: "male",
      neutered: false,
      notes:
        "Exceptional sense of smell. Cooks. Keep out of restaurant kitchens.",
    },
    records: [
      {
        typeId: "condition",
        title: "Respiratory infection",
        occurredOn: daysFromToday(-60),
        endedOn: daysFromToday(-40),
        details: {
          kind: "condition",
          severity: "moderate",
          reaction: "Sneezing and red staining around the eyes.",
        },
      },
      {
        typeId: "medication",
        title: "Doxycycline",
        occurredOn: daysFromToday(-60),
        endedOn: daysFromToday(-46),
        dueOn: daysFromToday(-40),
        notes: "Recheck date.",
        details: {
          dosage: "5 mg",
          frequency: "Twice daily for 14 days",
          prescribedBy: "Dr. Gusteau",
        },
      },
      {
        typeId: "visit",
        title: "Recheck",
        occurredOn: daysFromToday(-40),
        notes: "Infection cleared.",
        details: {
          clinic: "Gusteau's Exotic Vets",
          veterinarian: "Dr. Gusteau",
          weight: { value: 0.45, unit: "kg" },
        },
      },
      {
        typeId: "condition",
        title: "Blue cheese",
        occurredOn: daysFromToday(-200),
        details: {
          kind: "allergy",
          severity: "mild",
          reaction: "Upset stomach.",
        },
      },
    ],
  },
];

export async function seed(rawDb: Kysely<DB>): Promise<void> {
  // kysely-ctl passes a connection without plugins; match the generated
  // camelCase types.
  const db = rawDb.withPlugin(new CamelCasePlugin());

  await db.transaction().execute(async (trx) => {
    // Cascades to the household's pets and their records.
    await trx.deleteFrom("household").where("id", "=", HOUSEHOLD_ID).execute();
    await trx
      .insertInto("household")
      .values({ id: HOUSEHOLD_ID, name: "My household" })
      .execute();

    for (const { pet, records } of pets) {
      const { id: petId } = await trx
        .insertInto("pet")
        .values({
          ...pet,
          householdId: HOUSEHOLD_ID,
          neutered: pet.neutered == null ? null : Number(pet.neutered),
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      for (const { details, ...record } of records) {
        await trx
          .insertInto("medicalRecord")
          .values({ ...record, petId, details: JSON.stringify(details) })
          .execute();
      }
    }
  });
}
