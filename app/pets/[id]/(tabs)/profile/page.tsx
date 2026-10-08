import { Suspense } from "react";
import { PetProfile } from "@/components/pets/pet-profile";
import { ProfileSkeleton } from "@/components/pets/skeletons";

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
