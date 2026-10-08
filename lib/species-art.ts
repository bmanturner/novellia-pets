import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";

const EXTENSIONS = ["svg", "png", "webp"] as const;
const publicDir = path.join(process.cwd(), "public");

/**
 * Public URL of the custom stamp art for a species (`public/species/<id>.svg`,
 * `.png` or `.webp`), or `null` until it exists. Checked per request so art
 * dropped into `public/species/` shows up without a restart.
 */
export function speciesArtUrl(speciesId: string): string | null {
  if (!/^[a-z0-9-]+$/.test(speciesId)) return null;
  for (const extension of EXTENSIONS) {
    const url = `/species/${speciesId}.${extension}`;
    if (existsSync(path.join(publicDir, url))) return url;
  }
  return null;
}
