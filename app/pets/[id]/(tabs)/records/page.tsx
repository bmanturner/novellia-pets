import type { Metadata } from "next";
import { Suspense } from "react";
import { PetRecords } from "@/components/pets/records-list";
import { RecordsSkeleton } from "@/components/pets/skeletons";
import { loadPet } from "@/lib/pet-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { pet } = await loadPet(id);
  return { title: `${pet.name} · Records` };
}

export default function RecordsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<RecordsSkeleton />}>
      <PetRecords params={params} searchParams={searchParams} />
    </Suspense>
  );
}
