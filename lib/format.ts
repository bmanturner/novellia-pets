import type { PetSex } from "@/db/models/pet";

/** A `YYYY-MM-DD` calendar date as a local `Date` at midnight. */
function toDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * "Fri, Oct 17" for an upcoming date this year; "Mar 20, 2026" for any past
 * date or another year, so history is never ambiguous about which year.
 */
export function formatDate(date: string, today: string): string {
  const upcomingThisYear =
    date >= today && date.slice(0, 4) === today.slice(0, 4);
  return toDate(date).toLocaleDateString(
    "en-US",
    upcomingThisYear
      ? { weekday: "short", month: "short", day: "numeric" }
      : { month: "short", day: "numeric", year: "numeric" },
  );
}

/** "Thursday, October 8", or "Thursday, October 8, 2026" `withYear`. */
export function formatLongDate(date: string, withYear = false): string {
  return toDate(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    ...(withYear && { year: "numeric" }),
  });
}

/** "Oct 8, 2026": always with the year, for documents read out of context. */
export function formatFullDate(date: string): string {
  return toDate(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Age in the largest whole unit: "7 years", "8 months", "3 weeks". */
export function formatAge(dateOfBirth: string, today: string): string {
  const born = toDate(dateOfBirth);
  const now = toDate(today);
  let months =
    (now.getFullYear() - born.getFullYear()) * 12 +
    (now.getMonth() - born.getMonth());
  if (now.getDate() < born.getDate()) months -= 1;

  if (months >= 24) return plural(Math.floor(months / 12), "year");
  if (months >= 1) return plural(months, "month");
  const days = Math.round((now.getTime() - born.getTime()) / 86_400_000);
  return days >= 7 ? plural(Math.floor(days / 7), "week") : "Newborn";
}

export function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

/** "Female, spayed", "Male, intact", "Unknown". */
export function formatSex(sex: PetSex, neutered: boolean | null): string {
  if (sex === "unknown") return "Unknown";
  const label = sex === "female" ? "Female" : "Male";
  if (neutered === null) return label;
  if (!neutered) return `${label}, intact`;
  return `${label}, ${sex === "female" ? "spayed" : "neutered"}`;
}

/** Groups an all-digit microchip number in threes; anything else as entered. */
export function formatMicrochip(id: string): string {
  return /^\d+$/.test(id) ? id.replace(/(\d{3})(?=\d)/g, "$1 ") : id;
}
