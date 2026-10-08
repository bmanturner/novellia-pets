import { Suspense } from "react";
import { FormSkeleton, NewPetScreen } from "@/components/forms/screens";
import { RouteDialog } from "@/components/route-dialog";

export default function NewPetModal() {
  return (
    <RouteDialog title="Add pet">
      <Suspense fallback={<FormSkeleton />}>
        <NewPetScreen />
      </Suspense>
    </RouteDialog>
  );
}
