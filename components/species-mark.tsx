import type { Pet } from "@/db/models/pet";
import {
  SpeciesMarkView,
  type SpeciesMarkSize,
} from "@/components/species-mark-view";
import { speciesArtUrl } from "@/lib/species-art";

/**
 * The species in a passport photo box. Custom stamp art from
 * `public/species/` is inked in navy; until it exists, the species emoji
 * holds the space. Decorative: the species name is always shown as text.
 */
export function SpeciesMark({
  species,
  size,
  onCover = false,
}: {
  species: Pet["species"];
  size: SpeciesMarkSize;
  onCover?: boolean;
}) {
  return (
    <SpeciesMarkView
      species={species}
      art={speciesArtUrl(species.id)}
      size={size}
      onCover={onCover}
    />
  );
}
