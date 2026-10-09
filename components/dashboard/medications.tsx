import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { ActiveMedication } from "@/db/models/care";
import { SpeciesMark } from "@/components/species-mark";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";

/** Who is on what right now; what a sitter needs at handover. */
export function Medications({
  medications,
  today,
}: {
  medications: ActiveMedication[];
  today: string;
}) {
  return (
    <details open className="group min-w-0">
      <summary className="mb-1 flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden @min-[1024px]:pointer-events-none @min-[1024px]:cursor-default max-sm:min-h-11">
        <h2
          id="medications-heading"
          className="text-[22px] leading-7 font-bold tracking-[-0.01em]"
        >
          On medication now{" "}
          {medications.length > 0 && (
            <span className="font-normal text-ink-muted">
              {medications.length}
            </span>
          )}
        </h2>
        <ChevronDown
          className="size-5 shrink-0 text-ink-muted transition-transform duration-150 group-open:rotate-180 @min-[1024px]:hidden"
          aria-hidden
        />
      </summary>
      <p className="mb-3 text-[14px] text-ink-muted">All pets</p>

      {medications.length > 0 ? (
        <ul className="divide-y divide-rule rounded-xl border border-rule bg-page">
          {medications.map((medication) => {
            const dose = [medication.dosage, medication.frequency]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={medication.recordId} className="px-4 py-3.5">
                <p className="text-[16px] leading-6 font-bold">
                  {medication.title}
                </p>
                {dose && <p className="text-[14px] leading-5">{dose}</p>}
                <p className="mt-1.5 flex items-center gap-2 text-[13px] leading-5 text-ink-muted">
                  <SpeciesMark species={medication.pet.species} size="inline" />
                  <span className="min-w-0 truncate max-sm:-my-3 max-sm:py-3">
                    <Link
                      href={routes.pet(medication.pet.id)}
                      className="font-semibold text-ink hover:underline max-sm:-my-2.5 max-sm:inline-block max-sm:py-2.5"
                    >
                      {medication.pet.name}
                    </Link>{" "}
                    {medication.pet.species.name}
                    {medication.refillOn && (
                      <>
                        {" · "}refill{" "}
                        <time dateTime={medication.refillOn}>
                          {formatDate(medication.refillOn, today)}
                        </time>
                      </>
                    )}
                    {medication.endsOn && (
                      <>
                        {" · "}until{" "}
                        <time dateTime={medication.endsOn}>
                          {formatDate(medication.endsOn, today)}
                        </time>
                      </>
                    )}
                  </span>
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-xl border border-rule bg-page px-4 py-4 text-[14px] text-ink-muted">
          No one is on medication right now.
        </p>
      )}
    </details>
  );
}
