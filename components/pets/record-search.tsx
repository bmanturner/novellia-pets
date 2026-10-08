"use client";

import { LoaderCircle, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import type { MedicalRecordTypeId } from "@/db/models/medical-record-type";
import { routes } from "@/lib/routes";

/**
 * Title and notes search for a pet's records, kept in the URL next to the
 * type filter. Typing replaces the history entry; without JS the form
 * submits as GET.
 */
export function RecordSearch({
  petId,
  type,
}: {
  petId: number;
  type?: MedicalRecordTypeId;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const debounce = useRef<number | undefined>(undefined);
  const input = useRef<HTMLInputElement>(null);
  const urlQuery = searchParams.get("q") ?? "";
  // The last query this component put in the URL, to tell its own updates
  // apart from outside ones (Back/Forward, Clear filters).
  const sentQuery = useRef(urlQuery);

  function navigate(q: string) {
    window.clearTimeout(debounce.current);
    sentQuery.current = q;
    startTransition(() => {
      router.replace(routes.petRecords(petId, { type, q }), { scroll: false });
    });
  }

  // Typing before hydration never reached onChange; apply it once React
  // takes over.
  useEffect(() => {
    const typed = input.current?.value.trim() ?? "";
    if (typed !== urlQuery) navigate(typed);
    // Mount only; later changes arrive through onChange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Follow URL changes made elsewhere. Our own updates are skipped so a
  // slower response never overwrites newer typing.
  useEffect(() => {
    if (input.current && urlQuery !== sentQuery.current) {
      input.current.value = urlQuery;
      sentQuery.current = urlQuery;
    }
  }, [urlQuery]);

  return (
    <form
      role="search"
      action={pathname}
      method="get"
      aria-busy={isPending}
      onSubmit={(event) => {
        event.preventDefault();
        navigate(input.current?.value.trim() ?? "");
      }}
    >
      {type && <input type="hidden" name="type" value={type} />}
      <label className="relative block min-w-0">
        <span className="sr-only">Search records</span>
        {isPending ? (
          <LoaderCircle
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-spin text-ink-muted"
            aria-hidden
          />
        ) : (
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
            aria-hidden
          />
        )}
        <input
          ref={input}
          type="search"
          name="q"
          defaultValue={urlQuery}
          maxLength={100}
          autoComplete="off"
          placeholder="Search titles and notes"
          onChange={(event) => {
            const value = event.target.value.trim();
            window.clearTimeout(debounce.current);
            debounce.current = window.setTimeout(() => navigate(value), 250);
          }}
          className="h-10 w-full rounded-md border border-rule bg-page pr-3 pl-9 text-[15px] placeholder:text-ink-muted hover:border-rule-strong focus-visible:border-focus"
        />
      </label>
    </form>
  );
}
