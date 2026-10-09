import Link from "next/link";
import type { PetCareSummary } from "@/db/models/care";
import { SpeciesMark } from "@/components/species-mark";
import { InkableStamp } from "@/components/inkable-stamp";
import { formatAge } from "@/lib/format";
import { routes } from "@/lib/routes";
import { CompactDue } from "./pet-card";

/**
 * The roster as one ruled register: a row per pet with its identity, next
 * due item and stamp. The whole row is the pet's link.
 */
export function PetList({
  pets,
  today,
  inkedPetId,
}: {
  pets: PetCareSummary[];
  today: string;
  inkedPetId: number | null;
}) {
  return (
    <ul className="divide-y divide-rule overflow-hidden rounded-xl border border-rule bg-page">
      {pets.map((summary) => {
        const { pet, status } = summary;
        const details = [
          pet.breed,
          pet.dateOfBirth ? formatAge(pet.dateOfBirth, today) : null,
        ].filter(Boolean);
        return (
          <li
            key={pet.id}
            className="group relative flex min-h-16 items-center gap-3 px-3 py-2.5 transition-colors duration-150 hover:bg-page-tint sm:gap-4 sm:px-4"
          >
            <SpeciesMark species={pet.species} size="row" />
            <div className="min-w-0 flex-1 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:gap-4">
              <div className="flex min-w-0 items-baseline gap-2 sm:block">
                <h3 className="min-w-0 truncate text-[16px] leading-5 font-extrabold tracking-[0.02em] uppercase">
                  <Link
                    href={routes.pet(pet.id)}
                    className="rounded-sm after:absolute after:inset-0 group-hover:underline"
                  >
                    {pet.name}
                  </Link>
                </h3>
                <p className="shrink-0 truncate text-[12px] leading-5 text-ink-muted sm:mt-0.5 sm:text-[13px]">
                  {pet.species.name}
                  {details.length > 0 && (
                    <span className="max-sm:hidden">
                      {" "}
                      · {details.join(" · ")}
                    </span>
                  )}
                </p>
              </div>
              <div className="min-w-0 text-[13px] leading-5 text-ink-muted">
                <span className="sr-only">Next due: </span>
                <CompactDue summary={summary} today={today} />
              </div>
            </div>
            {/* A fixed slot, so the due column lines up whatever the stamp says. */}
            <div className="flex w-28 shrink-0 justify-end">
              <InkableStamp
                status={status}
                inked={pet.id === inkedPetId}
                petId={pet.id}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
