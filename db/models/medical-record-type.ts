import type { Selectable } from "kysely";
import { db } from "@/db";
import type { DB } from "@/db/types";

/** Must match the rows in the `medical_record_type` table. */
export const MEDICAL_RECORD_TYPE_IDS = [
  "vaccination",
  "medication",
  "visit",
  "condition",
] as const;

export type MedicalRecordTypeId = (typeof MEDICAL_RECORD_TYPE_IDS)[number];

export type MedicalRecordType = Selectable<DB["medicalRecordType"]>;

export async function listMedicalRecordTypes(): Promise<MedicalRecordType[]> {
  return db
    .selectFrom("medicalRecordType")
    .selectAll()
    .orderBy("sortOrder")
    .execute();
}
