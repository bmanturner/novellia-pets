import { Plus } from "lucide-react";
import Link from "next/link";
import { Stamp } from "@/components/stamp";
import { routes } from "@/lib/routes";

/** No pets yet: one blank data page that explains what will fill it. */
export function FirstRun() {
  return (
    <section
      aria-labelledby="first-run-heading"
      className="mx-auto w-full max-w-[560px] rounded-xl border border-rule bg-page"
    >
      <div className="flex gap-5 p-6">
        <span
          aria-hidden
          className="grid h-[112px] w-[88px] shrink-0 place-items-center rounded-[4px] border border-dashed border-rule-strong bg-page-tint text-ink-muted"
        >
          <Plus className="size-6" />
        </span>
        <div className="min-w-0">
          <h2
            id="first-run-heading"
            className="text-[22px] leading-7 font-bold tracking-[-0.01em]"
          >
            Add your first pet
          </h2>
          <p className="mt-2 text-[15px] leading-6 text-ink-muted">
            Record their vaccinations, medications, vet visits and allergies.
            Anything overdue or due in the next 30 days shows up here first,
            stamped so you can&rsquo;t miss it.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Stamp status="overdue" tilt={-4} />
            <Stamp status="due-soon" tilt={3} />
            <Stamp status="up-to-date" tilt={-2} />
          </div>
        </div>
      </div>
      <div className="border-t border-rule px-6 py-4">
        <Link
          href={routes.newPet}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-cover px-4 text-[14px] font-semibold text-cover-ink transition-colors duration-150 hover:bg-cover-deep"
        >
          <Plus className="size-4" strokeWidth={2.5} aria-hidden />
          Add pet
        </Link>
      </div>
    </section>
  );
}
