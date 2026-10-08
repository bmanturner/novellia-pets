import { Plus } from "lucide-react";
import Link from "next/link";
import { routes } from "@/lib/routes";

/** The e-passport chip symbol printed on passport covers. */
function ChipMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 34 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
      className={className}
    >
      <rect x="1" y="1" width="32" height="20" rx="1.5" />
      <circle cx="17" cy="11" r="5" />
      <path d="M1 11h11M22 11h11M8 1v5M26 1v5M8 16v5M26 16v5" />
    </svg>
  );
}

export function TopBar() {
  return (
    <header className="bg-cover text-cover-ink">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href={routes.home}
          className="flex items-center gap-3 rounded-sm text-foil focus-visible:outline-foil"
        >
          <ChipMark className="h-[22px] w-auto" />
          <span className="text-[15px] font-bold tracking-[0.16em] uppercase">
            Novellia Pets
          </span>
        </Link>
        <Link
          href={routes.newPet}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-cover-ink px-3.5 text-[14px] font-semibold text-cover transition-colors duration-150 hover:bg-white focus-visible:outline-foil"
        >
          <Plus className="size-4" strokeWidth={2.5} aria-hidden />
          Add pet
        </Link>
      </div>
    </header>
  );
}
