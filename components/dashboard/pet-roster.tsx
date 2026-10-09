import { LayoutGrid, Rows3 } from "lucide-react";
import Link from "next/link";
import type { CareStatus, PetCareSummary } from "@/db/models/care";
import { HoldHeight } from "@/components/hold-height";
import { PetCard } from "./pet-card";
import { PetFilters } from "./pet-filters";
import { PetList } from "./pet-list";

export type RosterFilters = {
  query?: string;
  speciesId?: string;
  status?: CareStatus;
};

/** How the roster is laid out; cards are the default and stay out of the URL. */
export type RosterView = "card" | "list";

const STATUS_TABS: { value?: CareStatus; label: string }[] = [
  { label: "All" },
  { value: "overdue", label: "Overdue" },
  { value: "due-soon", label: "Due soon" },
  { value: "up-to-date", label: "Up to date" },
];

const VIEW_OPTIONS = [
  { value: "card", label: "Card", Icon: LayoutGrid },
  { value: "list", label: "List", Icon: Rows3 },
] as const;

const SEGMENT =
  "flex h-11 items-center gap-1.5 rounded-md px-3 text-[14px] whitespace-nowrap transition-colors duration-150 sm:h-8";

function hrefFor(filters: RosterFilters, view: RosterView): string {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.speciesId) params.set("species", filters.speciesId);
  if (filters.status) params.set("status", filters.status);
  if (view === "list") params.set("view", "list");
  const search = params.toString();
  return search ? `/?${search}` : "/";
}

/**
 * The household's pets, needs-attention first. `matching` is already
 * filtered by search and species; the status tab narrows it here so each tab
 * can show its count.
 */
export function PetRoster({
  matching,
  totalCount,
  speciesOptions,
  filters,
  view,
  today,
  inkedPetId,
}: {
  matching: PetCareSummary[];
  totalCount: number;
  speciesOptions: { id: string; name: string }[];
  filters: RosterFilters;
  view: RosterView;
  today: string;
  inkedPetId: number | null;
}) {
  const shown = filters.status
    ? matching.filter((summary) => summary.status === filters.status)
    : matching;
  const filtered = Boolean(
    filters.query || filters.speciesId || filters.status,
  );

  return (
    <section aria-labelledby="pets-heading" className="min-w-0">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2
          id="pets-heading"
          className="text-[22px] leading-7 font-bold tracking-[-0.01em]"
        >
          Pets{" "}
          <span className="font-normal text-ink-muted">
            {filtered ? `${shown.length} of ${totalCount}` : totalCount}
          </span>
        </h2>
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <PetFilters species={speciesOptions} />
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 sm:flex-nowrap sm:gap-x-4">
          <div className="relative -ml-4 min-w-0 flex-1 sm:ml-0 sm:flex-none">
            <nav
              aria-label="Filter by care status"
              className="overflow-x-auto pr-8 pl-4 sm:px-0"
            >
              <ul className="inline-flex gap-1 rounded-lg border border-rule bg-page p-1">
                {STATUS_TABS.map(({ value, label }) => {
                  const count = value
                    ? matching.filter((summary) => summary.status === value)
                        .length
                    : matching.length;
                  const current = filters.status === value;
                  return (
                    <li key={label}>
                      <Link
                        href={hrefFor({ ...filters, status: value }, view)}
                        scroll={false}
                        aria-current={current ? "page" : undefined}
                        className={[
                          SEGMENT,
                          current
                            ? "bg-cover font-semibold text-cover-ink"
                            : count === 0
                              ? "text-ink-muted hover:bg-page-tint"
                              : "text-ink hover:bg-page-tint",
                        ].join(" ")}
                      >
                        {label}
                        <span
                          className={
                            current ? "text-cover-muted" : "text-ink-muted"
                          }
                        >
                          {count}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-paper to-transparent sm:hidden"
            />
          </div>
          {filtered && shown.length > 0 && (
            <Link
              href={hrefFor({}, view)}
              scroll={false}
              className="inline-flex shrink-0 items-center text-[14px] font-semibold text-cover underline max-sm:order-last max-sm:min-h-11 max-sm:basis-full"
            >
              Clear filters
            </Link>
          )}
          <nav aria-label="Roster layout" className="ml-auto shrink-0">
            <ul className="inline-flex gap-1 rounded-lg border border-rule bg-page p-1">
              {VIEW_OPTIONS.map(({ value, label, Icon }) => {
                const current = view === value;
                return (
                  <li key={value}>
                    <Link
                      href={hrefFor(filters, value)}
                      scroll={false}
                      aria-current={current ? "page" : undefined}
                      className={[
                        SEGMENT,
                        "justify-center max-sm:min-w-11 max-sm:px-2.5",
                        current
                          ? "bg-cover font-semibold text-cover-ink"
                          : "text-ink hover:bg-page-tint",
                      ].join(" ")}
                    >
                      <Icon className="size-4" strokeWidth={2} aria-hidden />
                      <span className="max-sm:sr-only">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      <HoldHeight>
        {shown.length > 0 ? (
          view === "list" ? (
            <PetList pets={shown} today={today} inkedPetId={inkedPetId} />
          ) : (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
              {shown.map((summary) => (
                <li key={summary.pet.id} className="grid grid-cols-1">
                  <PetCard
                    summary={summary}
                    today={today}
                    inked={summary.pet.id === inkedPetId}
                  />
                </li>
              ))}
            </ul>
          )
        ) : (
          <div className="rounded-xl border border-dashed border-rule-strong bg-page px-5 py-8 text-center">
            <p className="text-[16px] font-semibold">
              No pets match these filters.
            </p>
            <p className="mt-1 text-[14px] text-ink-muted">
              Try a different search, or clear the filters.
            </p>
            <Link
              href={hrefFor({}, view)}
              scroll={false}
              className="mt-3 inline-flex h-11 items-center text-[14px] font-semibold text-cover underline sm:h-9"
            >
              Clear filters
            </Link>
          </div>
        )}
      </HoldHeight>
    </section>
  );
}
