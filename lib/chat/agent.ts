import "server-only";
import { anthropic } from "@ai-sdk/anthropic";
import {
  createAgentUIStream,
  createUIMessageStreamResponse,
  type InferUITools,
  type LanguageModel,
  type Tool,
  ToolLoopAgent,
  tool,
  type UIMessage,
  type UIMessageChunk,
} from "ai";
import { z } from "zod";
import {
  getMedicalRecord,
  listMedicalRecords,
} from "@/db/models/medical-record";
import { getPet, listPets } from "@/db/models/pet";
import {
  type CitedRecord,
  type ConfirmationData,
  MUTATION_TOOLS,
  type MutationToolName,
  NavigateInputSchema,
  type NavigateTarget,
} from "@/lib/chat/contract";
import {
  allTools,
  type AnyWriteToolDef,
  type ToolContext,
  writeTools,
} from "@/lib/tools/registry";
import { withHumanDates } from "@/lib/chat/human-dates";

// Fast and cheap enough for short, tool-heavy turns; override with ANTHROPIC_MODEL.
const DEFAULT_MODEL = "claude-haiku-5-5";

type CiteRecordsInputOutput = Tool<
  { recordIds: number[] },
  { records: CitedRecord[] }
>;
/** What `tool()` returns when given an `execute`: the same tool with `execute` required. */
type CiteRecordsTool = CiteRecordsInputOutput & {
  execute: NonNullable<CiteRecordsInputOutput["execute"]>;
};

export type PetsTools = Record<keyof typeof allTools, Tool> & {
  /** Runs in the browser; the output is the href it opened. */
  navigate: Tool<{ target: NavigateTarget }, { href: string }>;
  /** Chat-only: resolves the records an answer relies on so the app can list them. */
  citeRecords: CiteRecordsTool;
};
export type PetsAgent = ToolLoopAgent<never, PetsTools>;
/**
 * `data-confirm` parts describe a pending approval, keyed by tool call id.
 * Transient `data-changed` parts announce a write the moment it succeeds.
 */
export type PetsDataTypes = {
  confirm: ConfirmationData;
  changed: { tool: MutationToolName; petId: number | null };
};
export type PetsUIMessage = UIMessage<
  unknown,
  PetsDataTypes,
  InferUITools<PetsTools>
>;

// The `anthropic` provider reads ANTHROPIC_API_KEY when a request is made.
export const chatEnabled = (): boolean =>
  Boolean(process.env.ANTHROPIC_API_KEY);

export type ViewingPet = { id: number; name: string };

/** Records the owner can see, in input order, without duplicates or other households' ids. */
async function citeRecords(
  ctx: ToolContext,
  recordIds: number[],
): Promise<{ records: CitedRecord[] }> {
  const records: CitedRecord[] = [];
  const petNames = new Map<number, string>();
  for (const recordId of new Set(recordIds)) {
    const record = await getMedicalRecord(ctx.householdId, recordId);
    if (!record) continue;
    if (!petNames.has(record.petId)) {
      const pet = await getPet(ctx.householdId, record.petId);
      petNames.set(record.petId, pet?.name ?? `Pet ${record.petId}`);
    }
    records.push({
      id: record.id,
      petId: record.petId,
      petName: petNames.get(record.petId)!,
      typeId: record.typeId,
      title: record.title,
      occurredOn: record.occurredOn,
    });
  }
  return { records };
}

/**
 * The household's pets with sex and existing record titles per type, appended
 * to the instructions so pronouns and recurring-item titles are right without
 * the model having to look them up first.
 */
async function householdRoster(ctx: ToolContext): Promise<string> {
  const pets = await listPets(ctx.householdId);
  if (pets.length === 0) return "";
  const lines = await Promise.all(
    pets.map(async (pet) => {
      const titles = new Map<string, Set<string>>();
      for (const record of await listMedicalRecords(ctx.householdId, pet.id)) {
        const set = titles.get(record.typeId) ?? new Set<string>();
        titles.set(record.typeId, set.add(record.title));
      }
      const existing = [...titles]
        .map(
          ([type, set]) =>
            `${type}: ${[...set].map((t) => JSON.stringify(t)).join(", ")}`,
        )
        .join("; ");
      return `- ${pet.name} (petId ${pet.id}): ${pet.species.name}, sex ${pet.sex}${pet.neutered ? ", neutered/spayed" : ""}${existing ? `. Existing record titles: ${existing}` : ""}`;
    }),
  );
  return `\n\nHousehold pets:\n${lines.join("\n")}`;
}

export function createPetsAgent(
  ctx: ToolContext,
  {
    viewingPet,
    model = anthropic(process.env.ANTHROPIC_MODEL || DEFAULT_MODEL),
  }: { viewingPet?: ViewingPet; model?: LanguageModel } = {},
): PetsAgent {
  const appTools = Object.fromEntries(
    Object.entries(allTools).map(([name, def]) => [
      name,
      tool({
        description: def.description,
        inputSchema: def.inputSchema,
        execute: async (input) =>
          withHumanDates(await def.execute(ctx, input), ctx.today),
      }),
    ]),
  ) as Record<keyof typeof allTools, Tool>;

  const viewing = viewingPet
    ? `\nThe user is looking at ${viewingPet.name}'s page (petId ${viewingPet.id}). "This pet", and he/she/it/they with no other referent, mean ${viewingPet.name}.`
    : "";

  const instructions = `You are the Novellia Pets assistant for one household's pets. Today is ${ctx.today}. Tool inputs take dates as YYYY-MM-DD.
Tool results give every date as YYYY-MM-DD with a ready-made <name>Text sibling (e.g. dueOnText "Sep 29, 2026") and, for due dates, a <name>Relative sibling (e.g. "10 days late", "due today", "due in 12 days"). Write dates and lateness exactly as those fields read, never as YYYY-MM-DD. Say "N days late" or "due in N days", never "overdue by".
Care status: overdue = due date before today; due soon = due within 30 days; otherwise up to date.${viewing}
- Answer questions about the user's pets only from tool results. Never invent records.
- Before writing an answer that uses records, call citeRecords with the ids of exactly the records the answer relies on. The app shows them under your answer, so do not list or link them again at the end.
- General pet-care questions: give general information, say you are not a vet, and tell the user to contact a vet right away for urgent symptoms.
- Find pets by name with findPets. Prefer an exact case-insensitive name match. If none or several pets match, ask which one. Never guess ids.
- When the user asks to see, show, open or go to something, call navigate with the matching page. The app already tells the user the page opened, so do not restate or confirm it; reply only if they also asked something else, and then answer just that.
- To change data, call the matching create/update/delete tool directly. The app asks the user to confirm, so do not ask for confirmation in text first. If the user declines, say nothing further and do not retry.
- Refer to a pet by name, or by pronouns matching its recorded sex: she/her for female, he/him for male, they/them (or just the name) when unknown. Check the household list below or the tool result's sex before using a pronoun; never guess from the name.
- When logging a record that continues an item the pet already has (a repeat vaccination, a refilled medication), reuse that item's exact existing title from the household list below, so the new record replaces the old due date. Use a new title only for a genuinely new item.
- Keep answers short.`;

  return new ToolLoopAgent({
    model,
    instructions,
    // The roster depends on the household's current data, so it is read per call.
    prepareCall: async (options) => ({
      ...options,
      instructions: `${instructions}${await householdRoster(ctx)}`,
    }),
    tools: {
      ...appTools,
      citeRecords: tool({
        description:
          "Show the user which medical records an answer is based on. Call it once before answering, with the ids of exactly the records you used. Unknown ids are dropped. The app displays the records under your answer.",
        inputSchema: z.object({
          recordIds: z.array(z.number().int().positive()).min(1).max(20),
        }),
        execute: ({ recordIds }) => citeRecords(ctx, recordIds),
      }),
      // No execute: the browser runs it (see chat-provider.tsx).
      navigate: tool({
        description:
          "Open a page of the app in the user's browser. Use after resolving the pet/record id with other tools.",
        inputSchema: NavigateInputSchema,
        outputSchema: z.object({ href: z.string() }),
      }),
    },
    toolApproval: Object.fromEntries(
      MUTATION_TOOLS.map((name) => [name, "user-approval" as const]),
    ) as Record<MutationToolName, "user-approval">,
  });
}

function isWriteTool(name: string): name is MutationToolName {
  return Object.hasOwn(writeTools, name);
}

/** What the owner is asked before a write runs; undefined if the call can't be described. */
async function describePendingChange(
  ctx: ToolContext,
  toolName: string,
  input: unknown,
): Promise<ConfirmationData | undefined> {
  if (!isWriteTool(toolName)) return undefined;
  const def: AnyWriteToolDef = writeTools[toolName];
  const parsed = def.inputSchema.safeParse(input);
  if (!parsed.success) return undefined;
  const [text, fields] = await Promise.all([
    def.confirmMessage(ctx, parsed.data),
    def.confirmFields(ctx, parsed.data),
  ]);
  return { text, fields };
}

/** Tool calls already in the conversation, so an approved call's output can be named. */
function priorToolCalls(
  uiMessages: unknown[],
): Map<string, { toolName: string; input: unknown }> {
  const calls = new Map<string, { toolName: string; input: unknown }>();
  for (const message of uiMessages) {
    if (typeof message !== "object" || message === null) continue;
    if (!("parts" in message) || !Array.isArray(message.parts)) continue;
    for (const part of message.parts as unknown[]) {
      if (typeof part !== "object" || part === null) continue;
      if (!("type" in part) || !("toolCallId" in part)) continue;
      const { type, toolCallId } = part;
      if (typeof type !== "string" || !type.startsWith("tool-")) continue;
      if (typeof toolCallId !== "string") continue;
      calls.set(toolCallId, {
        toolName: type.slice("tool-".length),
        input: "input" in part ? part.input : undefined,
      });
    }
  }
  return calls;
}

function petIdOf(value: unknown): number | null {
  if (typeof value !== "object" || value === null || !("petId" in value)) {
    return null;
  }
  return typeof value.petId === "number" ? value.petId : null;
}

/**
 * Like createAgentUIStreamResponse, but every approval request is preceded by
 * a `data-confirm` part with the sentence to show, keyed by the tool call id,
 * and every successful write is followed by a transient `data-changed` part,
 * so the page can refresh without waiting for the rest of the reply.
 */
export async function createPetsChatResponse({
  ctx,
  agent,
  uiMessages,
  abortSignal,
}: {
  ctx: ToolContext;
  agent: PetsAgent;
  uiMessages: unknown[];
  abortSignal?: AbortSignal;
}): Promise<Response> {
  const stream = await createAgentUIStream({
    agent,
    uiMessages,
    abortSignal,
    onError: (error) => {
      console.error("[api/chat]", error);
      return "An error occurred.";
    },
  });

  const calls = priorToolCalls(uiMessages);
  return createUIMessageStreamResponse({
    stream: stream.pipeThrough(
      new TransformStream<UIMessageChunk, UIMessageChunk>({
        async transform(chunk, controller) {
          if (chunk.type === "tool-input-available") {
            calls.set(chunk.toolCallId, {
              toolName: chunk.toolName,
              input: chunk.input,
            });
          } else if (chunk.type === "tool-approval-request") {
            const call = calls.get(chunk.toolCallId);
            const confirmation =
              call &&
              (await describePendingChange(ctx, call.toolName, call.input));
            if (confirmation) {
              controller.enqueue({
                type: "data-confirm",
                id: chunk.toolCallId,
                data: confirmation,
              });
            }
          }
          controller.enqueue(chunk);
          if (chunk.type === "tool-output-available") {
            const call = calls.get(chunk.toolCallId);
            if (call && isWriteTool(call.toolName)) {
              controller.enqueue({
                type: "data-changed",
                data: {
                  tool: call.toolName,
                  petId: petIdOf(chunk.output) ?? petIdOf(call.input),
                },
                transient: true,
              });
            }
          }
        },
      }),
    ),
  });
}
