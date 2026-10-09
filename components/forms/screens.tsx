import { connection } from "next/server";
import { notFound } from "next/navigation";
import { FormPage } from "@/components/form-page";
import { PetForm } from "@/components/forms/pet-form";
import { RecordForm } from "@/components/forms/record-form";
import { RouteDialog } from "@/components/route-dialog";
import {
  getLatestMedicalRecordByTitle,
  getMedicalRecord,
} from "@/db/models/medical-record";
import {
  listMedicalRecordTypes,
  MEDICAL_RECORD_TYPE_IDS,
  type MedicalRecordTypeId,
} from "@/db/models/medical-record-type";
import { toLocalDate } from "@/db/models/care";
import { listSpecies } from "@/db/models/species";
import { addMonths } from "@/lib/dates";
import { formatFullDate } from "@/lib/format";
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

/** Whole months from `from` to `to` (YYYY-MM-DD), rounded to the nearest. */
function monthsBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const months = (ty - fy) * 12 + (tm - fm);
  if (td - fd > 15) return months + 1;
  if (fd - td > 15) return months - 1;
  return months;
}

const LOG_VERBS: Partial<Record<MedicalRecordTypeId, string>> = {
  vaccination: "Log dose",
  medication: "Log refill",
};

/**
 * `?type=…&title=…` from a Next due "Log dose" or "Log refill" link. Only a
 * vaccination or medication with a title counts; anything else is a plain add.
 */
function logTarget(sp: Awaited<SearchParams>) {
  const typeId = MEDICAL_RECORD_TYPE_IDS.find(
    (candidate) => candidate === first(sp.type),
  );
  const title = (first(sp.title) ?? "").trim().slice(0, 200);
  const verb = typeId && LOG_VERBS[typeId];
  return typeId && verb && title ? { typeId, title, verb } : null;
}

/**
 * Frames the add form. Its heading depends on the search params, so the frame
 * itself waits for them (callers wrap it in Suspense).
 */
export async function NewRecordFrame({
  searchParams,
  variant,
  children,
}: {
  searchParams: SearchParams;
  variant: "page" | "dialog";
  children: React.ReactNode;
}) {
  const target = logTarget(await searchParams);
  const title = target ? `${target.verb} · ${target.title}` : "Add record";
  return variant === "page" ? (
    <FormPage title={title}>{children}</FormPage>
  ) : (
    <RouteDialog title={title}>{children}</RouteDialog>
  );
}

export async function NewRecordScreen({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { householdId, pet, today, typeNames, suggestions } =
    await recordFormData(id);

  const rawType = first(sp.type);
  const log = logTarget(sp);
  const typeId =
    MEDICAL_RECORD_TYPE_IDS.find((candidate) => candidate === rawType) ??
    "vaccination";
  const title = (first(sp.title) ?? "").trim().slice(0, 200);
  const from = first(sp.from) === "home" ? "home" : undefined;

  // Logging the next dose or refill starts from the last one of that title.
  const previous = log
    ? await getLatestMedicalRecordByTitle(
        householdId,
        pet.id,
        log.typeId,
        log.title,
      )
    : undefined;
  const interval =
    previous?.occurredOn && previous.dueOn
      ? monthsBetween(previous.occurredOn, previous.dueOn)
      : 0;
  const carried: Record<string, string> = {};
  if (previous?.typeId === "vaccination") {
    carried.clinic = previous.details.clinic ?? "";
  } else if (previous?.typeId === "medication") {
    carried.dosage = previous.details.dosage ?? "";
    carried.frequency = previous.details.frequency ?? "";
    carried.prescribedBy = previous.details.prescribedBy ?? "";
  }
  if (interval > 0) carried.dueOn = addMonths(today, interval);

  const dueNote = previous?.dueOn
    ? `${previous.dueOn < today ? "Was due" : "Due"} ${formatFullDate(previous.dueOn)}`
    : undefined;

  return (
    <RecordForm
      mode="create"
      log={log ? { verb: log.verb, dueNote } : undefined}
      petId={pet.id}
      petName={pet.name}
      initialValues={{
        typeId,
        title,
        occurredOn: typeId === "condition" ? "" : today,
        weightUnit: "kg",
        kind: "allergy",
        ...carried,
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
      today={toLocalDate(new Date())}
    />
  );
}

export async function EditPetScreen({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { pet, today } = await loadPet(id);
  const species = await listSpecies();
  return (
    <PetForm
      mode="edit"
      petId={pet.id}
      initialValues={petFormValues(pet)}
      species={species.map(({ id, name }) => ({ id, name }))}
      cancelHref={routes.pet(pet.id)}
      today={today}
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
