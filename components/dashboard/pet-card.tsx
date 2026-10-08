import Link from "next/link";
import type { PetCareSummary } from "@/db/models/care";
import { Field } from "@/components/field";
import { SpeciesMark } from "@/components/species-mark";
import { Stamp } from "@/components/stamp";
import {
  formatAge,
  formatDate,
  formatMicrochip,
  formatSex,
  plural,
} from "@/lib/format";
import { routes } from "@/lib/routes";

function NextDueLine({
  summary,
  today,
}: {
  summary: PetCareSummary;
  today: string;
}) {
  const { nextDue, overdueCount, dueSoonCount } = summary;
  if (!nextDue) {
    return <span className="text-ink-muted">No due dates on file</span>;
  }
  const days = nextDue.daysUntilDue;
  const when =
    days < 0
      ? `${plural(-days, "day")} late`
      : days === 0
        ? "due today"
        : `in ${plural(days, "day")}`;
  const others = overdueCount + dueSoonCount - 1;
  return (
    <>
      <span className="font-semibold">{nextDue.title}</span>{" "}
      <span className="text-ink-muted">
        <time dateTime={nextDue.dueOn}>{formatDate(nextDue.dueOn, today)}</time>
        {summary.status !== "up-to-date" && <> · {when}</>}
        {others > 0 && <> · {others} more</>}
      </span>
    </>
  );
}

/** A pet as a passport data page: photo box, fields, next due, microchip. */
export function PetCard({
  summary,
  today,
  inked,
}: {
  summary: PetCareSummary;
  today: string;
  inked: boolean;
}) {
  const { pet, status } = summary;
  return (
    <article className="group relative flex flex-col rounded-xl border border-rule bg-page transition-colors duration-150 hover:border-rule-strong">
      <div className="flex gap-4 p-4">
        <SpeciesMark species={pet.species} size="photo" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[20px] leading-7 font-extrabold tracking-[0.02em] uppercase">
            <Link
              href={routes.pet(pet.id)}
              className="rounded-sm after:absolute after:inset-0 after:rounded-xl group-hover:underline"
            >
              {pet.name}
            </Link>
          </h3>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
            <Field label="Species">{pet.species.name}</Field>
            <Field label="Breed">{pet.breed ?? "—"}</Field>
            <Field label="Sex">{formatSex(pet.sex, pet.neutered)}</Field>
            <Field label="Age">
              {pet.dateOfBirth ? formatAge(pet.dateOfBirth, today) : "Unknown"}
            </Field>
          </dl>
        </div>
      </div>

      <div className="mt-auto flex items-start justify-between gap-3 border-t border-rule px-4 py-3">
        <p className="min-w-0 text-[14px] leading-5">
          <span className="sr-only">Next due: </span>
          <NextDueLine summary={summary} today={today} />
        </p>
        <Stamp status={status} inked={inked} seed={pet.id} />
      </div>

      {pet.microchipId ? (
        <p className="rounded-b-xl border-t border-rule bg-page-tint px-4 py-2 font-mono text-[12px] leading-4 tracking-[0.1em] text-ink-muted uppercase">
          <span className="sr-only">Microchip: </span>
          <span aria-hidden>Chip </span>
          {formatMicrochip(pet.microchipId)}
        </p>
      ) : (
        <p className="rounded-b-xl border-t border-rule bg-page-tint px-4 py-2 text-[11px] leading-4 font-semibold tracking-[0.08em] text-ink-muted uppercase">
          No microchip on file
        </p>
      )}
    </article>
  );
}
