import "server-only";
import { z } from "zod";
import {
  getPetCare,
  listActiveMedications,
  listDueItems,
  listPetCareSummaries,
  toLocalDate,
} from "@/db/models/care";
import { getCurrentHouseholdId } from "@/db/models/household";
import {
  createMedicalRecord,
  deleteMedicalRecord,
  filterMedicalRecords,
  getMedicalRecord,
  listMedicalRecords,
  MedicalRecordInputSchema,
  type MedicalRecordInput,
  updateMedicalRecord,
} from "@/db/models/medical-record";
import {
  listMedicalRecordTypes,
  MEDICAL_RECORD_TYPE_IDS,
} from "@/db/models/medical-record-type";
import {
  createPet,
  deletePet,
  getPet,
  PET_SEXES,
  type Pet,
  type PetInput,
  PetInputSchema,
  updatePet,
} from "@/db/models/pet";
import { nullableDate, nullableText } from "@/db/models/shared";
import { listSpecies } from "@/db/models/species";
import type { MedicalRecordTypeId } from "@/db/models/medical-record-type";
import type { MutationToolName } from "@/lib/chat/contract";

/**
 * One definition per app query/mutation, shared by the chat agent and the MCP
 * server. Tools call the models directly, like the server actions do.
 */
export type ToolContext = { householdId: number; today: string };

type ToolDef<S extends z.ZodType> = {
  description: string;
  inputSchema: S;
  execute: (ctx: ToolContext, input: z.output<S>) => Promise<unknown>;
};
type WriteToolDef<S extends z.ZodType> = ToolDef<S> & {
  /** MCP `destructiveHint`: may overwrite or remove existing data. */
  destructive: boolean;
  /** Question shown to the user before the write runs. Never throws. */
  confirmMessage: (ctx: ToolContext, input: z.output<S>) => Promise<string>;
};

/** Loosely typed view used by the adapters; method syntax keeps it assignable from every concrete def. */
export type AnyToolDef = {
  description: string;
  inputSchema: z.ZodType;
  execute(ctx: ToolContext, input: unknown): Promise<unknown>;
};
export type AnyWriteToolDef = AnyToolDef & {
  destructive: boolean;
  confirmMessage(ctx: ToolContext, input: unknown): Promise<string>;
};

const readTool = <S extends z.ZodType>(def: ToolDef<S>) => def;
const writeTool = <S extends z.ZodType>(
  def: WriteToolDef<S>,
): WriteToolDef<S> => ({
  ...def,
  confirmMessage: async (ctx, input) => {
    try {
      return await def.confirmMessage(ctx, input);
    } catch {
      return "Make this change?";
    }
  },
});

export async function currentToolContext(): Promise<ToolContext> {
  return {
    householdId: await getCurrentHouseholdId(),
    today: toLocalDate(new Date()),
  };
}

function missingPet(id: number): never {
  throw new Error(`No pet with id ${id} in this household.`);
}

function missingRecord(id: number): never {
  throw new Error(`No medical record with id ${id} in this household.`);
}

async function assertSpecies(id: string): Promise<void> {
  if (!(await listSpecies()).some((species) => species.id === id)) {
    throw new Error(`Unknown species "${id}". Call listSpecies for valid ids.`);
  }
}

/** Drops `undefined` values so a patch merge keeps the current value. */
function defined<T extends object>(o: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(o).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

function toPetInput(pet: Pet): PetInput {
  return {
    name: pet.name,
    speciesId: pet.species.id,
    breed: pet.breed,
    sex: pet.sex,
    neutered: pet.neutered,
    dateOfBirth: pet.dateOfBirth,
    microchipId: pet.microchipId,
    notes: pet.notes,
  };
}

async function petName(ctx: ToolContext, petId: number): Promise<string> {
  return (await getPet(ctx.householdId, petId))?.name ?? `pet ${petId}`;
}

/** "Oct 8, 2026" from a `YYYY-MM-DD` calendar date, without a timezone shift. */
function day(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return date;
  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "a", "a and b", "a, b and c". */
function joinWords(parts: string[]): string {
  if (parts.length < 2) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

function sexWords(sex: Pet["sex"], neutered: boolean | null): string | null {
  if (sex === "unknown") return null;
  if (neutered === null) return sex;
  if (!neutered) return `intact ${sex}`;
  return `${sex === "female" ? "spayed" : "neutered"} ${sex}`;
}

async function speciesName(speciesId: string): Promise<string> {
  const species = (await listSpecies()).find((s) => s.id === speciesId);
  return (species?.name ?? speciesId).toLowerCase();
}

function recordLabel(record: {
  typeId: MedicalRecordTypeId;
  details: object;
}): string {
  if (record.typeId === "visit") return "vet visit";
  if (record.typeId === "condition" && "kind" in record.details) {
    return String(record.details.kind);
  }
  return record.typeId;
}

const RECORD_DATE_LABELS: Record<
  MedicalRecordTypeId,
  { occurredOn: string; endedOn: string; dueOn: string }
> = {
  vaccination: {
    occurredOn: "date given",
    endedOn: "end date",
    dueOn: "due date",
  },
  medication: {
    occurredOn: "start date",
    endedOn: "end date",
    dueOn: "refill due date",
  },
  visit: {
    occurredOn: "visit date",
    endedOn: "end date",
    dueOn: "follow-up due date",
  },
  condition: {
    occurredOn: "onset date",
    endedOn: "resolved date",
    dueOn: "due date",
  },
};

const DETAIL_LABELS: Record<string, string> = {
  clinic: "clinic",
  lotNumber: "lot number",
  dosage: "dosage",
  frequency: "frequency",
  prescribedBy: "prescriber",
  veterinarian: "veterinarian",
  weight: "weight",
  kind: "kind",
  severity: "severity",
  reaction: "reaction",
};

function detailValue(value: unknown): string {
  if (
    value &&
    typeof value === "object" &&
    "value" in value &&
    "unit" in value
  ) {
    return `${String(value.value)} ${String(value.unit)}`;
  }
  return String(value);
}

/** One phrase per changed record field: "due date to Oct 20, 2027", "clear the clinic". */
function recordChangePhrases(
  typeId: MedicalRecordTypeId,
  changes: z.output<typeof RecordPatchSchema>,
): string[] {
  const dates = RECORD_DATE_LABELS[typeId];
  const phrases: string[] = [];
  const change = (
    label: string,
    value: unknown,
    text: (v: string) => string,
  ) => {
    if (value === undefined) return;
    phrases.push(
      value === null
        ? `clear the ${label}`
        : `${label} to ${text(String(value))}`,
    );
  };
  change("title", changes.title, (v) => `"${v}"`);
  if (changes.notes !== undefined) {
    phrases.push(
      changes.notes === null ? "clear the notes" : "update the notes",
    );
  }
  for (const key of ["occurredOn", "endedOn", "dueOn"] as const) {
    change(dates[key], changes[key], day);
  }
  for (const [key, value] of Object.entries(defined(changes.details ?? {}))) {
    const label = DETAIL_LABELS[key] ?? key;
    phrases.push(
      value === null
        ? `clear the ${label}`
        : `${label} to ${detailValue(value)}`,
    );
  }
  return phrases;
}

const id = z.number().int().positive();
const DATES = "Dates are YYYY-MM-DD.";
const PATCH =
  "Only the fields in `changes` are updated; omit a field to keep it, set it to null to clear it.";
const RECORD_DETAILS = `\`record.typeId\` decides the shape:
- vaccination: occurredOn required (date given), dueOn optional (booster due), no endedOn; details { clinic, lotNumber }.
- medication: occurredOn required (start), endedOn optional, dueOn optional (refill due); details { dosage, frequency, prescribedBy }.
- visit: occurredOn required, dueOn optional (follow-up due), no endedOn; details { clinic, veterinarian, weight: { value, unit: "kg" | "lb" } }.
- condition: occurredOn/endedOn optional (onset/resolved), no dueOn; details { kind: "allergy" | "condition" (required), severity: "mild" | "moderate" | "severe", reaction }.
Optional details may be null.`;

// Unlike PetInputSchema.partial(), sex has no default, so an omitted sex is kept.
const PetPatchSchema = PetInputSchema.extend({ sex: z.enum(PET_SEXES) })
  .partial()
  .describe("Fields to change");

const RecordPatchSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    notes: nullableText(2000),
    occurredOn: nullableDate,
    endedOn: nullableDate,
    dueOn: nullableDate,
    details: z
      .record(z.string(), z.unknown())
      .describe("Detail fields to change; other details are kept"),
  })
  .partial()
  .describe("Fields to change");

export const readTools = {
  findPets: readTool({
    description:
      "List the household's pets with care status (overdue, due-soon, up-to-date) and next due item. Filter by name/breed text, species id, or status; omit filters to list all pets.",
    inputSchema: z.object({
      query: z.string().optional().describe("Matches name or breed"),
      speciesId: z.string().optional(),
      status: z.enum(["overdue", "due-soon", "up-to-date"]).optional(),
    }),
    execute: (ctx, input) =>
      listPetCareSummaries(ctx.householdId, ctx.today, input),
  }),
  getPet: readTool({
    description:
      "Get one pet's profile and care overview: status, due items, active medications, conditions/allergies, latest vaccinations, and last visit.",
    inputSchema: z.object({ petId: id }),
    execute: async (ctx, { petId }) => {
      const pet = (await getPet(ctx.householdId, petId)) ?? missingPet(petId);
      return { pet, care: await getPetCare(ctx.householdId, pet, ctx.today) };
    },
  }),
  listMedicalRecords: readTool({
    description:
      "List a pet's medical records, newest first. Optionally filter by record type or text in the title/notes.",
    inputSchema: z.object({
      petId: id,
      typeId: z.enum(MEDICAL_RECORD_TYPE_IDS).optional(),
      query: z.string().optional(),
    }),
    execute: async (ctx, { petId, typeId, query }) => {
      if (!(await getPet(ctx.householdId, petId))) missingPet(petId);
      return filterMedicalRecords(
        await listMedicalRecords(ctx.householdId, petId),
        { typeId, query },
      );
    },
  }),
  getMedicalRecord: readTool({
    description: "Get one medical record by id.",
    inputSchema: z.object({ recordId: id }),
    execute: async (ctx, { recordId }) =>
      (await getMedicalRecord(ctx.householdId, recordId)) ??
      missingRecord(recordId),
  }),
  listDueItems: readTool({
    description:
      "Overdue and due-soon care items (vaccination boosters, medication refills, visit follow-ups) across all pets, most urgent first.",
    inputSchema: z.object({}),
    execute: (ctx) => listDueItems(ctx.householdId, ctx.today),
  }),
  listActiveMedications: readTool({
    description: "Medications currently being given, across all pets.",
    inputSchema: z.object({}),
    execute: (ctx) => listActiveMedications(ctx.householdId, ctx.today),
  }),
  listSpecies: readTool({
    description: "List the species a pet can be, with their ids.",
    inputSchema: z.object({}),
    execute: () => listSpecies(),
  }),
  listMedicalRecordTypes: readTool({
    description: "List the medical record types, with their ids.",
    inputSchema: z.object({}),
    execute: () => listMedicalRecordTypes(),
  }),
};

export const writeTools = {
  createPet: writeTool({
    description: `Add a pet. Call listSpecies for valid speciesId values. ${DATES}`,
    inputSchema: PetInputSchema,
    destructive: false,
    execute: async (ctx, input) => {
      await assertSpecies(input.speciesId);
      return createPet(ctx.householdId, input);
    },
    confirmMessage: async (_ctx, input) => {
      const species = await speciesName(input.speciesId);
      const article = /^[aeiou]/.test(species) ? "an" : "a";
      const facts = [
        sexWords(input.sex, input.neutered),
        input.breed,
        input.dateOfBirth && `born ${day(input.dateOfBirth)}`,
      ].filter(Boolean);
      return `Add ${input.name}, ${article} ${species}${facts.length ? ` (${facts.join(", ")})` : ""}?`;
    },
  }),
  updatePet: writeTool({
    description: `Change a pet's profile. ${PATCH} Call listSpecies for valid speciesId values. ${DATES}`,
    inputSchema: z.object({ petId: id, changes: PetPatchSchema }),
    destructive: true,
    execute: async (ctx, { petId, changes }) => {
      const pet = (await getPet(ctx.householdId, petId)) ?? missingPet(petId);
      if (changes.speciesId) await assertSpecies(changes.speciesId);
      return (
        (await updatePet(ctx.householdId, petId, {
          ...toPetInput(pet),
          ...defined(changes),
        })) ?? missingPet(petId)
      );
    },
    confirmMessage: async (ctx, { petId, changes }) => {
      const pet = await getPet(ctx.householdId, petId);
      const name = pet?.name ?? `pet ${petId}`;
      const sets: string[] = [];
      const clears: string[] = [];
      const field = (
        label: string,
        value: unknown,
        text: (v: string) => string = String,
      ) => {
        if (value === undefined) return;
        if (value === null) clears.push(`clear ${name}'s ${label}`);
        else sets.push(`${label} to ${text(String(value))}`);
      };
      field("name", changes.name);
      if (changes.speciesId) {
        sets.push(`species to ${await speciesName(changes.speciesId)}`);
      }
      field("breed", changes.breed);
      field("sex", changes.sex);
      if (changes.neutered !== undefined) {
        const sex = changes.sex ?? pet?.sex;
        if (changes.neutered === null)
          clears.push(`clear ${name}'s spay/neuter status`);
        else if (!changes.neutered) sets.push("spay/neuter status to intact");
        else
          sets.push(
            `spay/neuter status to ${sex === "female" ? "spayed" : "neutered"}`,
          );
      }
      field("date of birth", changes.dateOfBirth, day);
      field("microchip number", changes.microchipId);
      const clauses = [
        ...(sets.length ? [`change ${name}'s ${joinWords(sets)}`] : []),
        ...clears,
        ...(changes.notes === undefined
          ? []
          : [
              changes.notes === null
                ? `clear ${name}'s notes`
                : `update ${name}'s notes`,
            ]),
      ];
      if (!clauses.length) return `Update ${name}'s profile?`;
      const sentence = joinWords(clauses);
      return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}?`;
    },
  }),
  deletePet: writeTool({
    description:
      "Delete a pet and all of its medical records. This can't be undone.",
    inputSchema: z.object({ petId: id }),
    destructive: true,
    execute: async (ctx, { petId }) => {
      if (!(await deletePet(ctx.householdId, petId))) missingPet(petId);
      return { deleted: true };
    },
    confirmMessage: async (ctx, { petId }) => {
      const name = await petName(ctx, petId);
      const count = (await listMedicalRecords(ctx.householdId, petId)).length;
      const records =
        count === 0
          ? ""
          : count === 1
            ? " and their 1 medical record"
            : ` and all ${count} of their medical records`;
      return `Delete ${name}${records}? This can't be undone.`;
    },
  }),
  createMedicalRecord: writeTool({
    description: `Add a medical record to a pet. ${RECORD_DETAILS} ${DATES}`,
    inputSchema: z.object({ petId: id, record: MedicalRecordInputSchema }),
    destructive: false,
    execute: async (ctx, { petId, record }) =>
      (await createMedicalRecord(ctx.householdId, petId, record)) ??
      missingPet(petId),
    confirmMessage: async (ctx, { petId, record }) => {
      const name = await petName(ctx, petId);
      const label = recordLabel(record);
      const head = `Add ${label} "${record.title}"`;
      switch (record.typeId) {
        case "vaccination": {
          const facts = [
            record.occurredOn && `given ${day(record.occurredOn)}`,
            record.dueOn && `next due ${day(record.dueOn)}`,
          ].filter(Boolean);
          return `${head} for ${name}${facts.map((f) => `, ${f}`).join("")}?`;
        }
        case "medication": {
          const dose = [record.details.dosage, record.details.frequency].filter(
            Boolean,
          );
          const facts = [
            record.occurredOn && `started ${day(record.occurredOn)}`,
            record.endedOn && `until ${day(record.endedOn)}`,
            record.dueOn && `refill due ${day(record.dueOn)}`,
          ].filter(Boolean);
          return `${head}${dose.length ? ` (${dose.join(", ")})` : ""} for ${name}${facts.map((f) => `, ${f}`).join("")}?`;
        }
        case "visit": {
          const facts = [
            record.occurredOn && `on ${day(record.occurredOn)}`,
            record.dueOn && `follow-up due ${day(record.dueOn)}`,
          ].filter(Boolean);
          return `${head} for ${name}${facts.map((f, i) => `${i ? ", " : " "}${f}`).join("")}?`;
        }
        case "condition": {
          const severity = record.details.severity;
          return `${head}${severity ? ` (${severity})` : ""} for ${name}${record.occurredOn ? `, since ${day(record.occurredOn)}` : ""}?`;
        }
      }
    },
  }),
  updateMedicalRecord: writeTool({
    description: `Change a medical record. ${PATCH} The record type can't change; delete it and create a new one instead. Detail fields depend on the type:\n${RECORD_DETAILS} ${DATES}`,
    inputSchema: z.object({ recordId: id, changes: RecordPatchSchema }),
    destructive: true,
    execute: async (ctx, { recordId, changes }) => {
      const record =
        (await getMedicalRecord(ctx.householdId, recordId)) ??
        missingRecord(recordId);
      // updateMedicalRecord's schema parse strips id, petId and timestamps.
      const merged = {
        ...record,
        ...defined(changes),
        details: { ...record.details, ...changes.details },
      };
      return (
        (await updateMedicalRecord(
          ctx.householdId,
          recordId,
          merged as MedicalRecordInput,
        )) ?? missingRecord(recordId)
      );
    },
    confirmMessage: async (ctx, { recordId, changes }) => {
      const record = await getMedicalRecord(ctx.householdId, recordId);
      if (!record) {
        return `Change medical record ${recordId}: ${joinWords(recordChangePhrases("visit", changes)) || "its details"}?`;
      }
      const name = await petName(ctx, record.petId);
      const phrases = recordChangePhrases(record.typeId, changes);
      return `Change ${name}'s ${recordLabel(record)} "${record.title}": ${joinWords(phrases) || "its details"}?`;
    },
  }),
  deleteMedicalRecord: writeTool({
    description: "Delete a medical record. This can't be undone.",
    inputSchema: z.object({ recordId: id }),
    destructive: true,
    execute: async (ctx, { recordId }) => {
      if (!(await deleteMedicalRecord(ctx.householdId, recordId))) {
        missingRecord(recordId);
      }
      return { deleted: true };
    },
    confirmMessage: async (ctx, { recordId }) => {
      const record = await getMedicalRecord(ctx.householdId, recordId);
      if (!record)
        return `Delete medical record ${recordId}? This can't be undone.`;
      const name = await petName(ctx, record.petId);
      const from = record.occurredOn ? ` from ${day(record.occurredOn)}` : "";
      return `Delete ${name}'s ${recordLabel(record)} "${record.title}"${from}? This can't be undone.`;
    },
  }),
} satisfies Record<MutationToolName, unknown>;

export const allTools: Record<
  keyof typeof readTools | MutationToolName,
  AnyToolDef
> = { ...readTools, ...writeTools };
