import { expect, test } from "vitest";
import { addMonths } from "./dates";

test("a month or a year later keeps the day of the month", () => {
  expect(addMonths("2026-10-08", 1)).toBe("2026-11-08");
  expect(addMonths("2026-10-08", 12)).toBe("2027-10-08");
});

test("a month later rolls over into the next year", () => {
  expect(addMonths("2026-12-15", 1)).toBe("2027-01-15");
});

test("a day the target month lacks lands on its last day", () => {
  expect(addMonths("2027-01-31", 1)).toBe("2027-02-28");
  expect(addMonths("2028-01-31", 1)).toBe("2028-02-29");
  expect(addMonths("2026-03-31", 1)).toBe("2026-04-30");
  expect(addMonths("2028-02-29", 12)).toBe("2029-02-28");
});
