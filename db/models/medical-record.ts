import type { Selectable } from "kysely";
import { z } from "zod";
import { db } from "@/db";
import type { DB } from "@/db/types";
import type { MedicalRecordTypeId } from "./medical-record-type";
import { getPet } from "./pet";
import {
  notApplicable,
  nowIso,
  nullableDate,
  nullableText,
  requiredDate,
} from "./shared";

const sharedFields = {
  title: z.string().trim().min(1).max(200),
  notes: nullableText(2000),
};

// One variant per record type. The `satisfies` fails to compile if a key is
// missing, extra, or doesn't match its variant's `typeId`.
const variants = {
  vaccination: z.object({
    typeId: z.literal("vaccination"),
    ...sharedFields,
    occurredOn: requiredDate,
    endedOn: notApplicable,
    dueOn: nullableDate,
    details: z.object({
      clinic: nullableText(200),
      lotNumber: nullableText(100),
    }),
  }),
  medication: z.object({
    typeId: z.literal("medication"),
    ...sharedFields,
    occurredOn: requiredDate,
    endedOn: nullableDate,
    dueOn: nullableDate,
    details: z.object({
      dosage: nullableText(100),
      frequency: nullableText(100),
      prescribedBy: nullableText(200),
    }),
  }),
  visit: z.object({
    typeId: z.literal("visit"),
    ...sharedFields,
    occurredOn: requiredDate,
    endedOn: notApplicable,
    dueOn: nullableDate,
    details: z.object({
      clinic: nullableText(200),
      veterinarian: nullableText(200),
      // Stored as entered; no unit conversion.
      weight: z
        .object({ value: z.number().positive(), unit: z.enum(["kg", "lb"]) })
        .nullish()
        .transform((value) => value ?? null),
    }),
  }),
  condition: z.object({
    typeId: z.literal("condition"),
    ...sharedFields,
    occurredOn: nullableDate,
    endedOn: nullableDate,
    dueOn: notApplicable,
    details: z.object({
      kind: z.enum(["allergy", "condition"]),
      severity: z
        .enum(["mild", "moderate", "severe"])
        .nullish()
        .transform((value) => value ?? null),
      reaction: nullableText(500),
    }),
  }),
} satisfies {
  [K in MedicalRecordTypeId]: z.ZodObject<
    { typeId: z.ZodLiteral<K> } & z.core.$ZodLooseShape
  >;
};

/** Per-type `details` schemas, for parsing stored details. */
export const recordDetailsSchemas = {
  vaccination: variants.vaccination.shape.details,
  medication: variants.medication.shape.details,
  visit: variants.visit.shape.details,
  condition: variants.condition.shape.details,
};

export type RecordFilters = { typeId?: MedicalRecordTypeId; query?: string };

/** `query` is matched case-insensitively against title and notes after trimming; blank filters are ignored. Keeps input order. */
export function filterMedicalRecords(
  records: MedicalRecord[],
  filters: RecordFilters,
): MedicalRecord[] {
  const query = filters.query?.trim().toLowerCase();
  return records.filter(
    (record) =>
      (!filters.typeId || record.typeId === filters.typeId) &&
      (!query ||
        record.title.toLowerCase().includes(query) ||
        (record.notes?.toLowerCase().includes(query) ?? false)),
  );
}

export const MedicalRecordInputSchema = z
  .discriminatedUnion("typeId", [
    variants.vaccination,
    variants.medication,
    variants.visit,
    variants.condition,
  ])
  .superRefine((record, ctx) => {
    // YYYY-MM-DD strings compare correctly as text.
    if (
      record.occurredOn &&
      record.endedOn &&
      record.endedOn < record.occurredOn
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endedOn"],
        message: "End date can't be before the start date",
      });
      ctx.addIssue({
        code: "custom",
        path: ["occurredOn"],
        message: "Start date must be on or before the end date.",
      });
    }
  });

export type MedicalRecordInput = z.input<typeof MedicalRecordInputSchema>;

export type MedicalRecord = z.output<typeof MedicalRecordInputSchema> & {
  id: number;
  petId: number;
  createdAt: string;
  updatedAt: string;
};

// Kysely builders are immutable, so this base query is safe to share.
const recordsWithPet = db
  .selectFrom("medicalRecord")
  .innerJoin("pet", "pet.id", "medicalRecord.petId")
  .selectAll("medicalRecord");

/** Throws if stored data no longer matches the schema (corrupted data). */
function toMedicalRecord({
  id,
  petId,
  createdAt,
  updatedAt,
  details,
  ...fields
}: Selectable<DB["medicalRecord"]>): MedicalRecord {
  const record = MedicalRecordInputSchema.parse({
    ...fields,
    details: JSON.parse(details),
  });
  return { ...record, id, petId, createdAt, updatedAt };
}

function toColumns(input: MedicalRecordInput) {
  const { details, ...fields } = MedicalRecordInputSchema.parse(input);
  return { ...fields, details: JSON.stringify(details) };
}

export async function listMedicalRecords(
  householdId: number,
  petId: number,
): Promise<MedicalRecord[]> {
  const rows = await recordsWithPet
    .where("pet.householdId", "=", householdId)
    .where("medicalRecord.petId", "=", petId)
    .orderBy("medicalRecord.occurredOn", (ob) => ob.desc().nullsLast())
    .orderBy("medicalRecord.id", "desc")
    .execute();
  return rows.map(toMedicalRecord);
}

export async function getMedicalRecord(
  householdId: number,
  recordId: number,
): Promise<MedicalRecord | undefined> {
  const row = await recordsWithPet
    .where("pet.householdId", "=", householdId)
    .where("medicalRecord.id", "=", recordId)
    .executeTakeFirst();
  return row && toMedicalRecord(row);
}

/**
 * The pet's newest record of `typeId` whose title matches `title` (ignoring
 * case), for pre-filling the next dose or refill. Undated records rank last.
 */
export async function getLatestMedicalRecordByTitle(
  householdId: number,
  petId: number,
  typeId: MedicalRecordTypeId,
  title: string,
): Promise<MedicalRecord | undefined> {
  const row = await recordsWithPet
    .where("pet.householdId", "=", householdId)
    .where("medicalRecord.petId", "=", petId)
    .where("medicalRecord.typeId", "=", typeId)
    .where((eb) =>
      eb(
        eb.fn("lower", ["medicalRecord.title"]),
        "=",
        title.trim().toLowerCase(),
      ),
    )
    .orderBy("medicalRecord.occurredOn", (ob) => ob.desc().nullsLast())
    .orderBy("medicalRecord.id", "desc")
    .executeTakeFirst();
  return row && toMedicalRecord(row);
}

/** Returns `undefined` if the pet isn't in the household. */
export async function createMedicalRecord(
  householdId: number,
  petId: number,
  input: MedicalRecordInput,
): Promise<MedicalRecord | undefined> {
  const values = toColumns(input);
  if (!(await getPet(householdId, petId))) return undefined;
  const row = await db
    .insertInto("medicalRecord")
    .values({ ...values, petId })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toMedicalRecord(row);
}

/** Replaces every editable field; omitted optional fields are cleared. */
export async function updateMedicalRecord(
  householdId: number,
  recordId: number,
  input: MedicalRecordInput,
): Promise<MedicalRecord | undefined> {
  const row = await db
    .updateTable("medicalRecord")
    .set({ ...toColumns(input), updatedAt: nowIso })
    .where("id", "=", recordId)
    .where("petId", "in", (eb) =>
      eb
        .selectFrom("pet")
        .select("pet.id")
        .where("pet.householdId", "=", householdId),
    )
    .returningAll()
    .executeTakeFirst();
  return row && toMedicalRecord(row);
}

export async function deleteMedicalRecord(
  householdId: number,
  recordId: number,
): Promise<boolean> {
  const { numDeletedRows } = await db
    .deleteFrom("medicalRecord")
    .where("id", "=", recordId)
    .where("petId", "in", (eb) =>
      eb
        .selectFrom("pet")
        .select("pet.id")
        .where("pet.householdId", "=", householdId),
    )
    .executeTakeFirst();
  return Number(numDeletedRows) > 0;
}
