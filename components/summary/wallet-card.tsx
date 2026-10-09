import { Scissors } from "lucide-react";
import { Field } from "@/components/field";
import { MicrochipStrip } from "@/components/microchip-strip";
import { SpeciesMark } from "@/components/species-mark";
import { Stamp } from "@/components/stamp";
import type { PetCare } from "@/db/models/care";
import type { Pet } from "@/db/models/pet";
import { formatAge, formatFullDate, formatSex } from "@/lib/format";

const LABEL =
  "text-[11px] leading-[18px] font-semibold tracking-[0.08em] text-ink-muted uppercase";

const CARD_LIMIT = 3;

/** Up to three items, then a pointer to the sheet; the sheet lists them all. */
function cardList(items: string[]): string {
  if (items.length === 0) return "None recorded";
  const shown = items.slice(0, CARD_LIMIT).join(", ");
  const more = items.length - CARD_LIMIT;
  return more > 0 ? `${shown}, +${more} more on the sheet` : shown;
}

/**
 * The pet's passport data page at true wallet size (125 × 88 mm), in a
 * dashed cut frame: printed, cut out, and kept on the carrier or fridge.
 */
export function WalletCard({
  pet,
  care,
  today,
}: {
  pet: Pet;
  care: PetCare;
  today: string;
}) {
  const rows = [
    {
      label: "Allergies",
      items: care.conditions
        .filter((condition) => condition.kind === "allergy")
        .map(({ title, severity }) =>
          severity ? `${title} (${severity})` : title,
        ),
    },
    {
      label: "Medications",
      items: care.medications.map(({ title, dosage }) =>
        dosage ? `${title} ${dosage}` : title,
      ),
    },
    {
      label: "Conditions",
      items: care.conditions
        .filter((condition) => condition.kind === "condition")
        .map(({ title }) => title),
    },
  ];
  const next = care.dueItems[0] ?? care.nextBeyond;

  // The frame adds 18px (8px padding, 1px border, each side) around the card.
  return (
    <figure className="min-w-0">
      <div className="relative rounded-[16px] border border-dashed border-rule-strong p-2 break-inside-avoid">
        <Scissors
          aria-hidden
          className="absolute -top-2 left-4 size-4 bg-page px-0.5 text-ink-muted"
        />
        <div className="flex min-h-[88mm] flex-col overflow-hidden rounded-xl border border-rule bg-page [print-color-adjust:exact] print:h-[88mm]">
          <div className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)] gap-4 p-4">
            <SpeciesMark species={pet.species} size="photo" />
            <div className="min-w-0">
              <p className="text-[20px] leading-7 font-extrabold tracking-[0.02em] break-words uppercase">
                {pet.name}
              </p>
              <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
                <Field label="Species">{pet.species.name}</Field>
                <Field label="Breed">{pet.breed ?? "—"}</Field>
                <Field label="Sex">{formatSex(pet.sex, pet.neutered)}</Field>
                <Field label="Age">
                  {pet.dateOfBirth
                    ? formatAge(pet.dateOfBirth, today)
                    : "Unknown"}
                </Field>
              </dl>
            </div>
          </div>
          {/* Overflow trims the safety rows (the sheet repeats them), never the chip. */}
          <dl className="min-h-0 flex-1 space-y-1.5 overflow-hidden border-t border-rule px-4 py-3">
            {rows.map(({ label, items }) => (
              <div
                key={label}
                className="grid grid-cols-[92px_minmax(0,1fr)] gap-2"
              >
                <dt className={LABEL}>{label}</dt>
                <dd
                  className={`line-clamp-2 text-[13px] leading-[18px] break-words print:line-clamp-1 ${items.length === 0 ? "text-ink-muted" : ""}`}
                >
                  {cardList(items)}
                </dd>
              </div>
            ))}
          </dl>
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-rule px-4 py-2.5">
            <div className="min-w-0 text-[13px] leading-[18px]">
              {next ? (
                <p className="truncate">
                  {next.status === "overdue" ? "Was due" : "Next due"}{" "}
                  <span className="font-semibold">{next.title}</span> ·{" "}
                  {formatFullDate(next.dueOn)}
                </p>
              ) : (
                <p className="text-ink-muted">No due dates on file</p>
              )}
              <p className="text-[12px] leading-4 text-ink-muted">
                Status as of {formatFullDate(today)}
              </p>
            </div>
            {care.status && <Stamp status={care.status} seed={pet.id} />}
          </div>
          <div className="shrink-0">
            <MicrochipStrip microchipId={pet.microchipId} />
          </div>
        </div>
      </div>
      <figcaption className="mt-2 text-[13px] leading-5 text-ink-muted">
        Cut out for the carrier or fridge.
      </figcaption>
    </figure>
  );
}
