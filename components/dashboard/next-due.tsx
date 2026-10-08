import { Stamp as StampIcon } from "lucide-react";
import Link from "next/link";
import type { DueItem } from "@/db/models/care";
import type { MedicalRecordTypeId } from "@/db/models/medical-record-type";
import { Stamp } from "@/components/stamp";
import { SpeciesMark } from "@/components/species-mark";
import { formatDate, formatLongDate } from "@/lib/format";
import { routes } from "@/lib/routes";

const LOG_LABEL: Partial<Record<MedicalRecordTypeId, string>> = {
  vaccination: "Log dose",
  medication: "Log refill",
  visit: "Log visit",
};

function DaysFigure({ days, onCover }: { days: number; onCover: boolean }) {
  if (days === 0) {
    return <span className="text-[22px] leading-none font-bold">Today</span>;
  }
  const count = Math.abs(days);
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="text-[32px] leading-none font-bold tracking-[-0.02em]">
        {count}
      </span>
      <span
        className={`text-[13px] whitespace-nowrap ${onCover ? "text-cover-muted" : "text-ink-muted"}`}
      >
        {count === 1 ? "day" : "days"} {days < 0 ? "late" : "left"}
      </span>
    </span>
  );
}

function DueRow({
  item,
  today,
  urgent,
  scope,
}: {
  item: DueItem;
  today: string;
  urgent: boolean;
  scope: "household" | "pet";
}) {
  const muted = urgent ? "text-cover-muted" : "text-ink-muted";
  return (
    <li
      className={[
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 px-4 py-4 sm:px-5",
        "md:grid-cols-[120px_minmax(0,22rem)_minmax(max-content,1fr)_auto_auto] md:gap-x-6",
        urgent ? "bg-cover text-cover-ink" : "",
      ].join(" ")}
    >
      <div className="col-start-1 row-start-1 md:col-auto md:row-auto">
        <DaysFigure days={item.daysUntilDue} onCover={urgent} />
      </div>

      <div className="col-span-2 row-start-2 flex min-w-0 items-center gap-3 md:col-span-1 md:col-auto md:row-auto">
        {scope === "household" ? (
          <>
            <SpeciesMark species={item.pet.species} size="row" onCover={urgent} />
            <div className="min-w-0">
              <p className="truncate text-[16px] leading-6">
                <Link
                  href={routes.pet(item.pet.id)}
                  className="font-bold underline-offset-[0.2em] hover:underline"
                >
                  {item.pet.name}
                </Link>{" "}
                <span className={`text-[14px] ${muted}`}>
                  {item.pet.species.name}
                </span>
              </p>
              <p className="truncate text-[15px] leading-5">
                {item.title} <span className={muted}>· {item.typeName}</span>
              </p>
            </div>
          </>
        ) : (
          <div className="min-w-0">
            <p className="truncate text-[16px] leading-6 font-bold">
              {item.title}
            </p>
            <p className={`truncate text-[14px] leading-5 ${muted}`}>
              {item.typeName}
            </p>
          </div>
        )}
      </div>

      <div className="col-start-1 row-start-3 md:col-auto md:row-auto">
        <p
          className={`text-[11px] leading-4 font-semibold tracking-[0.08em] uppercase ${muted}`}
        >
          {item.daysUntilDue < 0 ? "Was due" : "Due"}
        </p>
        <p className="text-[14px] leading-5">
          <time dateTime={item.dueOn}>{formatDate(item.dueOn, today)}</time>
        </p>
      </div>

      <div className="col-start-2 row-start-1 justify-self-end md:col-auto md:row-auto md:justify-self-start">
        <Stamp status={item.status} onCover={urgent} seed={item.pet.id} />
      </div>

      <div className="col-start-2 row-start-3 justify-self-end md:col-auto md:row-auto">
        <Link
          href={
            scope === "household"
              ? routes.logNext(item.pet.id, item.typeId, item.title, "home")
              : routes.logNext(item.pet.id, item.typeId, item.title)
          }
          className={[
            "inline-flex h-10 items-center gap-2 rounded-md px-3.5 text-[14px] font-semibold whitespace-nowrap transition-colors duration-150",
            urgent
              ? "bg-cover-ink text-cover hover:bg-white focus-visible:outline-foil"
              : "border border-cover/25 bg-page text-cover hover:border-cover/50 hover:bg-page-tint",
          ].join(" ")}
        >
          <StampIcon className="size-4" aria-hidden />
          {LOG_LABEL[item.typeId] ?? "Log next"}
          <span className="sr-only">
            {" "}
            for {item.pet.name}: {item.title}
          </span>
        </Link>
      </div>
    </li>
  );
}

export function NextDue({
  items,
  nextBeyond,
  today,
  scope,
}: {
  items: DueItem[];
  /** The soonest due item past the 30-day window, for the all-clear state. */
  nextBeyond: DueItem | null;
  today: string;
  scope: "household" | "pet";
}) {
  return (
    <section aria-labelledby="next-due-heading">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2
          id="next-due-heading"
          className="text-[22px] leading-7 font-bold tracking-[-0.01em]"
        >
          Next due{" "}
          {items.length > 0 && (
            <span className="font-normal text-ink-muted">{items.length}</span>
          )}
        </h2>
        <p className="text-[14px] text-ink-muted">
          As of <time dateTime={today}>{formatLongDate(today)}</time>
        </p>
      </div>

      {items.length > 0 ? (
        <ol className="divide-y divide-rule overflow-hidden rounded-xl border border-rule bg-page">
          {items.map((item, index) => (
            <DueRow
              key={item.recordId}
              item={item}
              today={today}
              urgent={index === 0}
              scope={scope}
            />
          ))}
        </ol>
      ) : (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-rule bg-page px-5 py-5">
          <Stamp status="up-to-date" tilt={-3} />
          <div className="min-w-0">
            <p className="text-[16px] font-semibold">
              Nothing is overdue or due in the next 30 days.
            </p>
            <p className="text-[14px] text-ink-muted">
              {nextBeyond ? (
                scope === "household" ? (
                  <>
                    Next up: {nextBeyond.title} for{" "}
                    <Link
                      href={routes.pet(nextBeyond.pet.id)}
                      className="font-semibold text-ink underline"
                    >
                      {nextBeyond.pet.name}
                    </Link>{" "}
                    on{" "}
                    <time dateTime={nextBeyond.dueOn}>
                      {formatDate(nextBeyond.dueOn, today)}
                    </time>
                    .
                  </>
                ) : (
                  <>
                    Next up: {nextBeyond.title} on{" "}
                    <time dateTime={nextBeyond.dueOn}>
                      {formatDate(nextBeyond.dueOn, today)}
                    </time>
                    .
                  </>
                )
              ) : (
                "No upcoming due dates are on file."
              )}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
