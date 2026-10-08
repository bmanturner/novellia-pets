import type { Pet } from "@/db/models/pet";

const SIZES = {
  // Passport photo proportions (35 × 45 mm).
  photo: {
    box: "h-[112px] w-[88px] rounded-[4px]",
    art: "size-[72px]",
    emoji: "text-[44px]",
  },
  row: { box: "h-12 w-10 rounded-[3px]", art: "size-8", emoji: "text-[22px]" },
  inline: { box: "h-6 w-5 rounded-[2px]", art: "size-4", emoji: "text-[13px]" },
} as const;

export type SpeciesMarkSize = keyof typeof SIZES;

/**
 * The species in a passport photo box, given its resolved stamp art URL
 * (`null` until the art exists, when the emoji holds the space). Safe in
 * client components; server code uses `SpeciesMark`, which resolves the art.
 * Decorative: the species name is always shown as text.
 */
export function SpeciesMarkView({
  species,
  art,
  size,
  onCover = false,
}: {
  species: Pet["species"];
  art: string | null;
  size: SpeciesMarkSize;
  onCover?: boolean;
}) {
  const { box, art: artSize, emoji } = SIZES[size];
  return (
    <span
      aria-hidden
      className={[
        "grid shrink-0 place-items-center overflow-hidden border",
        onCover
          ? "border-cover-ink/25 bg-cover-ink/10 text-cover-ink"
          : "border-rule bg-page-tint text-cover",
        box,
      ].join(" ")}
    >
      {art ? (
        <span
          className={`${artSize} bg-current`}
          style={{
            maskImage: `url(${art})`,
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
          }}
        />
      ) : (
        <span className={`${emoji} leading-none grayscale-[0.35]`}>
          {species.emoji}
        </span>
      )}
    </span>
  );
}
