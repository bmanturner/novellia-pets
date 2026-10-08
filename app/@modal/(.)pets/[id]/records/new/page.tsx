import { Suspense } from "react";
import { FormSkeleton, NewRecordScreen } from "@/components/forms/screens";
import { RouteDialog } from "@/components/route-dialog";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function NewRecordModal({ params, searchParams }: Props) {
  return (
    <RouteDialog title="Add record">
      <Suspense fallback={<FormSkeleton />}>
        <NewRecordScreen params={params} searchParams={searchParams} />
      </Suspense>
    </RouteDialog>
  );
}
