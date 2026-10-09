import type { Metadata } from "next";
import { Suspense } from "react";
import { PetProfile } from "@/components/pets/pet-profile";
import { ProfileSkeleton } from "@/components/pets/skeletons";
import { loadPet } from "@/lib/pet-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { pet } = await loadPet(id);
  return { title: `${pet.name} · Profile` };
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <PetProfile params={params} />
    </Suspense>
  );
}
