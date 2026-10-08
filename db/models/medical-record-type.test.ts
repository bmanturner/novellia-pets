import { expect, expectTypeOf, test } from "vitest";
import type { z } from "zod";
import type { MedicalRecordInputSchema } from "./medical-record";
import {
  listMedicalRecordTypes,
  MEDICAL_RECORD_TYPE_IDS,
} from "./medical-record-type";
import type { MedicalRecordTypeId } from "./medical-record-type";

test("the code's record types match the migrated rows, in order", async () => {
  const types = await listMedicalRecordTypes();

  expect(types.map((type) => type.id)).toEqual([...MEDICAL_RECORD_TYPE_IDS]);
});

// Checked by `npm run typecheck`: the schema's union must include every type.
test("the record schema has a variant for every record type", () => {
  expectTypeOf<
    z.output<typeof MedicalRecordInputSchema>["typeId"]
  >().toEqualTypeOf<MedicalRecordTypeId>();
});
