import { connection } from "next/server";
import type { CareStatus } from "@/db/models/care";
import {
  listActiveMedications,
  listDueItems,
  listPetCareSummaries,
  toLocalDate,
} from "@/db/models/care";
import { getCurrentHouseholdId } from "@/db/models/household";
import { getMedicalRecord } from "@/db/models/medical-record";
import { Toast } from "@/components/toast";
import { FirstRun } from "./first-run";
import { Medications } from "./medications";
import { NextDue } from "./next-due";
import { PetRoster, type RosterView } from "./pet-roster";

const CARE_STATUSES: CareStatus[] = ["overdue", "due-soon", "up-to-date"];
const DUE_LIMIT = 5;

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await connection();
  const params = await searchParams;
  const today = toLocalDate(new Date());
  const householdId = await getCurrentHouseholdId();

  const query = first(params.q)?.trim().slice(0, 100) || undefined;
  const speciesId = first(params.species) || undefined;
  const status = CARE_STATUSES.find((value) => value === first(params.status));
  const loggedId = Number(first(params.logged));
  const showAllDue = first(params.due) === "all";
  const view: RosterView = first(params.view) === "list" ? "list" : "card";

  function dueHref(all: boolean): string {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (speciesId) next.set("species", speciesId);
    if (status) next.set("status", status);
    if (view === "list") next.set("view", "list");
    if (all) next.set("due", "all");
    const search = next.toString();
    return search ? `/?${search}` : "/";
  }

  const [all, matching, dueItems, medications, logged] = await Promise.all([
    listPetCareSummaries(householdId, today),
    listPetCareSummaries(householdId, today, { query, speciesId }),
    listDueItems(householdId, today),
    listActiveMedications(householdId, today),
    Number.isInteger(loggedId) && loggedId > 0
      ? getMedicalRecord(householdId, loggedId)
      : undefined,
  ]);

  if (all.length === 0) return <FirstRun />;

  const nextBeyond =
    all
      .flatMap((summary) => (summary.nextDue ? [summary.nextDue] : []))
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)[0] ?? null;
  const speciesOptions = [
    ...new Map(all.map(({ pet }) => [pet.species.id, pet.species])).values(),
  ].sort((a, b) => a.name.localeCompare(b.name));
  const loggedPet = logged && all.find(({ pet }) => pet.id === logged.petId);

  return (
    <>
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 @min-[1024px]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="@min-[1024px]:col-span-2">
          <NextDue
            items={dueItems}
            nextBeyond={nextBeyond}
            today={today}
            scope="household"
            limit={DUE_LIMIT}
            expanded={showAllDue}
            expandHref={dueHref(true)}
            collapseHref={dueHref(false)}
          />
        </div>
        <div className="@min-[1024px]:col-start-2 @min-[1024px]:row-start-2">
          <Medications medications={medications} today={today} />
        </div>
        <div className="@min-[1024px]:col-start-1 @min-[1024px]:row-start-2">
          <PetRoster
            matching={matching}
            totalCount={all.length}
            speciesOptions={speciesOptions}
            filters={{ query, speciesId, status }}
            view={view}
            today={today}
            inkedPetId={loggedPet ? loggedPet.pet.id : null}
          />
        </div>
      </div>
      {logged && loggedPet && (
        <Toast
          message={`Logged ${logged.title} for ${loggedPet.pet.name}.`}
          param="logged"
        />
      )}
    </>
  );
}
