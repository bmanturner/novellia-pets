import { expect, test } from "vitest";
import { MedicalRecordInputSchema } from "@/db/models/medical-record";
import { PetInputSchema } from "@/db/models/pet";
import {
  formValues,
  futureBirthError,
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

test("a failed pet submit echoes species, sex and neutered back", () => {
  const formData = new FormData();
  formData.set("name", "Zed");
  formData.set("speciesId", "dog");
  formData.set("sex", "female");
  formData.set("neutered", "yes");
  formData.set("microchipId", "12ab");

  expect(formValues(formData)).toMatchObject({
    name: "Zed",
    speciesId: "dog",
    sex: "female",
    neutered: "yes",
    microchipId: "12ab",
  });
});

test("an empty title says what to enter for the type", () => {
  expect(recordErrors({ ...vaccination, title: "  " })).toEqual({
    title: "Enter the vaccine name.",
  });
  expect(
    recordErrors({ ...vaccination, typeId: "medication", title: "" }),
  ).toEqual({ title: "Enter the medication name." });
  expect(recordErrors({ ...vaccination, title: "x".repeat(201) })).toEqual({
    title: "Keep the title under 200 characters.",
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

test("an end date before the start date is reported on both dates", () => {
  expect(
    recordErrors({
      typeId: "medication",
      title: "Pill",
      occurredOn: "2026-06-15",
      endedOn: "2026-06-01",
    }),
  ).toEqual({
    endedOn: "End date can't be before the start date",
    occurredOn: "Start date must be on or before the end date.",
  });
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

test("a pet form reports every invalid field together", () => {
  const values: FormValues = { name: "", speciesId: "" };
  const result = PetInputSchema.safeParse(petInputFromForm(values));

  expect(result.success ? {} : petFieldErrors(result.error, values)).toEqual({
    name: "Enter your pet's name (up to 100 characters).",
    speciesId: "Choose a species.",
  });
});

test("a non-digit microchip is rejected, spaces and hyphens are ignored", () => {
  const base = { name: "Rex", speciesId: "dog" };
  const bad: FormValues = { ...base, microchipId: "abc" };
  const result = PetInputSchema.safeParse(petInputFromForm(bad));
  expect(result.success ? {} : petFieldErrors(result.error, bad)).toEqual({
    microchipId: "Enter 9 to 15 digits. Spaces and dashes are fine.",
  });

  const good = PetInputSchema.safeParse(
    petInputFromForm({ ...base, microchipId: "981 020-000 123456" }),
  );
  expect(good.success && good.data.microchipId).toBe("981020000123456");
});

test("a birth date after today is rejected", () => {
  expect(futureBirthError({ dateOfBirth: "2026-10-10" }, "2026-10-09")).toEqual(
    { dateOfBirth: "Date of birth can't be in the future." },
  );
  expect(futureBirthError({ dateOfBirth: "2026-10-09" }, "2026-10-09")).toEqual(
    {},
  );
  expect(futureBirthError({ dateOfBirth: "" }, "2026-10-09")).toEqual({});
  expect(futureBirthError({ dateOfBirth: "nope" }, "2026-10-09")).toEqual({});
});
