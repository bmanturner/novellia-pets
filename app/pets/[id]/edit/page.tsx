import { Suspense } from "react";
import { FormPage } from "@/components/form-page";
import { FormSkeleton, EditPetScreen } from "@/components/forms/screens";

type Props = { params: Promise<{ id: string }> };

export default function EditPetPage({ params }: Props) {
  return (
    <FormPage title="Edit pet">
      <Suspense fallback={<FormSkeleton />}>
        <EditPetScreen params={params} />
      </Suspense>
    </FormPage>
  );
}
