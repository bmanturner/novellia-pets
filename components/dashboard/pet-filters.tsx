"use client";

import { ChevronDown, LoaderCircle, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";

/**
 * Search and species filters, kept in the URL so filtered views survive a
 * refresh and work with the back button. Typing replaces the history entry
 * (Back shouldn't replay keystrokes); picking a species adds one. Without JS,
 * the form submits as GET.
 */
export function PetFilters({
  species,
}: {
  species: { id: string; name: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const debounce = useRef<number | undefined>(undefined);
  const input = useRef<HTMLInputElement>(null);
  const select = useRef<HTMLSelectElement>(null);
  const urlQuery = searchParams.get("q") ?? "";
  const urlSpecies = searchParams.get("species") ?? "";
  const status = searchParams.get("status");
  const view = searchParams.get("view");
  // The last query this component put in the URL, to tell its own updates
  // apart from outside ones (Back/Forward, Clear filters).
  const sentQuery = useRef(urlQuery);

  function navigate(
    updates: Record<string, string>,
    history: "push" | "replace",
  ) {
    window.clearTimeout(debounce.current);
    if ("q" in updates) sentQuery.current = updates.q;
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("logged");
    const search = params.toString();
    startTransition(() => {
      router[history](search ? `/?${search}` : "/", { scroll: false });
    });
  }

  // Typing or a species pick before hydration never reached onChange; apply
  // it once React takes over.
  useEffect(() => {
    const typed = input.current?.value.trim() ?? "";
    const picked = select.current?.value ?? "";
    if (typed !== urlQuery || picked !== urlSpecies) {
      navigate({ q: typed, species: picked }, "replace");
    }
    // Mount only; later changes arrive through onChange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Follow URL changes made elsewhere (Back/Forward, Clear filters). Our own
  // updates are skipped so a slower response never overwrites newer typing.
  useEffect(() => {
    if (input.current && urlQuery !== sentQuery.current) {
      input.current.value = urlQuery;
      sentQuery.current = urlQuery;
    }
    if (select.current) select.current.value = urlSpecies;
  }, [urlQuery, urlSpecies]);

  return (
    <form
      role="search"
      action="/"
      method="get"
      aria-busy={isPending}
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        navigate({ q: input.current?.value.trim() ?? "" }, "replace");
      }}
    >
      {status && <input type="hidden" name="status" value={status} />}
      {view === "list" && <input type="hidden" name="view" value="list" />}
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">
          Search pets by name, breed or microchip number
        </span>
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
          placeholder="Search by name, breed or microchip"
          onChange={(event) => {
            const value = event.target.value.trim();
            window.clearTimeout(debounce.current);
            debounce.current = window.setTimeout(
              () => navigate({ q: value }, "replace"),
              250,
            );
          }}
          className="h-10 w-full rounded-md border border-rule bg-page pr-3 pl-9 text-[15px] placeholder:text-ink-muted hover:border-rule-strong focus-visible:border-focus"
        />
      </label>
      <label className="relative sm:w-48">
        <span className="sr-only">Species</span>
        <select
          ref={select}
          name="species"
          defaultValue={urlSpecies}
          onChange={(event) =>
            navigate({ species: event.target.value }, "push")
          }
          className="h-10 w-full appearance-none rounded-md border border-rule bg-page pr-9 pl-3 text-[15px] hover:border-rule-strong focus-visible:border-focus"
        >
          <option value="">All species</option>
          {species.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
          aria-hidden
        />
      </label>
    </form>
  );
}
