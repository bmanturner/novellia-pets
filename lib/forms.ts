import type { z } from "zod";
import type {
  MedicalRecord,
  MedicalRecordInput,
} from "@/db/models/medical-record";
import { MEDICAL_RECORD_TYPE_IDS } from "@/db/models/medical-record-type";
import type { MedicalRecordTypeId } from "@/db/models/medical-record-type";
import type { Pet, PetInput } from "@/db/models/pet";
import { isIsoDate } from "@/lib/dates";

export type FormValues = Record<string, string>;
export type FormState = {
  values: FormValues;
  errors: Record<string, string>;
  formError: string | null;
};

/** String entries of `formData`, skipping React's `$ACTION_*` bookkeeping fields. */
export function formValues(formData: FormData): FormValues {
  const values: FormValues = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$")) values[key] = value;
  }
  return values;
}

const DATE_FIELDS = new Set(["occurredOn", "endedOn", "dueOn", "dateOfBirth"]);

const FIELD_MESSAGES: Record<string, string> = {
  name: "Enter your pet's name (up to 100 characters).",
  speciesId: "Choose a species.",
  sex: "Choose a sex.",
  breed: "Keep the breed under 100 characters.",
  microchipId: "Enter 9 to 15 digits. Spaces and dashes are fine.",
  notes: "Keep notes under 2,000 characters.",
  typeId: "Choose a record type.",
  title: "Enter a title (up to 200 characters).",
  clinic: "Keep this under 200 characters.",
  prescribedBy: "Keep this under 200 characters.",
  veterinarian: "Keep this under 200 characters.",
  lotNumber: "Keep this under 100 characters.",
  dosage: "Keep this under 100 characters.",
  frequency: "Keep this under 100 characters.",
  reaction: "Keep this under 500 characters.",
  weightValue: "Enter a weight greater than 0.",
  kind: "Choose allergy or condition.",
  severity: "Choose a severity.",
};

/** A blank title says what to enter for the record's type. */
const TITLE_REQUIRED: Record<string, string> = {
  vaccination: "Enter the vaccine name.",
  medication: "Enter the medication name.",
  visit: "Enter what the visit was for.",
  condition: "Enter the allergy or condition.",
};

function fieldOf(path: PropertyKey[]): string {
  const [head, second] = path.map(String);
  if (head !== "details") return head ?? "";
  return second === "weight" ? "weightValue" : (second ?? "details");
}

/** First issue per field, as a user-facing message. */
function fieldErrors(error: z.ZodError, v: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = fieldOf(issue.path);
    if (field in errors) continue;
    if (field === "title") {
      errors[field] =
        issue.code === "too_big"
          ? "Keep the title under 200 characters."
          : (TITLE_REQUIRED[v.typeId ?? ""] ?? FIELD_MESSAGES.title);
    } else if (issue.code === "custom") {
      errors[field] = issue.message;
    } else if (DATE_FIELDS.has(field)) {
      errors[field] = v[field]?.trim()
        ? "Enter a valid date."
        : "Enter the date.";
    } else {
      errors[field] = FIELD_MESSAGES[field] ?? issue.message;
    }
  }
  return errors;
}

export const petFieldErrors = fieldErrors;
export const recordFieldErrors = fieldErrors;

/** A birth date after `today`, which the schema alone can't know about. */
export function futureBirthError(
  v: FormValues,
  today: string,
): Record<string, string> {
  const born = v.dateOfBirth?.trim();
  return born && isIsoDate(born) && born > today
    ? { dateOfBirth: "Date of birth can't be in the future." }
    : {};
}

export function petInputFromForm(v: FormValues): PetInput {
  return {
    name: v.name ?? "",
    speciesId: v.speciesId ?? "",
    breed: v.breed ?? "",
    sex: (v.sex || "unknown") as PetInput["sex"],
    neutered: v.neutered === "yes" ? true : v.neutered === "no" ? false : null,
    dateOfBirth: v.dateOfBirth ?? "",
    microchipId: v.microchipId ?? "",
    notes: v.notes ?? "",
  };
}

export function petFormValues(pet: Pet | null): FormValues {
  if (!pet) {
    return {
      name: "",
      speciesId: "",
      breed: "",
      sex: "unknown",
      neutered: "",
      dateOfBirth: "",
      microchipId: "",
      notes: "",
    };
  }
  return {
    name: pet.name,
    speciesId: pet.species.id,
    breed: pet.breed ?? "",
    sex: pet.sex,
    neutered: pet.neutered === null ? "" : pet.neutered ? "yes" : "no",
    dateOfBirth: pet.dateOfBirth ?? "",
    microchipId: pet.microchipId ?? "",
    notes: pet.notes ?? "",
  };
}

function isTypeId(value: string): value is MedicalRecordTypeId {
  return (MEDICAL_RECORD_TYPE_IDS as readonly string[]).includes(value);
}

/** Only the fields valid for the type: inapplicable ones must stay absent. */
export function recordInputFromForm(v: FormValues): MedicalRecordInput {
  const get = (key: string) => v[key] ?? "";
  const typeId = get("typeId");
  const shared = {
    title: get("title"),
    notes: get("notes"),
  };
  if (!isTypeId(typeId)) {
    return { ...shared, typeId } as unknown as MedicalRecordInput;
  }
  switch (typeId) {
    case "vaccination":
      return {
        typeId,
        ...shared,
        occurredOn: get("occurredOn"),
        dueOn: get("dueOn"),
        details: { clinic: get("clinic"), lotNumber: get("lotNumber") },
      };
    case "medication":
      return {
        typeId,
        ...shared,
        occurredOn: get("occurredOn"),
        endedOn: get("endedOn"),
        dueOn: get("dueOn"),
        details: {
          dosage: get("dosage"),
          frequency: get("frequency"),
          prescribedBy: get("prescribedBy"),
        },
      };
    case "visit":
      return {
        typeId,
        ...shared,
        occurredOn: get("occurredOn"),
        dueOn: get("dueOn"),
        details: {
          clinic: get("clinic"),
          veterinarian: get("veterinarian"),
          weight: get("weightValue").trim()
            ? {
                value: Number(get("weightValue")),
                unit: get("weightUnit") as "kg" | "lb",
              }
            : null,
        },
      };
    case "condition":
      return {
        typeId,
        ...shared,
        occurredOn: get("occurredOn"),
        endedOn: get("endedOn"),
        details: {
          kind: get("kind") as "allergy" | "condition",
          severity: (get("severity") || null) as
            "mild" | "moderate" | "severe" | null,
          reaction: get("reaction"),
        },
      };
  }
}

export function recordFormValues(record: MedicalRecord): FormValues {
  const values: FormValues = {
    typeId: record.typeId,
    title: record.title,
    occurredOn: record.occurredOn ?? "",
    endedOn: record.endedOn ?? "",
    dueOn: record.dueOn ?? "",
    notes: record.notes ?? "",
    clinic: "",
    lotNumber: "",
    dosage: "",
    frequency: "",
    prescribedBy: "",
    veterinarian: "",
    weightValue: "",
    weightUnit: "kg",
    kind: "",
    severity: "",
    reaction: "",
  };
  switch (record.typeId) {
    case "vaccination":
      values.clinic = record.details.clinic ?? "";
      values.lotNumber = record.details.lotNumber ?? "";
      break;
    case "medication":
      values.dosage = record.details.dosage ?? "";
      values.frequency = record.details.frequency ?? "";
      values.prescribedBy = record.details.prescribedBy ?? "";
      break;
    case "visit": {
      const { weight } = record.details;
      values.clinic = record.details.clinic ?? "";
      values.veterinarian = record.details.veterinarian ?? "";
      values.weightValue = weight ? String(weight.value) : "";
      values.weightUnit = weight?.unit ?? "kg";
      break;
    }
    case "condition":
      values.kind = record.details.kind;
      values.severity = record.details.severity ?? "";
      values.reaction = record.details.reaction ?? "";
      break;
  }
  return values;
}
