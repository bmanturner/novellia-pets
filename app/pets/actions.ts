"use server";

import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { getCurrentHouseholdId } from "@/db/models/household";
import {
  createMedicalRecord,
  deleteMedicalRecord,
  getMedicalRecord,
  MedicalRecordInputSchema,
  updateMedicalRecord,
} from "@/db/models/medical-record";
import {
  createPet,
  deletePet,
  PetInputSchema,
  updatePet,
} from "@/db/models/pet";
import { listSpecies } from "@/db/models/species";
import { toLocalDate } from "@/db/models/care";
import {
  type FormState,
  formValues,
  futureBirthError,
  petFieldErrors,
  petInputFromForm,
  recordFieldErrors,
  recordInputFromForm,
} from "@/lib/forms";
import { parseRecordFilters } from "@/lib/records";
import { routes } from "@/lib/routes";

/** Refreshes every cached page, then leaves the form without adding history. */
function finish(url: string): never {
  revalidatePath("/", "layout");
  redirect(url, RedirectType.replace);
}

function withNotice(url: string, notice: string) {
  return `${url}${url.includes("?") ? "&" : "?"}notice=${notice}`;
}

export async function savePetAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const householdId = await getCurrentHouseholdId();
  const values = formValues(formData);

  const input = petInputFromForm(values);
  const parsed = PetInputSchema.safeParse(input);
  const species = await listSpecies();
  const errors: Record<string, string> = {
    ...futureBirthError(values, toLocalDate(new Date())),
    ...(parsed.success ? {} : petFieldErrors(parsed.error, values)),
  };
  if (
    parsed.success &&
    !species.some(({ id }) => id === parsed.data.speciesId)
  ) {
    errors.speciesId = "Choose a species.";
  }
  if (Object.keys(errors).length > 0) {
    return { values, errors, formError: null };
  }

  if (values.petId) {
    const petId = Number(values.petId);
    const pet = await updatePet(householdId, petId, input);
    if (!pet) {
      return {
        values,
        errors: {},
        formError: "This pet no longer exists.",
      };
    }
    finish(withNotice(routes.pet(pet.id), "pet-updated"));
  }

  const pet = await createPet(householdId, input);
  finish(withNotice(routes.pet(pet.id), "pet-added"));
}

export async function saveRecordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const householdId = await getCurrentHouseholdId();
  const values = formValues(formData);
  const petId = Number(values.petId);

  if (values.recordId) {
    const existing = await getMedicalRecord(
      householdId,
      Number(values.recordId),
    );
    if (!existing || existing.petId !== petId) {
      return {
        values,
        errors: {},
        formError: "This record no longer exists.",
      };
    }
    values.typeId = existing.typeId;
  }

  const input = recordInputFromForm(values);
  const parsed = MedicalRecordInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      values,
      errors: recordFieldErrors(parsed.error, values),
      formError: null,
    };
  }

  if (values.recordId) {
    const record = await updateMedicalRecord(
      householdId,
      Number(values.recordId),
      input,
    );
    if (!record) {
      return {
        values,
        errors: {},
        formError: "This record no longer exists.",
      };
    }
    const filters = parseRecordFilters(values.filterType, values.filterQuery);
    finish(withNotice(routes.petRecords(petId, filters), "record-updated"));
  }

  const record = await createMedicalRecord(householdId, petId, input);
  if (!record) {
    return { values, errors: {}, formError: "This pet no longer exists." };
  }
  finish(
    values.from === "home"
      ? `/?logged=${record.id}`
      : `${routes.pet(petId)}?logged=${record.id}`,
  );
}

export async function deleteRecordAction(formData: FormData): Promise<void> {
  const householdId = await getCurrentHouseholdId();
  const values = formValues(formData);
  await deleteMedicalRecord(householdId, Number(values.recordId));
  const filters = parseRecordFilters(values.filterType, values.filterQuery);
  finish(
    withNotice(
      routes.petRecords(Number(values.petId), filters),
      "record-deleted",
    ),
  );
}

export async function deletePetAction(formData: FormData): Promise<void> {
  const householdId = await getCurrentHouseholdId();
  await deletePet(householdId, Number(formValues(formData).petId));
  finish("/?notice=pet-deleted");
}
