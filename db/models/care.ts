import { db } from "@/db";
import { recordDetailsSchemas } from "./medical-record";
import type { MedicalRecordTypeId } from "./medical-record-type";
import { listPets } from "./pet";
import type { Pet } from "./pet";

export const DUE_SOON_DAYS = 30;
export type CareStatus = "overdue" | "due-soon" | "up-to-date";
export type PetRef = Pick<Pet, "id" | "name" | "species">;

export type DueItem = {
  recordId: number;
  pet: PetRef;
  typeId: MedicalRecordTypeId;
  typeName: string;
  title: string;
  dueOn: string;
  daysUntilDue: number;
  status: CareStatus;
};

export type PetCareSummary = {
  pet: Pet;
  status: CareStatus;
  nextDue: DueItem | null;
  overdueCount: number;
  dueSoonCount: number;
};

export type ActiveMedication = {
  recordId: number;
  pet: PetRef;
  title: string;
  dosage: string | null;
  frequency: string | null;
  prescribedBy: string | null;
  startedOn: string;
  endsOn: string | null;
  refillOn: string | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Calendar date (YYYY-MM-DD) of `date` in the server's local time zone. */
export function toLocalDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function utcDay(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

/** Whole days from `from` to `to` (both YYYY-MM-DD); negative when `to` is earlier. DST-safe. */
export function daysBetween(from: string, to: string): number {
  return Math.round((utcDay(to) - utcDay(from)) / DAY_MS);
}

function statusFor(daysUntilDue: number): CareStatus {
  if (daysUntilDue < 0) return "overdue";
  return daysUntilDue <= DUE_SOON_DAYS ? "due-soon" : "up-to-date";
}

function compareText(a: string, b: string): number {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  return x < y ? -1 : x > y ? 1 : 0;
}

type CareRecord = {
  id: number;
  petId: number;
  typeId: MedicalRecordTypeId;
  typeName: string;
  title: string;
  occurredOn: string | null;
  endedOn: string | null;
  dueOn: string | null;
  details: string;
};

/** Every record of the household's pets, with its type name. */
async function loadRecords(
  householdId: number,
  petId?: number,
): Promise<CareRecord[]> {
  let query = db
    .selectFrom("medicalRecord")
    .innerJoin("pet", "pet.id", "medicalRecord.petId")
    .innerJoin(
      "medicalRecordType",
      "medicalRecordType.id",
      "medicalRecord.typeId",
    )
    .where("pet.householdId", "=", householdId);
  if (petId !== undefined) {
    query = query.where("medicalRecord.petId", "=", petId);
  }
  const rows = await query
    .select([
      "medicalRecord.id",
      "medicalRecord.petId",
      "medicalRecord.typeId",
      "medicalRecordType.name as typeName",
      "medicalRecord.title",
      "medicalRecord.occurredOn",
      "medicalRecord.endedOn",
      "medicalRecord.dueOn",
      "medicalRecord.details",
    ])
    .execute();
  return rows as CareRecord[];
}

/**
 * The newest record of each item (same pet, type and title, ignoring case and
 * outer whitespace): latest `occurredOn` (null oldest), then highest id.
 */
function newestPerItem<
  T extends Pick<
    CareRecord,
    "id" | "petId" | "typeId" | "title" | "occurredOn"
  >,
>(records: T[]): T[] {
  const newest = new Map<string, T>();
  for (const record of records) {
    const key = `${record.petId}|${record.typeId}|${record.title.trim().toLowerCase()}`;
    const current = newest.get(key);
    const date = record.occurredOn ?? "";
    const currentDate = current?.occurredOn ?? "";
    if (
      !current ||
      date > currentDate ||
      (date === currentDate && record.id > current.id)
    ) {
      newest.set(key, record);
    }
  }
  return [...newest.values()];
}

function isEnded(record: CareRecord, today: string): boolean {
  return record.endedOn !== null && record.endedOn < today;
}

/** Live due items at every horizon, soonest first. */
async function listLiveDueItems(
  householdId: number,
  today: string,
): Promise<DueItem[]> {
  const [pets, records] = await Promise.all([
    listPets(householdId),
    loadRecords(householdId),
  ]);
  return liveDueItems(
    new Map(pets.map((pet) => [pet.id, pet])),
    records,
    today,
  );
}

function liveDueItems(
  petsById: Map<number, Pet>,
  records: CareRecord[],
  today: string,
): DueItem[] {
  const items: DueItem[] = [];
  for (const record of newestPerItem(records)) {
    const pet = petsById.get(record.petId);
    if (!pet || record.dueOn === null || isEnded(record, today)) continue;
    const daysUntilDue = daysBetween(today, record.dueOn);
    items.push({
      recordId: record.id,
      pet: { id: pet.id, name: pet.name, species: pet.species },
      typeId: record.typeId,
      typeName: record.typeName,
      title: record.title,
      dueOn: record.dueOn,
      daysUntilDue,
      status: statusFor(daysUntilDue),
    });
  }
  return items.sort(
    (a, b) =>
      a.daysUntilDue - b.daysUntilDue ||
      compareText(a.pet.name, b.pet.name) ||
      compareText(a.title, b.title) ||
      a.recordId - b.recordId,
  );
}

/** Overdue and due-soon items across the household, most overdue first, then soonest due; ties by pet name (case-insensitive) then title. */
export async function listDueItems(
  householdId: number,
  today: string,
): Promise<DueItem[]> {
  const items = await listLiveDueItems(householdId, today);
  return items.filter((item) => item.status !== "up-to-date");
}

const STATUS_RANK: Record<CareStatus, number> = {
  overdue: 0,
  "due-soon": 1,
  "up-to-date": 2,
};

/** Separators people type or read out in microchip numbers ("985 141-000…"). */
const CHIP_SEPARATORS = /[\s.-]/g;

/** `query` is already trimmed and lowercased. */
function matchesQuery(pet: Pet, query: string): boolean {
  const chipQuery = query.replace(CHIP_SEPARATORS, "");
  return (
    pet.name.toLowerCase().includes(query) ||
    Boolean(pet.breed?.toLowerCase().includes(query)) ||
    Boolean(
      chipQuery &&
      pet.microchipId
        ?.replace(CHIP_SEPARATORS, "")
        .toLowerCase()
        .includes(chipQuery),
    )
  );
}

/**
 * Every pet in the household with its care status, sorted needs-attention first:
 * overdue pets (most overdue first), then due-soon (soonest first), then up to date
 * (by name, case-insensitive). Filters combine with AND: `query` is a trimmed,
 * case-insensitive substring match on name, breed or microchip number (ignoring
 * spaces, dots and hyphens in the number); `speciesId` exact; `status` exact.
 * Blank/undefined filters are ignored.
 */
export async function listPetCareSummaries(
  householdId: number,
  today: string,
  filters?: { query?: string; speciesId?: string; status?: CareStatus },
): Promise<PetCareSummary[]> {
  const [pets, items] = await Promise.all([
    listPets(householdId),
    listLiveDueItems(householdId, today),
  ]);
  const itemsByPet = Map.groupBy(items, (item) => item.pet.id);

  const query = filters?.query?.trim().toLowerCase();
  const { speciesId, status } = filters ?? {};

  const summaries: PetCareSummary[] = [];
  for (const pet of pets) {
    if (query && !matchesQuery(pet, query)) continue;
    if (speciesId && pet.species.id !== speciesId) continue;

    const petItems = itemsByPet.get(pet.id) ?? [];
    const nextDue = petItems[0] ?? null;
    const summary: PetCareSummary = {
      pet,
      status: nextDue ? nextDue.status : "up-to-date",
      nextDue,
      overdueCount: petItems.filter((item) => item.status === "overdue").length,
      dueSoonCount: petItems.filter((item) => item.status === "due-soon")
        .length,
    };
    if (status && summary.status !== status) continue;
    summaries.push(summary);
  }

  // `nextDue` is the pet's soonest item, so it is also its most overdue one.
  return summaries.sort(
    (a, b) =>
      STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
      (a.status === "up-to-date"
        ? 0
        : a.nextDue!.daysUntilDue - b.nextDue!.daysUntilDue) ||
      compareText(a.pet.name, b.pet.name) ||
      a.pet.id - b.pet.id,
  );
}

/**
 * Medications in effect today: type "medication", occurredOn <= today, not ended
 * (endedOn null or >= today), and only the newest record per (pet, title) item.
 * Sorted by pet name (case-insensitive), then title.
 */
export async function listActiveMedications(
  householdId: number,
  today: string,
): Promise<ActiveMedication[]> {
  const [pets, records] = await Promise.all([
    listPets(householdId),
    loadRecords(householdId),
  ]);
  return activeMedications(
    new Map(pets.map((pet) => [pet.id, pet])),
    records,
    today,
  );
}

function activeMedications(
  petsById: Map<number, Pet>,
  records: CareRecord[],
  today: string,
): ActiveMedication[] {
  // A record that hasn't started yet doesn't supersede one that's in effect.
  const started = records.filter(
    (record) =>
      record.typeId === "medication" &&
      record.occurredOn !== null &&
      record.occurredOn <= today,
  );

  const medications: ActiveMedication[] = [];
  for (const record of newestPerItem(started)) {
    const pet = petsById.get(record.petId);
    if (!pet || isEnded(record, today)) continue;
    const details = recordDetailsSchemas.medication.parse(
      JSON.parse(record.details),
    );
    medications.push({
      recordId: record.id,
      pet: { id: pet.id, name: pet.name, species: pet.species },
      title: record.title,
      dosage: details.dosage || null,
      frequency: details.frequency || null,
      prescribedBy: details.prescribedBy || null,
      startedOn: record.occurredOn!,
      endsOn: record.endedOn,
      refillOn: record.dueOn,
    });
  }
  return medications.sort(
    (a, b) =>
      compareText(a.pet.name, b.pet.name) ||
      compareText(a.title, b.title) ||
      a.recordId - b.recordId,
  );
}

export type ActiveCondition = {
  recordId: number;
  title: string;
  kind: "allergy" | "condition";
  severity: "mild" | "moderate" | "severe" | null;
  reaction: string | null;
};

export type LatestVaccination = {
  recordId: number;
  title: string;
  givenOn: string;
  dueOn: string | null;
  clinic: string | null;
};

export type LastVisit = {
  recordId: number;
  title: string;
  occurredOn: string;
  clinic: string | null;
  veterinarian: string | null;
  weight: { value: number; unit: "kg" | "lb" } | null;
};

export type PetCare = {
  status: CareStatus;
  /** This pet's overdue and due-soon items, most urgent first. */
  dueItems: DueItem[];
  /** The soonest item due beyond the due-soon window. */
  nextBeyond: DueItem | null;
  medications: ActiveMedication[];
  conditions: ActiveCondition[];
  vaccinations: LatestVaccination[];
  lastVisit: LastVisit | null;
};

const SEVERITY_RANK = { severe: 0, moderate: 1, mild: 2 } as const;

/** `pet` must come from getPet(householdId, …). One records query. */
export async function getPetCare(
  householdId: number,
  pet: Pet,
  today: string,
): Promise<PetCare> {
  const records = await loadRecords(householdId, pet.id);
  const petsById = new Map([[pet.id, pet]]);

  const live = liveDueItems(petsById, records, today);
  const dueItems = live.filter((item) => item.status !== "up-to-date");

  const conditions = newestPerItem(
    records.filter(
      (record) =>
        record.typeId === "condition" &&
        (record.occurredOn === null || record.occurredOn <= today),
    ),
  )
    .filter((record) => !isEnded(record, today))
    .map((record) => {
      const details = recordDetailsSchemas.condition.parse(
        JSON.parse(record.details),
      );
      return {
        recordId: record.id,
        title: record.title,
        kind: details.kind,
        severity: details.severity,
        reaction: details.reaction || null,
      } satisfies ActiveCondition;
    })
    .sort(
      (a, b) =>
        Number(a.kind === "condition") - Number(b.kind === "condition") ||
        (a.severity ? SEVERITY_RANK[a.severity] : 3) -
          (b.severity ? SEVERITY_RANK[b.severity] : 3) ||
        compareText(a.title, b.title),
    );

  const vaccinations = newestPerItem(
    records.filter(
      (record) =>
        record.typeId === "vaccination" &&
        record.occurredOn !== null &&
        record.occurredOn <= today,
    ),
  )
    .map((record) => {
      const details = recordDetailsSchemas.vaccination.parse(
        JSON.parse(record.details),
      );
      return {
        recordId: record.id,
        title: record.title,
        givenOn: record.occurredOn!,
        dueOn: record.dueOn,
        clinic: details.clinic || null,
      } satisfies LatestVaccination;
    })
    .sort((a, b) => compareText(a.title, b.title));

  let latestVisit: CareRecord | null = null;
  for (const record of records) {
    if (
      record.typeId !== "visit" ||
      record.occurredOn === null ||
      record.occurredOn > today
    ) {
      continue;
    }
    if (
      !latestVisit ||
      record.occurredOn > latestVisit.occurredOn! ||
      (record.occurredOn === latestVisit.occurredOn &&
        record.id > latestVisit.id)
    ) {
      latestVisit = record;
    }
  }
  let lastVisit: LastVisit | null = null;
  if (latestVisit) {
    const details = recordDetailsSchemas.visit.parse(
      JSON.parse(latestVisit.details),
    );
    lastVisit = {
      recordId: latestVisit.id,
      title: latestVisit.title,
      occurredOn: latestVisit.occurredOn!,
      clinic: details.clinic || null,
      veterinarian: details.veterinarian || null,
      weight: details.weight,
    };
  }

  return {
    status: dueItems[0]?.status ?? "up-to-date",
    dueItems,
    nextBeyond: live.find((item) => item.status === "up-to-date") ?? null,
    medications: activeMedications(petsById, records, today),
    conditions,
    vaccinations,
    lastVisit,
  };
}
