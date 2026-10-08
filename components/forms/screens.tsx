import { connection } from "next/server";
import { notFound } from "next/navigation";
import { PetForm } from "@/components/forms/pet-form";
import { RecordForm } from "@/components/forms/record-form";
import { getMedicalRecord } from "@/db/models/medical-record";
import {
  listMedicalRecordTypes,
  MEDICAL_RECORD_TYPE_IDS,
  type MedicalRecordTypeId,
} from "@/db/models/medical-record-type";
import { listSpecies } from "@/db/models/species";
import { petFormValues, recordFormValues } from "@/lib/forms";
import { loadPet, loadPetRecords } from "@/lib/pet-data";
import { parseRecordFilters, titleSuggestions } from "@/lib/records";
import { routes } from "@/lib/routes";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function recordFormData(rawPetId: string) {
  const [{ householdId, pet, today }, records, types] = await Promise.all([
    loadPet(rawPetId),
    loadPetRecords(rawPetId),
    listMedicalRecordTypes(),
  ]);
  const typeNames = Object.fromEntries(
    types.map(({ id, name }) => [id, name]),
  ) as Record<MedicalRecordTypeId, string>;
  return {
    householdId,
    pet,
    today,
    typeNames,
    suggestions: titleSuggestions(records),
  };
}

export async function NewRecordScreen({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { pet, today, typeNames, suggestions } = await recordFormData(id);

  const rawType = first(sp.type);
  const typeId =
    MEDICAL_RECORD_TYPE_IDS.find((candidate) => candidate === rawType) ??
    "vaccination";
  const title = (first(sp.title) ?? "").trim().slice(0, 200);
  const from = first(sp.from) === "home" ? "home" : undefined;

  return (
    <RecordForm
      mode="create"
      petId={pet.id}
      petName={pet.name}
      initialValues={{
        typeId,
        title,
        occurredOn: typeId === "condition" ? "" : today,
        weightUnit: "kg",
        kind: "allergy",
      }}
      typeNames={typeNames}
      suggestions={suggestions}
      from={from}
      cancelHref={from === "home" ? routes.home : routes.pet(pet.id)}
      today={today}
    />
  );
}

export async function EditRecordScreen({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; recordId: string }>;
  searchParams: SearchParams;
}) {
  const [{ id, recordId }, sp] = await Promise.all([params, searchParams]);
  const { householdId, pet, today, typeNames, suggestions } =
    await recordFormData(id);

  const record = /^\d+$/.test(recordId)
    ? await getMedicalRecord(householdId, Number(recordId))
    : undefined;
  if (!record || record.petId !== pet.id) notFound();

  const filters = parseRecordFilters(sp.type, sp.q);

  return (
    <RecordForm
      mode="edit"
      petId={pet.id}
      petName={pet.name}
      recordId={record.id}
      initialValues={recordFormValues(record)}
      typeNames={typeNames}
      suggestions={suggestions}
      filters={filters}
      cancelHref={routes.petRecords(pet.id, filters)}
      today={today}
    />
  );
}

export async function NewPetScreen() {
  await connection();
  const species = await listSpecies();
  return (
    <PetForm
      mode="create"
      initialValues={{ ...petFormValues(null), sex: "unknown" }}
      species={species.map(({ id, name }) => ({ id, name }))}
      cancelHref={routes.home}
    />
  );
}

export async function EditPetScreen({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { pet } = await loadPet(id);
  const species = await listSpecies();
  return (
    <PetForm
      mode="edit"
      petId={pet.id}
      initialValues={petFormValues(pet)}
      species={species.map(({ id, name }) => ({ id, name }))}
      cancelHref={routes.pet(pet.id)}
    />
  );
}

export function FormSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading form"
      className="grid gap-4 px-5 py-5"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="h-10 animate-pulse rounded-md bg-rule/60" />
      ))}
    </div>
  );
}
