import { Suspense } from "react";
import { FormPage } from "@/components/form-page";
import { FormSkeleton, NewRecordScreen } from "@/components/forms/screens";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function NewRecordPage({ params, searchParams }: Props) {
  return (
    <FormPage title="Add record">
      <Suspense fallback={<FormSkeleton />}>
        <NewRecordScreen params={params} searchParams={searchParams} />
      </Suspense>
    </FormPage>
  );
}
