import { expect, test } from "vitest";
import { MedicalRecordInputSchema } from "@/db/models/medical-record";
import { PetInputSchema } from "@/db/models/pet";
import {
  petFieldErrors,
  petInputFromForm,
  recordFieldErrors,
  recordInputFromForm,
} from "./forms";
import type { FormValues } from "./forms";

function recordErrors(values: FormValues) {
  const result = MedicalRecordInputSchema.safeParse(
    recordInputFromForm(values),
  );
  return result.success ? {} : recordFieldErrors(result.error, values);
}

const vaccination: FormValues = {
  typeId: "vaccination",
  title: "Rabies",
  occurredOn: "2026-06-15",
  endedOn: "2026-06-20",
  dueOn: "",
  notes: "",
  clinic: "",
  lotNumber: "",
};

const visit: FormValues = {
  typeId: "visit",
  title: "Checkup",
  occurredOn: "2026-06-15",
  weightValue: "",
  weightUnit: "kg",
};

test("a vaccination input omits fields that don't apply to it", () => {
  const input = recordInputFromForm(vaccination);

  expect(input).not.toHaveProperty("endedOn");
  expect(MedicalRecordInputSchema.safeParse(input).success).toBe(true);
});

test("a blank visit weight becomes null and a bad one is reported", () => {
  expect(recordInputFromForm(visit)).toMatchObject({
    details: { weight: null },
  });
  expect(recordErrors(visit)).toEqual({});
  expect(recordErrors({ ...visit, weightValue: "abc" })).toEqual({
    weightValue: "Enter a weight greater than 0.",
  });
  expect(recordErrors({ ...visit, weightValue: "0" })).toEqual({
    weightValue: "Enter a weight greater than 0.",
  });
  expect(recordInputFromForm({ ...visit, weightValue: "12.5" })).toMatchObject({
    details: { weight: { value: 12.5, unit: "kg" } },
  });
});

test("neutered maps yes, no and blank to true, false and null", () => {
  expect(petInputFromForm({ neutered: "yes" }).neutered).toBe(true);
  expect(petInputFromForm({ neutered: "no" }).neutered).toBe(false);
  expect(petInputFromForm({ neutered: "" }).neutered).toBeNull();
  expect(petInputFromForm({}).sex).toBe("unknown");
});

test("an empty title is reported", () => {
  expect(recordErrors({ ...vaccination, title: "  " })).toEqual({
    title: "Enter a title (up to 200 characters).",
  });
});

test("a missing or malformed date is reported", () => {
  expect(recordErrors({ ...vaccination, occurredOn: "" })).toEqual({
    occurredOn: "Enter the date.",
  });
  expect(recordErrors({ ...vaccination, occurredOn: "June 15" })).toEqual({
    occurredOn: "Enter a valid date.",
  });
});

test("an end date before the start date is reported on the end date", () => {
  expect(
    recordErrors({
      typeId: "medication",
      title: "Pill",
      occurredOn: "2026-06-15",
      endedOn: "2026-06-01",
    }),
  ).toEqual({ endedOn: "End date can't be before the start date" });
});

test("an unknown record type is reported", () => {
  expect(recordErrors({ ...vaccination, typeId: "bogus" })).toEqual({
    typeId: "Choose a record type.",
  });
});

test("pet errors use field messages", () => {
  const values: FormValues = { name: " ", speciesId: "", dateOfBirth: "nope" };
  const result = PetInputSchema.safeParse(petInputFromForm(values));

  expect(result.success).toBe(false);
  expect(result.error && petFieldErrors(result.error, values)).toEqual({
    name: "Enter your pet's name (up to 100 characters).",
    speciesId: "Choose a species.",
    dateOfBirth: "Enter a valid date.",
  });
});
