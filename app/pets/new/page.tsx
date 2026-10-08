import { Suspense } from "react";
import { FormPage } from "@/components/form-page";
import { FormSkeleton, NewPetScreen } from "@/components/forms/screens";

export default function NewPetPage() {
  return (
    <FormPage title="Add pet">
      <Suspense fallback={<FormSkeleton />}>
        <NewPetScreen />
      </Suspense>
    </FormPage>
  );
}
