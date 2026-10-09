import type { Metadata } from "next";
import { Suspense } from "react";
import {
  VetSummary,
  VetSummarySkeleton,
} from "@/components/summary/vet-summary";
import { formatFullDate } from "@/lib/format";
import { loadPet } from "@/lib/pet-data";

// The title doubles as the file name when the summary is saved as a PDF.
export async function generateMetadata({
  params,
}: PageProps<"/pets/[id]/summary">): Promise<Metadata> {
  const { id } = await params;
  const { pet, today } = await loadPet(id);
  return { title: `${pet.name} vet summary · ${formatFullDate(today)}` };
}

export default function SummaryPage({
  params,
  searchParams,
}: PageProps<"/pets/[id]/summary">) {
  return (
    <main className="mx-auto w-full max-w-[880px] flex-1 px-4 pt-6 pb-16 sm:px-6 lg:pt-10 print:max-w-none print:p-0">
      <Suspense fallback={<VetSummarySkeleton />}>
        <VetSummary params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
