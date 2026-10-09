import { formatFullDate, plural } from "@/lib/format";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
/** Keys whose date is a due date, so it also gets a relative phrase. */
const DUE_KEYS = new Set(["dueOn", "refillOn"]);

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

/** "3 days late", "due today", "due in 12 days", relative to `today` (both `YYYY-MM-DD`). */
export function describeDue(dueOn: string, today: string): string {
  const days = daysBetween(today, dueOn);
  if (days < 0) return `${plural(-days, "day")} late`;
  if (days === 0) return "due today";
  return `due in ${plural(days, "day")}`;
}

/**
 * Copies a tool result, adding a `<key>Text` sibling ("Sep 29, 2026") beside
 * every `YYYY-MM-DD` value, and a `<key>Relative` sibling ("10 days late")
 * beside due dates, so the model can copy people-ready dates instead of
 * formatting or counting them itself.
 */
export function withHumanDates(value: unknown, today: string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => withHumanDates(item, today));
  }
  if (value === null || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    out[key] = withHumanDates(child, today);
    if (typeof child === "string" && ISO_DATE.test(child)) {
      out[`${key}Text`] = formatFullDate(child);
      if (DUE_KEYS.has(key)) out[`${key}Relative`] = describeDue(child, today);
    }
  }
  return out;
}
