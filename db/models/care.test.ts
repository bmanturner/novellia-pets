import { beforeEach, expect, test } from "vitest";
import { db } from "@/db";
import {
  daysBetween,
  listActiveMedications,
  listDueItems,
  listPetCareSummaries,
  toLocalDate,
} from "./care";
import { getCurrentHouseholdId } from "./household";
import { createMedicalRecord } from "./medical-record";
import type { MedicalRecordInput } from "./medical-record";
import { createPet } from "./pet";

const today = "2026-06-15";
const otherHouseholdId = 2;

let householdId: number;
let milo: number;

beforeEach(async () => {
  householdId = await getCurrentHouseholdId();
  await db
    .insertInto("household")
    .values({ id: otherHouseholdId, name: "Other" })
    .execute();
  ({ id: milo } = await createPet(householdId, {
    name: "Milo",
    speciesId: "dog",
  }));
});

async function addRecord(
  petId: number,
  input: MedicalRecordInput,
  owner = householdId,
) {
  const record = await createMedicalRecord(owner, petId, input);
  return record!.id;
}

function vaccination(
  title: string,
  occurredOn: string,
  dueOn?: string,
): MedicalRecordInput {
  return { typeId: "vaccination", title, occurredOn, dueOn, details: {} };
}

function medication(
  title: string,
  occurredOn: string,
  extra: { endedOn?: string; dueOn?: string } = {},
): MedicalRecordInput {
  return {
    typeId: "medication",
    title,
    occurredOn,
    ...extra,
    details: { dosage: "5 mg", frequency: "Daily" },
  };
}

test("due items honor the window boundaries", async () => {
  await addRecord(milo, vaccination("Yesterday", "2026-01-01", "2026-06-14"));
  await addRecord(milo, vaccination("Today", "2026-01-01", "2026-06-15"));
  await addRecord(milo, vaccination("Day 30", "2026-01-01", "2026-07-15"));
  await addRecord(milo, vaccination("Day 31", "2026-01-01", "2026-07-16"));

  const items = await listDueItems(householdId, today);
  expect(
    items.map((i) => [i.title, i.daysUntilDue, i.status, i.typeName]),
  ).toEqual([
    ["Yesterday", -1, "overdue", "Vaccination"],
    ["Today", 0, "due-soon", "Vaccination"],
    ["Day 30", 30, "due-soon", "Vaccination"],
  ]);
  expect(items[0].pet).toEqual({
    id: milo,
    name: "Milo",
    species: { id: "dog", name: "Dog", emoji: "🐶" },
  });
});

test("a due date beyond the window is up to date but still the next due", async () => {
  await addRecord(milo, vaccination("Day 31", "2026-01-01", "2026-07-16"));

  const [summary] = await listPetCareSummaries(householdId, today);
  expect(summary.status).toBe("up-to-date");
  expect(summary.overdueCount).toBe(0);
  expect(summary.dueSoonCount).toBe(0);
  expect(summary.nextDue).toMatchObject({
    title: "Day 31",
    daysUntilDue: 31,
    status: "up-to-date",
  });
});

test("a pet with no due dates has no next due", async () => {
  const [summary] = await listPetCareSummaries(householdId, today);
  expect(summary).toMatchObject({ status: "up-to-date", nextDue: null });
  expect(summary.pet.id).toBe(milo);
});

test("a newer record of the same item supersedes the older due date", async () => {
  await addRecord(milo, vaccination("Rabies", "2025-01-01", "2026-01-01"));
  const newer = await addRecord(
    milo,
    vaccination("  rabies ", "2026-01-01", "2026-06-20"),
  );

  const items = await listDueItems(householdId, today);
  expect(items.map((i) => i.recordId)).toEqual([newer]);
});

test("a newer record without a due date leaves the item with no live due date", async () => {
  await addRecord(milo, vaccination("Rabies", "2025-01-01", "2026-01-01"));
  await addRecord(milo, vaccination("RABIES", "2026-01-01"));

  expect(await listDueItems(householdId, today)).toEqual([]);
  const [summary] = await listPetCareSummaries(householdId, today);
  expect(summary.nextDue).toBeNull();
});

test("the highest id wins when records share an occurrence date", async () => {
  await addRecord(milo, vaccination("Rabies", "2026-01-01", "2026-01-05"));
  const later = await addRecord(
    milo,
    vaccination("Rabies", "2026-01-01", "2026-06-20"),
  );

  const items = await listDueItems(householdId, today);
  expect(items.map((i) => i.recordId)).toEqual([later]);
});

test("a record with a different title or type is a separate item", async () => {
  const rabies = await addRecord(
    milo,
    vaccination("Rabies", "2025-01-01", "2026-06-01"),
  );
  const bordetella = await addRecord(
    milo,
    vaccination("Bordetella", "2026-01-01", "2026-06-20"),
  );
  const visit = await addRecord(milo, {
    typeId: "visit",
    title: "Rabies",
    occurredOn: "2026-02-01",
    dueOn: "2026-06-10",
    details: {},
  });

  const items = await listDueItems(householdId, today);
  expect(items.map((i) => i.recordId).sort()).toEqual(
    [rabies, bordetella, visit].sort(),
  );
});

test("the same title on another pet is a separate item", async () => {
  const luna = await createPet(householdId, { name: "Luna", speciesId: "cat" });
  await addRecord(milo, vaccination("Rabies", "2025-01-01", "2026-06-01"));
  await addRecord(luna.id, vaccination("Rabies", "2026-01-01", "2026-06-20"));

  expect(await listDueItems(householdId, today)).toHaveLength(2);
});

test("ended records produce no due item", async () => {
  await addRecord(
    milo,
    medication("Ended", "2026-01-01", {
      endedOn: "2026-06-14",
      dueOn: "2026-06-10",
    }),
  );
  const endsToday = await addRecord(
    milo,
    medication("Ends today", "2026-01-01", {
      endedOn: "2026-06-15",
      dueOn: "2026-06-20",
    }),
  );

  const items = await listDueItems(householdId, today);
  expect(items.map((i) => i.recordId)).toEqual([endsToday]);
});

test("an ended newest record does not revive an older one", async () => {
  await addRecord(
    milo,
    medication("Pill", "2026-01-01", { dueOn: "2026-06-10" }),
  );
  await addRecord(
    milo,
    medication("Pill", "2026-03-01", {
      endedOn: "2026-04-01",
      dueOn: "2026-06-12",
    }),
  );

  expect(await listDueItems(householdId, today)).toEqual([]);
});

test("due items sort most overdue first, then by pet name and title", async () => {
  const abby = await createPet(householdId, { name: "abby", speciesId: "cat" });
  await addRecord(milo, vaccination("B", "2026-01-01", "2026-06-20"));
  await addRecord(milo, vaccination("A", "2026-01-01", "2026-06-20"));
  await addRecord(abby.id, vaccination("Z", "2026-01-01", "2026-06-20"));
  await addRecord(milo, vaccination("Late", "2026-01-01", "2026-06-01"));

  const items = await listDueItems(householdId, today);
  expect(items.map((i) => `${i.pet.name}:${i.title}`)).toEqual([
    "Milo:Late",
    "abby:Z",
    "Milo:A",
    "Milo:B",
  ]);
});

test("a medication that has not started is not active", async () => {
  await addRecord(milo, medication("Future", "2026-06-16"));
  const startsToday = await addRecord(milo, medication("Today", "2026-06-15"));

  const active = await listActiveMedications(householdId, today);
  expect(active.map((m) => m.recordId)).toEqual([startsToday]);
});

test("a medication is active through its end date only", async () => {
  await addRecord(
    milo,
    medication("Ended", "2026-01-01", { endedOn: "2026-06-14" }),
  );
  const endsToday = await addRecord(
    milo,
    medication("Ends today", "2026-01-01", { endedOn: "2026-06-15" }),
  );

  const active = await listActiveMedications(householdId, today);
  expect(active.map((m) => m.recordId)).toEqual([endsToday]);
});

test("active medications map record fields and ignore other types", async () => {
  const id = await addRecord(
    milo,
    medication("Apoquel", "2026-05-01", {
      endedOn: "2026-12-01",
      dueOn: "2026-07-01",
    }),
  );
  await addRecord(milo, vaccination("Rabies", "2026-01-01", "2026-06-20"));
  await addRecord(milo, {
    typeId: "medication",
    title: "Bare",
    occurredOn: "2026-05-01",
    details: {},
  });

  expect(await listActiveMedications(householdId, today)).toEqual([
    {
      recordId: expect.any(Number),
      pet: { id: milo, name: "Milo", species: expect.any(Object) },
      title: "Apoquel",
      dosage: "5 mg",
      frequency: "Daily",
      startedOn: "2026-05-01",
      endsOn: "2026-12-01",
      refillOn: "2026-07-01",
    },
    {
      recordId: expect.any(Number),
      pet: { id: milo, name: "Milo", species: expect.any(Object) },
      title: "Bare",
      dosage: null,
      frequency: null,
      startedOn: "2026-05-01",
      endsOn: null,
      refillOn: null,
    },
  ]);
  const [first] = await listActiveMedications(householdId, today);
  expect(first.recordId).toBe(id);
});

test("only the newest medication record per item is active", async () => {
  await addRecord(milo, medication("Pill", "2026-01-01"));
  const newer = await addRecord(milo, medication(" pill", "2026-04-01"));
  // Ended newest record: the item is over; the older one doesn't resurface.
  await addRecord(milo, medication("Drops", "2026-01-01"));
  await addRecord(
    milo,
    medication("Drops", "2026-03-01", { endedOn: "2026-04-01" }),
  );

  const active = await listActiveMedications(householdId, today);
  expect(active.map((m) => m.recordId)).toEqual([newer]);
});

test("a future record does not supersede the medication in effect", async () => {
  const current = await addRecord(milo, medication("Pill", "2026-01-01"));
  await addRecord(milo, medication("Pill", "2026-09-01"));

  const active = await listActiveMedications(householdId, today);
  expect(active.map((m) => m.recordId)).toEqual([current]);
});

test("active medications sort by pet name, then title", async () => {
  const abby = await createPet(householdId, { name: "abby", speciesId: "cat" });
  await addRecord(milo, medication("B", "2026-01-01"));
  await addRecord(milo, medication("a", "2026-01-01"));
  await addRecord(abby.id, medication("Z", "2026-01-01"));

  const active = await listActiveMedications(householdId, today);
  expect(active.map((m) => `${m.pet.name}:${m.title}`)).toEqual([
    "abby:Z",
    "Milo:a",
    "Milo:B",
  ]);
});

test("all queries are scoped to the household", async () => {
  const stranger = await createPet(otherHouseholdId, {
    name: "Stranger",
    speciesId: "cat",
  });
  await addRecord(
    stranger.id,
    vaccination("Rabies", "2026-01-01", "2026-06-01"),
    otherHouseholdId,
  );
  await addRecord(
    stranger.id,
    medication("Pill", "2026-01-01"),
    otherHouseholdId,
  );
  await addRecord(milo, vaccination("Own", "2026-01-01", "2026-06-20"));

  expect((await listDueItems(householdId, today)).map((i) => i.title)).toEqual([
    "Own",
  ]);
  expect(await listActiveMedications(householdId, today)).toEqual([]);
  const summaries = await listPetCareSummaries(householdId, today);
  expect(summaries.map((s) => s.pet.name)).toEqual(["Milo"]);

  expect(await listDueItems(otherHouseholdId, today)).toHaveLength(1);
  expect(await listActiveMedications(otherHouseholdId, today)).toHaveLength(1);
  expect(
    (await listPetCareSummaries(otherHouseholdId, today)).map(
      (s) => s.pet.name,
    ),
  ).toEqual(["Stranger"]);
});

async function seedSummaries() {
  const names: Record<string, number> = { Milo: milo };
  const pets: [string, string, string | undefined, string | undefined][] = [
    ["Soon Late", "cat", "Siamese", "2026-06-25"],
    ["Soon Early", "dog", "Beagle", "2026-06-16"],
    ["Very Overdue", "dog", "Poodle", "2026-05-01"],
    ["Slightly Overdue", "cat", undefined, "2026-06-14"],
    ["Beta", "rabbit", "Lop", undefined],
    ["alpha", "cat", "Beagle Mix", "2026-09-01"],
  ];
  for (const [name, speciesId, breed, dueOn] of pets) {
    const pet = await createPet(householdId, { name, speciesId, breed });
    names[name] = pet.id;
    if (dueOn) {
      await addRecord(pet.id, vaccination("Rabies", "2026-01-01", dueOn));
    }
  }
  return names;
}

const namesOf = (summaries: { pet: { name: string } }[]) =>
  summaries.map((s) => s.pet.name);

test("summaries sort overdue, then due soon, then up to date by name", async () => {
  await seedSummaries();

  const summaries = await listPetCareSummaries(householdId, today);
  expect(namesOf(summaries)).toEqual([
    "Very Overdue",
    "Slightly Overdue",
    "Soon Early",
    "Soon Late",
    "alpha",
    "Beta",
    "Milo",
  ]);
  expect(summaries.map((s) => s.status)).toEqual([
    "overdue",
    "overdue",
    "due-soon",
    "due-soon",
    "up-to-date",
    "up-to-date",
    "up-to-date",
  ]);
});

test("summaries count overdue and due-soon items and use the worst status", async () => {
  await addRecord(milo, vaccination("A", "2026-01-01", "2026-06-01"));
  await addRecord(milo, vaccination("B", "2026-01-01", "2026-06-02"));
  await addRecord(milo, vaccination("C", "2026-01-01", "2026-06-20"));
  await addRecord(milo, vaccination("D", "2026-01-01", "2027-01-01"));

  const [summary] = await listPetCareSummaries(householdId, today);
  expect(summary).toMatchObject({
    status: "overdue",
    overdueCount: 2,
    dueSoonCount: 1,
  });
  expect(summary.nextDue).toMatchObject({ title: "A", daysUntilDue: -14 });
});

test("the query filter matches name or breed, trimmed and case-insensitive", async () => {
  await seedSummaries();

  expect(
    namesOf(
      await listPetCareSummaries(householdId, today, { query: " SOON " }),
    ),
  ).toEqual(["Soon Early", "Soon Late"]);
  expect(
    namesOf(
      await listPetCareSummaries(householdId, today, { query: "beagle" }),
    ),
  ).toEqual(["Soon Early", "alpha"]);
  expect(
    await listPetCareSummaries(householdId, today, { query: "nothing" }),
  ).toEqual([]);
});

test("the query filter matches microchip numbers, ignoring separators", async () => {
  await createPet(householdId, {
    name: "Rex",
    speciesId: "dog",
    microchipId: "985-141-000123451",
  });

  for (const query of ["985141000123451", "141 000 123", "000123-451"]) {
    expect(
      namesOf(await listPetCareSummaries(householdId, today, { query })),
    ).toEqual(["Rex"]);
  }
  expect(
    await listPetCareSummaries(householdId, today, { query: "985 999" }),
  ).toEqual([]);
});

test("blank filters are ignored", async () => {
  await seedSummaries();

  const all = await listPetCareSummaries(householdId, today);
  expect(
    await listPetCareSummaries(householdId, today, {
      query: "   ",
      speciesId: "",
    }),
  ).toEqual(all);
  expect(await listPetCareSummaries(householdId, today, {})).toEqual(all);
});

test("the species and status filters match exactly", async () => {
  await seedSummaries();

  expect(
    namesOf(
      await listPetCareSummaries(householdId, today, { speciesId: "cat" }),
    ),
  ).toEqual(["Slightly Overdue", "Soon Late", "alpha"]);
  expect(
    namesOf(
      await listPetCareSummaries(householdId, today, { status: "overdue" }),
    ),
  ).toEqual(["Very Overdue", "Slightly Overdue"]);
  expect(
    namesOf(
      await listPetCareSummaries(householdId, today, { status: "up-to-date" }),
    ),
  ).toEqual(["alpha", "Beta", "Milo"]);
});

test("filters combine with AND", async () => {
  await seedSummaries();

  expect(
    namesOf(
      await listPetCareSummaries(householdId, today, {
        query: "beagle",
        speciesId: "dog",
        status: "due-soon",
      }),
    ),
  ).toEqual(["Soon Early"]);
  expect(
    await listPetCareSummaries(householdId, today, {
      query: "beagle",
      speciesId: "dog",
      status: "overdue",
    }),
  ).toEqual([]);
});

test("daysBetween counts whole days across DST changes and month ends", () => {
  expect(daysBetween("2026-03-07", "2026-03-09")).toBe(2);
  expect(daysBetween("2026-10-31", "2026-11-02")).toBe(2);
  expect(daysBetween("2026-06-15", "2026-06-15")).toBe(0);
  expect(daysBetween("2026-06-15", "2026-06-14")).toBe(-1);
  expect(daysBetween("2026-01-31", "2026-03-01")).toBe(29);
  expect(daysBetween("2025-12-31", "2026-12-31")).toBe(365);
});

test("toLocalDate formats with zero padding in local time", () => {
  expect(toLocalDate(new Date(2026, 0, 5, 23, 59, 59))).toBe("2026-01-05");
  expect(toLocalDate(new Date(2026, 11, 31, 0, 0, 0))).toBe("2026-12-31");
  expect(toLocalDate(new Date(987, 2, 9))).toBe("0987-03-09");
});
