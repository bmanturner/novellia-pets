import type { ActiveCondition, PetCare } from "@/db/models/care";
import { ArrowLeft, FileText, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { Field } from "@/components/field";
import { MicrochipStrip } from "@/components/microchip-strip";
import { SpeciesMark } from "@/components/species-mark";
import { ChatPetContext } from "@/lib/chat/chat-provider";
import { formatAge, formatSex } from "@/lib/format";
import { speciesArtUrl } from "@/lib/species-art";
import { loadPet, loadPetCare, loadPetRecords } from "@/lib/pet-data";
import { routes } from "@/lib/routes";
import { HeaderStamp } from "./header-stamp";
import { PetActionsMenu } from "./pet-actions-menu";
import { PetTabs } from "./pet-tabs";

const LABEL =
  "text-[11px] leading-4 font-semibold tracking-[0.08em] text-ink-muted uppercase";
const SHOWN = 2;

function SafetyGroup({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  const extra = items.length - SHOWN;
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
      <span className={LABEL}>{label}</span>
      <span>
        {items.slice(0, SHOWN).join(", ")}
        {extra > 0 && <span className="text-ink-muted"> +{extra} more</span>}
      </span>
    </span>
  );
}

/** "Any allergies or meds?": the first thing a vet-desk asks, under the name. */
function SafetyLine({ care }: { care: PetCare }) {
  const allergies = care.conditions.filter((c) => c.kind === "allergy");
  const conditions = care.conditions.filter((c) => c.kind === "condition");
  const describe = (c: ActiveCondition) =>
    c.severity ? `${c.title} (${c.severity})` : c.title;
  const meds = care.medications.map((m) =>
    m.dosage ? `${m.title} ${m.dosage}` : m.title,
  );
  if (allergies.length + conditions.length + meds.length === 0) return null;
  return (
    <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[14px] leading-5 break-words">
      <SafetyGroup
        label={allergies.length === 1 ? "Allergy" : "Allergies"}
        items={allergies.map(describe)}
      />
      <SafetyGroup
        label={conditions.length === 1 ? "Condition" : "Conditions"}
        items={conditions.map(describe)}
      />
      <SafetyGroup label="Meds" items={meds} />
    </p>
  );
}

/** The pet as a passport data page, shared by Status, Records and Profile. */
export async function PetHeaderSection({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ pet, today }, care, records] = await Promise.all([
    loadPet(id),
    loadPetCare(id),
    loadPetRecords(id),
  ]);

  return (
    <>
      <ChatPetContext
        pet={{
          id: pet.id,
          name: pet.name,
          species: pet.species,
          art: speciesArtUrl(pet.species.id),
        }}
      />
      <Link
        href={routes.home}
        className="inline-flex items-center gap-1.5 text-[14px] text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Pets
      </Link>

      <section
        aria-labelledby="pet-name"
        className="mt-3 rounded-xl border border-rule bg-page"
      >
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-4 p-4 sm:gap-x-5 sm:p-5">
          <div>
            <div className="sm:hidden">
              <SpeciesMark species={pet.species} size="row" />
            </div>
            <div className="hidden sm:block">
              <SpeciesMark species={pet.species} size="photo" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h1
                id="pet-name"
                className="min-w-0 text-[20px] leading-7 font-extrabold tracking-[0.02em] break-words uppercase sm:text-[24px] sm:leading-8"
              >
                {pet.name}
              </h1>
              <HeaderStamp status={care.status} seed={pet.id} />
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
              <Field label="Species">{pet.species.name}</Field>
              <Field label="Breed">{pet.breed ?? "—"}</Field>
              <Field label="Sex">{formatSex(pet.sex, pet.neutered)}</Field>
              <Field label="Age">
                {pet.dateOfBirth
                  ? formatAge(pet.dateOfBirth, today)
                  : "Unknown"}
              </Field>
            </dl>
            <SafetyLine care={care} />
          </div>
          <div className="col-span-2 flex gap-3 sm:col-span-1 sm:col-start-2 sm:justify-end">
            <Link
              href={routes.newRecord(pet.id)}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-cover px-4 text-[14px] font-semibold text-cover-ink transition-colors duration-150 hover:bg-cover-deep sm:h-10 sm:flex-none"
            >
              <Plus className="size-4" aria-hidden />
              Add record
            </Link>
            <PetActionsMenu
              editHref={routes.editPet(pet.id)}
              summaryHref={routes.petSummary(pet.id)}
            />
            <Link
              href={routes.editPet(pet.id)}
              className="hidden h-10 items-center gap-2 rounded-md border border-cover/25 bg-page px-3.5 text-[14px] font-semibold text-cover transition-colors duration-150 hover:border-cover/50 hover:bg-page-tint sm:inline-flex"
            >
              <Pencil className="size-4" aria-hidden />
              Edit pet
            </Link>
            <Link
              href={routes.petSummary(pet.id)}
              className="hidden h-10 items-center gap-2 rounded-md border border-cover/25 bg-page px-3.5 text-[14px] font-semibold text-cover transition-colors duration-150 hover:border-cover/50 hover:bg-page-tint sm:inline-flex"
            >
              <FileText className="size-4" aria-hidden />
              Vet summary
            </Link>
          </div>
        </div>
        <MicrochipStrip microchipId={pet.microchipId} />
      </section>

      <div className="mt-6">
        <PetTabs petId={pet.id} recordCount={records.length} />
      </div>
    </>
  );
}
