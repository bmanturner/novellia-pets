import Link from "next/link";
import type { CareStatus, PetCareSummary } from "@/db/models/care";
import { HoldHeight } from "@/components/hold-height";
import { PetCard } from "./pet-card";
import { PetFilters } from "./pet-filters";

export type RosterFilters = {
  query?: string;
  speciesId?: string;
  status?: CareStatus;
};

const STATUS_TABS: { value?: CareStatus; label: string }[] = [
  { label: "All" },
  { value: "overdue", label: "Overdue" },
  { value: "due-soon", label: "Due soon" },
  { value: "up-to-date", label: "Up to date" },
];

function hrefFor(filters: RosterFilters): string {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.speciesId) params.set("species", filters.speciesId);
  if (filters.status) params.set("status", filters.status);
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
  today,
  inkedPetId,
}: {
  matching: PetCareSummary[];
  totalCount: number;
  speciesOptions: { id: string; name: string }[];
  filters: RosterFilters;
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
      <h2
        id="pets-heading"
        className="mb-3 text-[22px] leading-7 font-bold tracking-[-0.01em]"
      >
        Pets{" "}
        <span className="font-normal text-ink-muted">
          {filtered ? `${shown.length} of ${totalCount}` : totalCount}
        </span>
      </h2>

      <div className="mb-4 flex flex-col gap-3">
        <PetFilters species={speciesOptions} />
        <nav
          aria-label="Filter by care status"
          className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
        >
          <ul className="inline-flex gap-1 rounded-lg border border-rule bg-page p-1">
            {STATUS_TABS.map(({ value, label }) => {
              const count = value
                ? matching.filter((summary) => summary.status === value).length
                : matching.length;
              const current = filters.status === value;
              return (
                <li key={label}>
                  <Link
                    href={hrefFor({ ...filters, status: value })}
                    scroll={false}
                    aria-current={current ? "page" : undefined}
                    className={[
                      "flex h-8 items-center gap-1.5 rounded-md px-3 text-[14px] whitespace-nowrap transition-colors duration-150",
                      current
                        ? "bg-cover font-semibold text-cover-ink"
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
      </div>

      <HoldHeight>
        {shown.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        ) : (
          <div className="rounded-xl border border-dashed border-rule-strong bg-page px-5 py-8 text-center">
            <p className="text-[16px] font-semibold">
              No pets match these filters.
            </p>
            <Link
              href="/"
              scroll={false}
              className="mt-1 inline-block text-[14px] font-semibold text-cover underline"
            >
              Clear filters
            </Link>
          </div>
        )}
      </HoldHeight>
    </section>
  );
}
