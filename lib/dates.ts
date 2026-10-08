const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Whether `value` is a `YYYY-MM-DD` calendar date string. */
export function isIsoDate(value: string): boolean {
  return ISO_DATE.test(value);
}

/**
 * The calendar date `months` months after `date` (`YYYY-MM-DD`). A day that
 * doesn't exist in the target month lands on its last day, so Jan 31 plus a
 * month is Feb 28 (29 in a leap year) and Feb 29 plus a year is Feb 28.
 */
export function addMonths(date: string, months: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const index = year * 12 + (month - 1) + months;
  const targetYear = Math.floor(index / 12);
  const targetMonth = index - targetYear * 12;
  const lastDay = new Date(
    Date.UTC(targetYear, targetMonth + 1, 0),
  ).getUTCDate();
  return [
    String(targetYear).padStart(4, "0"),
    String(targetMonth + 1).padStart(2, "0"),
    String(Math.min(day, lastDay)).padStart(2, "0"),
  ].join("-");
}
