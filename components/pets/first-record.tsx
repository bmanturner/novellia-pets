import Link from "next/link";
import type { Pet } from "@/db/models/pet";
import type { MedicalRecordTypeId } from "@/db/models/medical-record-type";
import { routes } from "@/lib/routes";

const STARTERS: { typeId: MedicalRecordTypeId; label: string }[] = [
  { typeId: "vaccination", label: "Add vaccination" },
  { typeId: "medication", label: "Add medication" },
  { typeId: "visit", label: "Add vet visit" },
  { typeId: "condition", label: "Add allergy or condition" },
];

/** A pet with no records yet: where to start. */
export function FirstRecord({ pet }: { pet: Pick<Pet, "id" | "name"> }) {
  return (
    <div className="rounded-xl border border-dashed border-rule-strong bg-page px-5 py-8">
      <h2 className="text-[22px] leading-7 font-bold tracking-[-0.01em]">
        No records yet for {pet.name}
      </h2>
      <p className="mt-1 text-[15px] leading-6 text-ink-muted">
        Start with what a vet or sitter would ask about first.
      </p>
      <ul className="mt-5 flex flex-wrap gap-3">
        {STARTERS.map(({ typeId, label }) => (
          <li key={typeId}>
            <Link
              href={routes.newRecord(pet.id, typeId)}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-cover/25 bg-page px-3.5 text-[14px] font-semibold text-cover transition-colors duration-150 hover:border-cover/50 hover:bg-page-tint"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
