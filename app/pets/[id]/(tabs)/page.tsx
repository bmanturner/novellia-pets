import { Suspense } from "react";
import { PetStatus } from "@/components/pets/pet-status";
import { StatusSkeleton } from "@/components/pets/skeletons";

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
