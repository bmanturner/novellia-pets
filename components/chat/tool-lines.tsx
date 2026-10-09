"use client";

import {
  Check,
  CircleAlert,
  CornerDownRight,
  LoaderCircle,
} from "lucide-react";
import Link from "next/link";
import type { PetsUIMessage } from "@/lib/chat/agent";
import { findConfirmText } from "@/lib/chat/confirmations";
import { MUTATION_TOOLS, type CitedRecord } from "@/lib/chat/contract";
import { usePetsChat } from "@/lib/chat/chat-provider";
import { formatDate } from "@/lib/format";
import { routes } from "@/lib/routes";
import { asRecord } from "./pet-names";

type MutationName = (typeof MUTATION_TOOLS)[number];

/** A tool part with every field read defensively; `unknown` stays `unknown`. */
export type ToolPart = {
  name: string;
  toolCallId: string;
  state: string;
  input: unknown;
  output: unknown;
  errorText: string | undefined;
  approvalId: string | undefined;
  approved: boolean | undefined;
};

export function readToolPart(
  part: PetsUIMessage["parts"][number],
): ToolPart | null {
  if (!part.type.startsWith("tool-") || !("toolCallId" in part)) return null;
  const approval = "approval" in part ? asRecord(part.approval) : null;
  return {
    name: part.type.slice(5),
    toolCallId: String(part.toolCallId),
    state: "state" in part ? String(part.state) : "",
    input: "input" in part ? part.input : undefined,
    output: "output" in part ? part.output : undefined,
    errorText:
      "errorText" in part && typeof part.errorText === "string"
        ? part.errorText
        : undefined,
    approvalId: typeof approval?.id === "string" ? approval.id : undefined,
    approved:
      typeof approval?.approved === "boolean" ? approval.approved : undefined,
  };
}

export function isMutationTool(name: string): name is MutationName {
  return (MUTATION_TOOLS as readonly string[]).includes(name);
}

export function isRunning(part: ToolPart): boolean {
  return part.state === "input-streaming" || part.state === "input-available";
}

function num(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

type PetName = (petId: number | undefined) => string | undefined;

const LINK_CLASS =
  "text-cover underline underline-offset-2 transition-colors duration-150 hover:text-cover-deep";

/* Activity ---------------------------------------------------------------- */

export function activityPhrase(part: ToolPart | undefined, petName: PetName) {
  if (!part) return "Working on it…";
  const name = petName(num(asRecord(part.input)?.petId)) ?? "the pet";
  switch (part.name) {
    case "findPets":
      return "Looking up pets…";
    case "getPet":
      return `Reading ${name}'s care overview…`;
    case "listMedicalRecords":
      return `Reading ${name}'s records…`;
    case "getMedicalRecord":
      return "Reading a record…";
    case "listDueItems":
      return "Checking what's due…";
    case "listActiveMedications":
      return "Checking medications…";
    case "listSpecies":
    case "listMedicalRecordTypes":
      return "Checking the app's options…";
    case "citeRecords":
      return "Gathering the records used…";
    case "navigate":
      return "Opening the page…";
    default:
      return "Working on it…";
  }
}

function Spinner() {
  return (
    <LoaderCircle
      aria-hidden
      size={14}
      className="shrink-0 animate-spin motion-reduce:animate-none"
    />
  );
}

export function ActivityLine({ phrase }: { phrase: string }) {
  return (
    <p
      role="status"
      className="flex items-center gap-2 text-[13px] text-ink-muted"
    >
      <Spinner />
      {phrase}
    </p>
  );
}

/* Navigated --------------------------------------------------------------- */

function navigatedLabel(input: unknown, petName: PetName): string | null {
  const target = asRecord(asRecord(input)?.target);
  const page = target?.page;
  const name = petName(num(target?.petId)) ?? "the pet";
  const possessive = name === "the pet" ? "the pet's" : `${name}'s`;
  switch (page) {
    case "home":
      return "the dashboard";
    case "newPet":
      return "the add-pet form";
    case "pet":
      return `${possessive} status page`;
    case "petRecords":
      return `${possessive} records${target?.typeId || target?.query ? " (filtered)" : ""}`;
    case "petProfile":
      return `${possessive} profile`;
    case "editPet":
      return `the edit form for ${name}`;
    case "newRecord":
      return `a new record for ${name}`;
    case "editRecord":
      return "the record editor";
    case "summary":
      return `${possessive} vet summary`;
    default:
      return null;
  }
}

export function NavigatedLine({
  part,
  petName,
}: {
  part: ToolPart;
  petName: PetName;
}) {
  const href = str(asRecord(part.output)?.href);
  if (!href) return null;
  const label = navigatedLabel(part.input, petName) ?? "the page";
  return (
    <p className="flex items-start gap-2 text-[13px] text-ink-muted">
      <CornerDownRight aria-hidden size={14} className="mt-[3px] shrink-0" />
      <span>
        Opened{" "}
        <Link href={href} className={LINK_CLASS}>
          {label}
        </Link>
      </span>
    </p>
  );
}

/* Mutations --------------------------------------------------------------- */

const FALLBACK_CONFIRM: Record<MutationName, string> = {
  createPet: "Add this pet?",
  updatePet: "Save these changes to the pet?",
  deletePet: "Delete this pet and all of its records?",
  createMedicalRecord: "Add this medical record?",
  updateMedicalRecord: "Save these changes to the record?",
  deleteMedicalRecord: "Delete this medical record?",
};

type Verb = "add" | "save" | "delete";
const VERB: Record<MutationName, Verb> = {
  createPet: "add",
  updatePet: "save",
  deletePet: "delete",
  createMedicalRecord: "add",
  updateMedicalRecord: "save",
  deleteMedicalRecord: "delete",
};
const PROGRESS: Record<Verb, string> = {
  add: "Adding…",
  save: "Saving…",
  delete: "Deleting…",
};

const BUTTON =
  "inline-flex h-8 items-center justify-center rounded-md px-3 text-[13px] font-semibold transition-colors duration-150";
const PRIMARY = `${BUTTON} bg-cover text-cover-ink hover:bg-cover-deep`;
const DANGER = `${BUTTON} bg-danger text-page hover:opacity-90`;
const SECONDARY = `${BUTTON} border border-cover/25 bg-page text-cover hover:border-cover/50 hover:bg-page-tint`;

function confirmLabel(
  tool: MutationName,
  petId: number | undefined,
  petName: PetName,
): string {
  switch (VERB[tool]) {
    case "add":
      return "Add";
    case "save":
      return "Save changes";
    case "delete":
      if (tool === "deletePet") {
        const name = petName(petId);
        return name ? `Delete ${name}` : "Delete pet";
      }
      return "Delete record";
  }
}

function ViewLink({ href }: { href: string }) {
  return (
    <Link href={href} className={`text-[13px] ${LINK_CLASS}`}>
      View
    </Link>
  );
}

function doneLine(
  tool: MutationName,
  part: ToolPart,
  petName: PetName,
): { text: string; href?: string } {
  const input = asRecord(part.input);
  const output = asRecord(part.output);
  const inputPetId = num(input?.petId);
  switch (tool) {
    case "createPet": {
      const id = num(output?.id);
      const name = str(output?.name) ?? str(input?.name);
      return {
        text: name ? `Added ${name}.` : "Added the pet.",
        href: id === undefined ? undefined : routes.pet(id),
      };
    }
    case "updatePet": {
      const id = num(output?.id) ?? inputPetId;
      const name = str(output?.name) ?? petName(id);
      return {
        text: name ? `Updated ${name}.` : "Updated the pet.",
        href: id === undefined ? undefined : routes.pet(id),
      };
    }
    case "deletePet": {
      const name = petName(inputPetId);
      return { text: `Deleted ${name ?? "the pet"}.` };
    }
    case "createMedicalRecord": {
      const recordId = num(output?.id);
      const petId = num(output?.petId) ?? inputPetId;
      const title = str(output?.title) ?? str(asRecord(input?.record)?.title);
      const name = petName(petId);
      const subject = title ?? "the record";
      return {
        text: name ? `Added ${subject} for ${name}.` : `Added ${subject}.`,
        href:
          recordId === undefined || petId === undefined
            ? undefined
            : routes.petRecord(petId, recordId),
      };
    }
    case "updateMedicalRecord": {
      const recordId = num(output?.id) ?? num(input?.recordId);
      const petId = num(output?.petId);
      const title = str(output?.title);
      return {
        text: title ? `Updated ${title}.` : "Updated the record.",
        href:
          recordId === undefined || petId === undefined
            ? undefined
            : routes.petRecord(petId, recordId),
      };
    }
    case "deleteMedicalRecord":
      return { text: "Deleted the record." };
  }
}

export function MutationLine({
  part,
  tool,
  message,
  petName,
}: {
  part: ToolPart;
  tool: MutationName;
  message: PetsUIMessage;
  petName: PetName;
}) {
  const { addToolApprovalResponse } = usePetsChat();
  const verb = VERB[tool];
  const sentence = (
    <p className="text-[15px] leading-6 text-ink">
      {findConfirmText(message, part.toolCallId) ?? FALLBACK_CONFIRM[tool]}
    </p>
  );

  if (part.state === "approval-requested" && part.approvalId) {
    const id = part.approvalId;
    const destructive = verb === "delete";
    const petId = num(asRecord(part.input)?.petId);
    return (
      <div className="rounded-lg border border-rule bg-page-tint p-3">
        {sentence}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className={destructive ? DANGER : PRIMARY}
            onClick={() => void addToolApprovalResponse({ id, approved: true })}
          >
            {confirmLabel(tool, petId, petName)}
          </button>
          <button
            type="button"
            className={SECONDARY}
            onClick={() =>
              void addToolApprovalResponse({ id, approved: false })
            }
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (part.state === "output-denied" || part.approved === false) {
    return (
      <p className="text-sm text-ink-muted">Cancelled. Nothing changed.</p>
    );
  }

  if (part.state === "output-available") {
    const { text, href } = doneLine(tool, part, petName);
    return (
      <p className="flex items-start gap-2 text-sm text-ink">
        <Check aria-hidden size={16} className="mt-[3px] shrink-0 text-cover" />
        <span>
          {text}
          {href && (
            <>
              {" "}
              <ViewLink href={href} />
            </>
          )}
        </span>
      </p>
    );
  }

  if (part.state === "output-error") {
    return (
      <p className="flex items-start gap-2 text-[13px] text-danger">
        <CircleAlert
          aria-hidden
          size={14}
          className="mt-[3px] shrink-0 text-danger"
        />
        <span>
          Couldn&apos;t {verb} that. {part.errorText}
        </span>
      </p>
    );
  }

  if (part.state === "approval-responded") {
    return (
      <div className="space-y-2">
        {sentence}
        <p className="flex items-center gap-2 text-[13px] text-ink-muted">
          <Spinner />
          {PROGRESS[verb]}
        </p>
      </div>
    );
  }

  return null;
}

/* Citations --------------------------------------------------------------- */

const TYPE_LABEL: Record<CitedRecord["typeId"], string> = {
  vaccination: "Vaccination",
  medication: "Medication",
  visit: "Vet visit",
  condition: "Allergy or condition",
};

function localToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function readCited(value: unknown): CitedRecord | null {
  const r = asRecord(value);
  if (
    !r ||
    num(r.id) === undefined ||
    num(r.petId) === undefined ||
    typeof r.title !== "string"
  ) {
    return null;
  }
  return {
    id: r.id as number,
    petId: r.petId as number,
    petName: typeof r.petName === "string" ? r.petName : "",
    typeId:
      typeof r.typeId === "string" && r.typeId in TYPE_LABEL
        ? (r.typeId as CitedRecord["typeId"])
        : "visit",
    title: r.title,
    occurredOn: typeof r.occurredOn === "string" ? r.occurredOn : null,
  };
}

export function collectCitations(message: PetsUIMessage): CitedRecord[] {
  const seen = new Set<number>();
  const records: CitedRecord[] = [];
  for (const part of message.parts) {
    const tool = readToolPart(part);
    if (tool?.name !== "citeRecords" || tool.state !== "output-available") {
      continue;
    }
    const list = asRecord(tool.output)?.records;
    if (!Array.isArray(list)) continue;
    for (const entry of list) {
      const record = readCited(entry);
      if (!record || seen.has(record.id)) continue;
      seen.add(record.id);
      records.push(record);
    }
  }
  return records;
}

export function Citations({ records }: { records: CitedRecord[] }) {
  if (records.length === 0) return null;
  const today = localToday();
  return (
    <section className="mt-3 border-t border-rule pt-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        From records
      </h3>
      <ul className="mt-2 space-y-2">
        {records.map((record) => {
          const detail = [
            record.petName,
            TYPE_LABEL[record.typeId],
            record.occurredOn ? formatDate(record.occurredOn, today) : null,
          ].filter(Boolean);
          return (
            <li key={record.id}>
              <Link
                href={routes.petRecord(record.petId, record.id)}
                className="group block"
              >
                <span className="block text-sm font-semibold text-cover underline decoration-cover/40 underline-offset-2 group-hover:decoration-cover">
                  {record.title}
                </span>
                <span className="block text-[13px] text-ink-muted">
                  {detail.join(" · ")}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
