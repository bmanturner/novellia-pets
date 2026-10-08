import { Pencil } from "lucide-react";
import Link from "next/link";
import { deletePetAction } from "@/app/pets/actions";
import { DeleteDialog } from "@/components/delete-dialog";
import { Field } from "@/components/field";
import {
  formatAge,
  formatDate,
  formatMicrochip,
  formatSex,
  plural,
} from "@/lib/format";
import { loadPet, loadPetRecords } from "@/lib/pet-data";
import { routes } from "@/lib/routes";

export async function PetProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ pet, today }, records] = await Promise.all([
    loadPet(id),
    loadPetRecords(id),
  ]);
  const consequence = `Deleting ${pet.name} also deletes ${plural(records.length, "medical record")}. This can't be undone.`;

  return (
    <div className="max-w-[860px] space-y-6">
      <section
        aria-label="Profile"
        className="rounded-xl border border-rule bg-page"
      >
        <dl className="grid gap-x-6 gap-y-4 p-4 sm:grid-cols-2 sm:p-5">
          <Field label="Name">{pet.name}</Field>
          <Field label="Species">{pet.species.name}</Field>
          <Field label="Breed">{pet.breed ?? "—"}</Field>
          <Field label="Sex">{formatSex(pet.sex, pet.neutered)}</Field>
          <Field label="Date of birth">
            {pet.dateOfBirth
              ? `${formatDate(pet.dateOfBirth, today)} (${formatAge(pet.dateOfBirth, today)})`
              : "Not recorded"}
          </Field>
          <Field label="Microchip">
            {pet.microchipId ? (
              <span className="font-mono">
                {formatMicrochip(pet.microchipId)}
              </span>
            ) : (
              "Not recorded"
            )}
          </Field>
          <Field label="Notes" clamp={false} className="sm:col-span-2">
            {pet.notes ?? "No notes"}
          </Field>
        </dl>
        <div className="border-t border-rule px-4 py-3 sm:px-5">
          <Link
            href={routes.editPet(pet.id)}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-cover/25 bg-page px-3.5 text-[14px] font-semibold text-cover transition-colors duration-150 hover:border-cover/50 hover:bg-page-tint"
          >
            <Pencil className="size-4" aria-hidden />
            Edit pet
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="delete-pet-heading"
        className="rounded-xl border border-rule bg-page p-4 sm:p-5"
      >
        <h2 id="delete-pet-heading" className="text-[16px] leading-6 font-bold">
          Delete {pet.name}
        </h2>
        <p className="mt-1 mb-4 max-w-prose text-[14px] leading-5 text-ink-muted">
          {consequence}
        </p>
        <DeleteDialog
          triggerVariant="page"
          triggerLabel={`Delete ${pet.name}`}
          title={`Delete ${pet.name}?`}
          description={consequence}
          confirmLabel={`Delete ${pet.name}`}
          action={deletePetAction}
          fields={{ petId: String(pet.id) }}
        />
      </section>
    </div>
  );
}
