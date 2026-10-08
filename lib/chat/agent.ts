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
import { getMedicalRecord } from "@/db/models/medical-record";
import { getPet } from "@/db/models/pet";
import {
  type CitedRecord,
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
/** `data-confirm` parts carry the sentence for a pending approval, keyed by tool call id. */
export type PetsDataTypes = { confirm: { text: string } };
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
        execute: (input) => def.execute(ctx, input),
      }),
    ]),
  ) as Record<keyof typeof allTools, Tool>;

  const viewing = viewingPet
    ? `\nThe user is looking at ${viewingPet.name}'s page (petId ${viewingPet.id}). "This pet", and he/she/it/they with no other referent, mean ${viewingPet.name}.`
    : "";

  return new ToolLoopAgent({
    model,
    instructions: `You are the Novellia Pets assistant for one household's pets. Today is ${ctx.today}. Dates are YYYY-MM-DD.
Care status: overdue = due date before today; due soon = due within 30 days; otherwise up to date.${viewing}
- Answer questions about the user's pets only from tool results. Never invent records.
- Before writing an answer that uses records, call citeRecords with the ids of exactly the records the answer relies on. The app shows them under your answer, so do not list or link them again at the end.
- General pet-care questions: give general information, say you are not a vet, and tell the user to contact a vet right away for urgent symptoms.
- Find pets by name with findPets. Prefer an exact case-insensitive name match. If none or several pets match, ask which one. Never guess ids.
- When the user asks to see, show, open or go to something, call navigate with the matching page, then reply in one short sentence.
- To change data, call the matching create/update/delete tool directly. The app asks the user to confirm, so do not ask for confirmation in text first. If the user declines, acknowledge it and do not retry.
- Keep answers short.`,
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

/** The question the owner is asked before a write runs; undefined if the call can't be described. */
async function confirmText(
  ctx: ToolContext,
  toolName: string,
  input: unknown,
): Promise<string | undefined> {
  if (!isWriteTool(toolName)) return undefined;
  const def: AnyWriteToolDef = writeTools[toolName];
  const parsed = def.inputSchema.safeParse(input);
  if (!parsed.success) return undefined;
  return def.confirmMessage(ctx, parsed.data);
}

/**
 * Like createAgentUIStreamResponse, but every approval request is preceded by
 * a `data-confirm` part with the sentence to show, keyed by the tool call id.
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

  const calls = new Map<string, { toolName: string; input: unknown }>();
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
            const text =
              call && (await confirmText(ctx, call.toolName, call.input));
            if (text) {
              controller.enqueue({
                type: "data-confirm",
                id: chunk.toolCallId,
                data: { text },
              });
            }
          }
          controller.enqueue(chunk);
        },
      }),
    ),
  });
}
