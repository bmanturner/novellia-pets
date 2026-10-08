import { formatMicrochip } from "@/lib/format";

/** The card footer of a pet's data page: microchip number, or its absence. */
export function MicrochipStrip({ microchipId }: { microchipId: string | null }) {
  return microchipId ? (
    <p className="rounded-b-xl border-t border-rule bg-page-tint px-4 py-2 font-mono text-[12px] leading-4 tracking-[0.1em] text-ink-muted uppercase">
      <span className="sr-only">Microchip: </span>
      <span aria-hidden>Chip </span>
      {formatMicrochip(microchipId)}
    </p>
  ) : (
    <p className="rounded-b-xl border-t border-rule bg-page-tint px-4 py-2 text-[11px] leading-4 font-semibold tracking-[0.08em] text-ink-muted uppercase">
      No microchip on file
    </p>
  );
}
