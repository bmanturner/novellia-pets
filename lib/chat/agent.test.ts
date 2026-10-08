import type { LanguageModelV4StreamPart } from "@ai-sdk/provider";
import { convertArrayToReadableStream, MockLanguageModelV4 } from "ai/test";
import { beforeEach, expect, test } from "vitest";
import { db } from "@/db";
import { getCurrentHouseholdId } from "@/db/models/household";
import { createMedicalRecord } from "@/db/models/medical-record";
import { createPet, getPet, type Pet } from "@/db/models/pet";
import { createPetsAgent, createPetsChatResponse } from "@/lib/chat/agent";
import type { ToolContext } from "@/lib/tools/registry";

const finish: LanguageModelV4StreamPart = {
  type: "finish",
  finishReason: { unified: "tool-calls", raw: undefined },
  usage: {
    inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
    outputTokens: { total: 1, text: 1, reasoning: 0 },
  },
};

type Step = { stream: ReadableStream<LanguageModelV4StreamPart> };

function toolCallStep(
  toolCallId: string,
  toolName: string,
  input: object,
): Step {
  return {
    stream: convertArrayToReadableStream<LanguageModelV4StreamPart>([
      { type: "tool-call", toolCallId, toolName, input: JSON.stringify(input) },
      finish,
    ]),
  };
}

function textStep(text: string): Step {
  return {
    stream: convertArrayToReadableStream<LanguageModelV4StreamPart>([
      { type: "text-start", id: "t" },
      { type: "text-delta", id: "t", delta: text },
      { type: "text-end", id: "t" },
      {
        ...finish,
        finishReason: { unified: "stop", raw: undefined },
      } as LanguageModelV4StreamPart,
    ]),
  };
}

type Chunk = { type: string; [key: string]: unknown };

/** Runs the agent like /api/chat does and returns the UI stream chunks. */
async function chat(doStream: Step[], uiMessages: unknown[]): Promise<Chunk[]> {
  const agent = createPetsAgent(ctx, {
    model: new MockLanguageModelV4({ doStream }),
  });
  const response = await createPetsChatResponse({ ctx, agent, uiMessages });
  return (await response.text())
    .split("\n")
    .filter((line) => line.startsWith("data: {"))
    .map((line) => JSON.parse(line.slice("data: ".length)) as Chunk);
}

const ask = (text: string) => ({
  id: "u1",
  role: "user",
  parts: [{ type: "text", text }],
});

let ctx: ToolContext;
let rex: Pet;

beforeEach(async () => {
  ctx = { householdId: await getCurrentHouseholdId(), today: "2026-10-08" };
  rex = await createPet(ctx.householdId, { name: "Rex", speciesId: "dog" });
});

async function requestDelete(): Promise<string> {
  const chunks = await chat(
    [toolCallStep("call-1", "deletePet", { petId: rex.id })],
    [ask("Delete Rex")],
  );
  const approval = chunks.find((c) => c.type === "tool-approval-request");
  expect(approval).toMatchObject({ toolCallId: "call-1" });
  return approval!.approvalId as string;
}

function answerApproval(approvalId: string, approved: boolean) {
  return [
    ask("Delete Rex"),
    {
      id: "a1",
      role: "assistant",
      parts: [
        { type: "step-start" },
        {
          type: "tool-deletePet",
          toolCallId: "call-1",
          state: "approval-responded",
          input: { petId: rex.id },
          approval: { id: approvalId, approved },
        },
      ],
    },
  ];
}

test("writes wait for approval", async () => {
  await requestDelete();

  expect(await getPet(ctx.householdId, rex.id)).toBeDefined();
});

test("an approved write runs", async () => {
  const approvalId = await requestDelete();

  const chunks = await chat(
    [textStep("Deleted Rex.")],
    answerApproval(approvalId, true),
  );

  expect(chunks).toContainEqual(
    expect.objectContaining({
      type: "tool-output-available",
      toolCallId: "call-1",
    }),
  );
  expect(await getPet(ctx.householdId, rex.id)).toBeUndefined();
});

test("a denied write doesn't run", async () => {
  const approvalId = await requestDelete();

  await chat([textStep("Okay, kept Rex.")], answerApproval(approvalId, false));

  expect(await getPet(ctx.householdId, rex.id)).toBeDefined();
});

test("navigate is left for the browser to run", async () => {
  const chunks = await chat(
    [
      toolCallStep("call-1", "findPets", { query: "Rex" }),
      toolCallStep("call-2", "navigate", {
        target: { page: "pet", petId: rex.id },
      }),
    ],
    [ask("Show me Rex")],
  );

  expect(chunks).toContainEqual(
    expect.objectContaining({
      type: "tool-output-available",
      toolCallId: "call-1",
      output: [
        expect.objectContaining({
          pet: expect.objectContaining({ name: "Rex" }),
        }),
      ],
    }),
  );
  expect(chunks).toContainEqual(
    expect.objectContaining({
      type: "tool-input-available",
      toolName: "navigate",
      input: { target: { page: "pet", petId: rex.id } },
    }),
  );
  expect(chunks.some((c) => c.type.includes("error"))).toBe(false);
  expect(
    chunks.some(
      (c) => c.toolCallId === "call-2" && c.type === "tool-output-available",
    ),
  ).toBe(false);
});

test("an approval request carries the confirmation sentence", async () => {
  const chunks = await chat(
    [toolCallStep("call-1", "deletePet", { petId: rex.id })],
    [ask("Delete Rex")],
  );

  expect(chunks).toContainEqual(
    expect.objectContaining({
      type: "data-confirm",
      id: "call-1",
      data: { text: expect.stringContaining("Delete Rex") },
    }),
  );
});

test("citeRecords returns this household's records and drops others", async () => {
  await db.insertInto("household").values({ id: 2, name: "Other" }).execute();
  const stranger = await createPet(2, { name: "Stranger", speciesId: "cat" });
  const foreign = await createMedicalRecord(2, stranger.id, {
    typeId: "visit",
    title: "Checkup",
    occurredOn: "2026-01-02",
    details: {},
  });
  const own = await createMedicalRecord(ctx.householdId, rex.id, {
    typeId: "vaccination",
    title: "Rabies (3-year)",
    occurredOn: "2026-09-01",
    details: {},
  });

  const chunks = await chat(
    [
      toolCallStep("call-1", "citeRecords", {
        recordIds: [foreign!.id, own!.id, own!.id],
      }),
    ],
    [ask("When was Rex vaccinated?")],
  );

  expect(chunks).toContainEqual(
    expect.objectContaining({
      type: "tool-output-available",
      toolCallId: "call-1",
      output: {
        records: [
          expect.objectContaining({
            id: own!.id,
            petId: rex.id,
            petName: "Rex",
            title: "Rabies (3-year)",
          }),
        ],
      },
    }),
  );
});
