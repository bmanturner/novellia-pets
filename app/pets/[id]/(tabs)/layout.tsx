import { Suspense } from "react";
import { PetHeaderSection } from "@/components/pets/pet-header";
import { PetHeaderSkeleton } from "@/components/pets/skeletons";
import { ScrollToTop } from "@/components/scroll-to-top";

export default function PetTabsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-10">
      <ScrollToTop />
      <Suspense fallback={<PetHeaderSkeleton />}>
        <PetHeaderSection params={params} />
      </Suspense>
      <div className="mt-8">{children}</div>
    </main>
  );
}
