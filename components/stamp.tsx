import type { CSSProperties } from "react";
import type { CareStatus } from "@/db/models/care";

const LABELS: Record<CareStatus, string> = {
  overdue: "Overdue",
  "due-soon": "Due soon",
  "up-to-date": "Up to date",
};

const INK: Record<CareStatus, string> = {
  overdue: "text-overdue bg-overdue/[0.06]",
  "due-soon": "text-due-soon bg-due-soon/[0.06]",
  "up-to-date": "text-up-to-date/85",
};

const INK_ON_COVER: Record<CareStatus, string> = {
  overdue: "text-overdue-on-cover",
  "due-soon": "text-[#d9ccff]",
  "up-to-date": "text-cover-ink",
};

// Hand-stamped tilts; a seed picks one so each pet's stamp keeps its angle.
const TILTS = [-5, -2, 3, -4, 2, -3];

/**
 * Care status as an ink stamp: real text, double-ruled, slightly tilted,
 * multiplied into the page like ink. `seed` (e.g. a pet id) gives a stable
 * per-instance tilt; `inked` replays the stamp-down after a dose is logged.
 */
export function Stamp({
  status,
  onCover = false,
  inked = false,
  tilt,
  seed,
  className = "",
}: {
  status: CareStatus;
  onCover?: boolean;
  inked?: boolean;
  tilt?: number;
  seed?: number;
  className?: string;
}) {
  const angle =
    tilt ?? (seed === undefined ? -4 : TILTS[Math.abs(seed) % TILTS.length]);
  return (
    <span
      style={{ "--stamp-tilt": `${angle}deg` } as CSSProperties}
      className={[
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-[3px] border-[3px] border-double border-current px-2.5 py-1",
        "text-[12px] leading-none font-extrabold tracking-[0.14em] uppercase",
        "[transform:rotate(var(--stamp-tilt))]",
        onCover
          ? INK_ON_COVER[status]
          : `${INK[status]} opacity-[0.92] mix-blend-multiply`,
        inked ? "animate-[stamp-down_240ms_var(--ease-out-expo)_both]" : "",
        className,
      ].join(" ")}
    >
      {LABELS[status]}
    </span>
  );
}
