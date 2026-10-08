import { Suspense } from "react";
import { FormPage } from "@/components/form-page";
import { FormSkeleton, EditRecordScreen } from "@/components/forms/screens";

type Props = {
  params: Promise<{ id: string; recordId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function EditRecordPage({ params, searchParams }: Props) {
  return (
    <FormPage title="Edit record">
      <Suspense fallback={<FormSkeleton />}>
        <EditRecordScreen params={params} searchParams={searchParams} />
      </Suspense>
    </FormPage>
  );
}
