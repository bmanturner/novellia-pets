import { Suspense } from "react";
import { PetRecords } from "@/components/pets/records-list";
import { RecordsSkeleton } from "@/components/pets/skeletons";

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
