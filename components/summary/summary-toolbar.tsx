"use client";

import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { routes } from "@/lib/routes";

/** Screen-only controls above the vet summary; never printed. */
export function SummaryToolbar({
  petId,
  petName,
  history,
  recordCount,
}: {
  petId: number;
  petName: string;
  history: boolean;
  recordCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [shownHistory, setShownHistory] = useOptimistic(history);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
      <Link
        href={routes.pet(petId)}
        className="inline-flex items-center gap-1.5 text-[14px] text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {petName}
      </Link>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {recordCount > 0 && (
          <label
            aria-busy={isPending}
            className="inline-flex cursor-pointer items-center gap-2 text-[14px] text-ink"
          >
            <input
              type="checkbox"
              className="size-4 accent-cover"
              checked={shownHistory}
              onChange={(event) => {
                const next = event.target.checked;
                startTransition(() => {
                  setShownHistory(next);
                  router.replace(routes.petSummary(petId, { history: next }), {
                    scroll: false,
                  });
                });
              }}
            />
            Include full history ({recordCount})
          </label>
        )}
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cover px-4 text-[14px] font-semibold text-cover-ink transition-colors duration-150 hover:bg-cover-deep"
        >
          <Printer className="size-4" aria-hidden />
          Print
        </button>
      </div>
    </div>
  );
}
