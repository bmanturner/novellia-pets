import { expect, test } from "vitest";
import { describeDue, withHumanDates } from "@/lib/chat/human-dates";

const today = "2026-10-09";

test("describeDue words late, today and future dates", () => {
  expect(describeDue("2026-09-29", today)).toBe("10 days late");
  expect(describeDue("2026-10-08", today)).toBe("1 day late");
  expect(describeDue("2026-10-09", today)).toBe("due today");
  expect(describeDue("2026-10-10", today)).toBe("due in 1 day");
  expect(describeDue("2026-10-21", today)).toBe("due in 12 days");
});

test("withHumanDates adds Text beside every date and Relative beside due dates", () => {
  expect(
    withHumanDates({ occurredOn: "2026-09-29", dueOn: "2026-10-21" }, today),
  ).toEqual({
    occurredOn: "2026-09-29",
    occurredOnText: "Sep 29, 2026",
    dueOn: "2026-10-21",
    dueOnText: "Oct 21, 2026",
    dueOnRelative: "due in 12 days",
  });
});

test("withHumanDates handles null, other strings and nested arrays", () => {
  expect(
    withHumanDates(
      {
        dueOn: null,
        title: "2026-09-29 checkup",
        items: [{ pet: { name: "Rex" }, dueOn: "2026-10-08" }],
      },
      today,
    ),
  ).toEqual({
    dueOn: null,
    title: "2026-09-29 checkup",
    items: [
      {
        pet: { name: "Rex" },
        dueOn: "2026-10-08",
        dueOnText: "Oct 8, 2026",
        dueOnRelative: "1 day late",
      },
    ],
  });
  expect(withHumanDates(null, today)).toBeNull();
  expect(withHumanDates(7, today)).toBe(7);
});
