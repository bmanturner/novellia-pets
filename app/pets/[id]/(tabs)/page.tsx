import type { Metadata } from "next";
import { Suspense } from "react";
import { PetStatus } from "@/components/pets/pet-status";
import { StatusSkeleton } from "@/components/pets/skeletons";
import { loadPet } from "@/lib/pet-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { pet } = await loadPet(id);
  return { title: `${pet.name} · Status` };
}

export default function StatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<StatusSkeleton />}>
      <PetStatus params={params} searchParams={searchParams} />
    </Suspense>
  );
}
