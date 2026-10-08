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
    <section aria-labelledby="medications-heading" className="min-w-0">
      <h2
        id="medications-heading"
        className="mb-3 text-[22px] leading-7 font-bold tracking-[-0.01em]"
      >
        On medication now{" "}
        {medications.length > 0 && (
          <span className="font-normal text-ink-muted">
            {medications.length}
          </span>
        )}
      </h2>

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
                  <span className="min-w-0 truncate">
                    <Link
                      href={routes.pet(medication.pet.id)}
                      className="font-semibold text-ink hover:underline"
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
    </section>
  );
}
