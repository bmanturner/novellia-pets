import { Suspense } from "react";
import {
  FormSkeleton,
  NewRecordFrame,
  NewRecordScreen,
} from "@/components/forms/screens";
import { RouteDialog } from "@/components/route-dialog";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function NewRecordModal({ params, searchParams }: Props) {
  return (
    <Suspense
      fallback={
        <RouteDialog title="Record">
          <FormSkeleton />
        </RouteDialog>
      }
    >
      <NewRecordFrame variant="dialog" searchParams={searchParams}>
        <Suspense fallback={<FormSkeleton />}>
          <NewRecordScreen params={params} searchParams={searchParams} />
        </Suspense>
      </NewRecordFrame>
    </Suspense>
  );
}
