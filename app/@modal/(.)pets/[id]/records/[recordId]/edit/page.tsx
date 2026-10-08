import { Suspense } from "react";
import { FormSkeleton, EditRecordScreen } from "@/components/forms/screens";
import { RouteDialog } from "@/components/route-dialog";

type Props = {
  params: Promise<{ id: string; recordId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function EditRecordModal({ params, searchParams }: Props) {
  return (
    <RouteDialog title="Edit record">
      <Suspense fallback={<FormSkeleton />}>
        <EditRecordScreen params={params} searchParams={searchParams} />
      </Suspense>
    </RouteDialog>
  );
}
