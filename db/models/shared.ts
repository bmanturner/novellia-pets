import { sql } from "kysely";
import { z } from "zod";

/** Current time as an ISO-8601 UTC string, matching the column defaults. */
export const nowIso = sql<string>`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`;

/** Optional free text: trimmed, and blank becomes `null`. */
export function nullableText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => value || null);
}

/** Calendar date (`YYYY-MM-DD`). */
export const requiredDate = z.iso.date();

/** Optional calendar date; blank becomes `null`. */
export const nullableDate = z
  .union([requiredDate, z.literal("")])
  .nullish()
  .transform((value) => value || null);

/** A field that doesn't apply: accepts only absent or `null`. */
export const notApplicable = z
  .null()
  .optional()
  .transform(() => null);
