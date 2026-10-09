import { z } from "zod";
import type { MedicalRecordTypeId } from "@/db/models/medical-record-type";
import { routes } from "@/lib/routes";

/** Chat tools that change data; the client refreshes the page after one succeeds. */
export const MUTATION_TOOLS = [
  "createPet",
  "updatePet",
  "deletePet",
  "createMedicalRecord",
  "updateMedicalRecord",
  "deleteMedicalRecord",
] as const;
export type MutationToolName = (typeof MUTATION_TOOLS)[number];

export type ConfirmField = { label: string; value: string };
/** The server-streamed description of a pending change, shown before the owner confirms. */
export type ConfirmationData = { text: string; fields: ConfirmField[] };

/** A record the agent cited for an answer; output of the chat-only `citeRecords` tool. */
export type CitedRecord = {
  id: number;
  petId: number;
  petName: string;
  typeId: MedicalRecordTypeId;
  title: string;
  occurredOn: string | null;
};

// MEDICAL_RECORD_TYPE_IDS lives in a server-only module; the `satisfies` keeps this copy in sync.
const RECORD_TYPE_IDS = Object.keys({
  vaccination: 0,
  medication: 0,
  visit: 0,
  condition: 0,
} satisfies Record<MedicalRecordTypeId, 0>) as [
  MedicalRecordTypeId,
  ...MedicalRecordTypeId[],
];
const id = z.number().int().positive();
const recordType = z.enum(RECORD_TYPE_IDS);

export const NavigateTargetSchema = z.discriminatedUnion("page", [
  z.object({ page: z.literal("home") }).describe("Dashboard"),
  z.object({ page: z.literal("newPet") }).describe("Add-pet form"),
  z.object({ page: z.literal("pet"), petId: id }).describe("Pet care status"),
  z
    .object({
      page: z.literal("petRecords"),
      petId: id,
      typeId: recordType.optional(),
      query: z.string().optional(),
    })
    .describe("Pet's medical records, optionally filtered"),
  z
    .object({ page: z.literal("petProfile"), petId: id })
    .describe("Pet profile"),
  z.object({ page: z.literal("editPet"), petId: id }).describe("Edit-pet form"),
  z
    .object({
      page: z.literal("newRecord"),
      petId: id,
      typeId: recordType.optional(),
      title: z.string().optional(),
    })
    .describe("New medical record form; title pre-fills it"),
  z
    .object({ page: z.literal("editRecord"), petId: id, recordId: id })
    .describe("Edit-record form"),
  z
    .object({
      page: z.literal("summary"),
      petId: id,
      history: z.boolean().optional(),
    })
    .describe(
      "Printable vet summary for a new vet, boarding desk or sitter; history adds every record",
    ),
]);
export type NavigateTarget = z.infer<typeof NavigateTargetSchema>;
export const NavigateInputSchema = z.object({ target: NavigateTargetSchema });

export function hrefFor(target: NavigateTarget): string {
  switch (target.page) {
    case "home":
      return routes.home;
    case "newPet":
      return routes.newPet;
    case "pet":
      return routes.pet(target.petId);
    case "petRecords":
      return routes.petRecords(target.petId, {
        type: target.typeId,
        q: target.query,
      });
    case "petProfile":
      return routes.petProfile(target.petId);
    case "editPet":
      return routes.editPet(target.petId);
    case "newRecord":
      return target.typeId && target.title
        ? routes.logNext(target.petId, target.typeId, target.title)
        : routes.newRecord(target.petId, target.typeId);
    case "editRecord":
      return routes.editRecord(target.petId, target.recordId);
    case "summary":
      return routes.petSummary(target.petId, { history: target.history });
  }
}
