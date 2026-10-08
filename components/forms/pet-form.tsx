"use client";

import { useActionState } from "react";
import { savePetAction } from "@/app/pets/actions";
import {
  FormField,
  FormFooter,
  Input,
  ScopedForm,
  Select,
  Textarea,
} from "@/components/forms/form-controls";
import type { FormState, FormValues } from "@/lib/forms";

export function PetForm({
  mode,
  petId,
  initialValues,
  species,
  cancelHref,
}: {
  mode: "create" | "edit";
  petId?: number;
  initialValues: FormValues;
  species: { id: string; name: string }[];
  cancelHref: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    savePetAction,
    { values: initialValues, errors: {}, formError: null },
  );
  const { values, errors } = state;

  return (
    <ScopedForm action={formAction} errors={errors}>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {state.formError && (
          <p role="alert" className="mb-4 text-[14px] text-danger">
            {state.formError}
          </p>
        )}
        {mode === "edit" && petId !== undefined && (
          <input type="hidden" name="petId" value={petId} />
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Name"
            name="name"
            error={errors.name}
            className="sm:col-span-2"
          >
            <Input
              name="name"
              required
              maxLength={100}
              defaultValue={values.name}
              error={errors.name}
            />
          </FormField>
          <FormField label="Species" name="speciesId" error={errors.speciesId}>
            <Select
              name="speciesId"
              defaultValue={values.speciesId}
              error={errors.speciesId}
            >
              <option value="">Choose a species</option>
              {species.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField
            label="Breed"
            name="breed"
            error={errors.breed}
            hint="For Other, say what the animal is."
          >
            <Input
              name="breed"
              maxLength={100}
              placeholder="e.g. Cairn Terrier"
              defaultValue={values.breed}
              error={errors.breed}
              hint="For Other, say what the animal is."
            />
          </FormField>
          <FormField label="Sex" name="sex" error={errors.sex}>
            <Select name="sex" defaultValue={values.sex} error={errors.sex}>
              <option value="unknown">Unknown</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </Select>
          </FormField>
          <FormField label="Spayed or neutered" name="neutered">
            <Select name="neutered" defaultValue={values.neutered}>
              <option value="">Not recorded</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </FormField>
          <FormField
            label="Date of birth"
            name="dateOfBirth"
            error={errors.dateOfBirth}
            hint="Leave blank if unknown."
          >
            <Input
              name="dateOfBirth"
              type="date"
              defaultValue={values.dateOfBirth}
              error={errors.dateOfBirth}
              hint="Leave blank if unknown."
            />
          </FormField>
          <FormField
            label="Microchip number"
            name="microchipId"
            error={errors.microchipId}
          >
            <Input
              name="microchipId"
              maxLength={50}
              autoComplete="off"
              defaultValue={values.microchipId}
              error={errors.microchipId}
            />
          </FormField>
          <FormField
            label="Notes"
            name="notes"
            error={errors.notes}
            className="sm:col-span-2"
          >
            <Textarea
              name="notes"
              maxLength={2000}
              defaultValue={values.notes}
              error={errors.notes}
            />
          </FormField>
        </div>
      </div>
      <FormFooter
        submitLabel={mode === "create" ? "Add pet" : "Save changes"}
        pendingLabel={mode === "create" ? "Adding…" : "Saving…"}
        cancelHref={cancelHref}
      />
    </ScopedForm>
  );
}
