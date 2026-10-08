import {
  Client,
  type ElicitResult,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { getCurrentHouseholdId } from "@/db/models/household";
import { createPet, getPet, type Pet } from "@/db/models/pet";
import { createPetsMcpServer } from "@/lib/mcp/server";

const handler = createMcpHandler(createPetsMcpServer);
let client: Client;
let householdId: number;
let rex: Pet;
const elicit = vi.fn<() => Promise<ElicitResult>>();

async function connect(withElicitation: boolean): Promise<Client> {
  client = new Client(
    { name: "test", version: "1.0.0" },
    {
      capabilities: withElicitation ? { elicitation: { form: {} } } : {},
      versionNegotiation: { mode: "auto" },
    },
  );
  if (withElicitation) client.setRequestHandler("elicitation/create", elicit);
  await client.connect(
    new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
      fetch: (url, init) => handler.fetch(new Request(url, init)),
    }),
  );
  return client;
}

beforeEach(async () => {
  elicit.mockReset();
  householdId = await getCurrentHouseholdId();
  rex = await createPet(householdId, { name: "Rex", speciesId: "dog" });
});

afterEach(async () => {
  await client.close();
});

test("lists every app tool except navigate, with hints", async () => {
  const { tools } = await (await connect(true)).listTools();

  expect(tools).toHaveLength(14);
  expect(tools.map((t) => t.name)).not.toContain("navigate");
  expect(tools.find((t) => t.name === "deletePet")?.annotations).toMatchObject({
    readOnlyHint: false,
    destructiveHint: true,
  });
  expect(tools.find((t) => t.name === "findPets")?.annotations).toMatchObject({
    readOnlyHint: true,
  });
});

test("a declined write doesn't run", async () => {
  elicit.mockResolvedValue({ action: "decline" });

  const result = await (
    await connect(true)
  ).callTool({
    name: "deletePet",
    arguments: { petId: rex.id },
  });

  expect(elicit).toHaveBeenCalledOnce();
  expect(result).toMatchObject({
    isError: true,
    content: [
      { type: "text", text: "Cancelled by the user; nothing was changed." },
    ],
  });
  expect(await getPet(householdId, rex.id)).toBeDefined();
});

test("an accepted write runs after the user sees what it does", async () => {
  elicit.mockResolvedValue({ action: "accept", content: { confirm: true } });

  const result = await (
    await connect(true)
  ).callTool({
    name: "deletePet",
    arguments: { petId: rex.id },
  });

  expect(result.isError).toBeFalsy();
  expect(elicit.mock.calls[0]).toBeDefined();
  const shown = JSON.stringify(elicit.mock.calls[0]);
  expect(shown).toContain("Rex");
  expect(shown).toContain("can't be undone");
  expect(await getPet(householdId, rex.id)).toBeUndefined();
});

test("clients without elicitation can't write", async () => {
  const noElicitation = await connect(false);

  await expect(
    noElicitation.callTool({
      name: "deletePet",
      arguments: { petId: rex.id },
    }),
  ).rejects.toMatchObject({ code: -32021 });
  expect(await getPet(householdId, rex.id)).toBeDefined();
});

test("reads run without confirmation", async () => {
  const result = await (
    await connect(true)
  ).callTool({
    name: "findPets",
    arguments: {},
  });

  expect(elicit).not.toHaveBeenCalled();
  expect(result.isError).toBeFalsy();
  expect(JSON.stringify(result.content)).toContain('\\"name\\":\\"Rex\\"');
});
