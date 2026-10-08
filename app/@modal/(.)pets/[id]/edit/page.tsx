import { Suspense } from "react";
import { FormSkeleton, EditPetScreen } from "@/components/forms/screens";
import { RouteDialog } from "@/components/route-dialog";

type Props = { params: Promise<{ id: string }> };

export default function EditPetModal({ params }: Props) {
  return (
    <RouteDialog title="Edit pet">
      <Suspense fallback={<FormSkeleton />}>
        <EditPetScreen params={params} />
      </Suspense>
    </RouteDialog>
  );
}
