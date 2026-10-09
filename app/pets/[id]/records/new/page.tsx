import { Suspense } from "react";
import { FormPage } from "@/components/form-page";
import {
  FormSkeleton,
  NewRecordFrame,
  NewRecordScreen,
} from "@/components/forms/screens";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function NewRecordPage({ params, searchParams }: Props) {
  return (
    <Suspense
      fallback={
        <FormPage title="Record">
          <FormSkeleton />
        </FormPage>
      }
    >
      <NewRecordFrame variant="page" searchParams={searchParams}>
        <Suspense fallback={<FormSkeleton />}>
          <NewRecordScreen params={params} searchParams={searchParams} />
        </Suspense>
      </NewRecordFrame>
    </Suspense>
  );
}
