import "server-only";
import {
  acceptedContent,
  type CallToolResult,
  type InputRequiredResult,
  inputRequired,
  inputResponse,
  McpServer,
} from "@modelcontextprotocol/server";
import { z } from "zod";
import {
  type AnyToolDef,
  type AnyWriteToolDef,
  currentToolContext,
  readTools,
  writeTools,
} from "@/lib/tools/registry";

const ConfirmSchema = z.object({
  confirm: z.boolean().meta({ title: "Yes, do it" }),
});

async function run(fn: () => Promise<unknown>): Promise<CallToolResult> {
  try {
    return { content: [{ type: "text", text: JSON.stringify(await fn()) }] };
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    return { content: [{ type: "text", text }], isError: true };
  }
}

/** Every write needs an accepted confirmation elicitation; clients without elicitation can only read. */
export function createPetsMcpServer(): McpServer {
  const server = new McpServer({ name: "novellia-pets", version: "0.1.0" });

  for (const [name, def] of Object.entries(readTools) as [
    string,
    AnyToolDef,
  ][]) {
    server.registerTool(
      name,
      {
        description: def.description,
        inputSchema: def.inputSchema,
        annotations: { readOnlyHint: true },
      },
      async (input) =>
        run(async () => def.execute(await currentToolContext(), input)),
    );
  }

  for (const [name, def] of Object.entries(writeTools) as [
    string,
    AnyWriteToolDef,
  ][]) {
    server.registerTool(
      name,
      {
        description: def.description,
        inputSchema: def.inputSchema,
        annotations: {
          readOnlyHint: false,
          destructiveHint: def.destructive,
          idempotentHint: false,
        },
      },
      async (input, mcpCtx): Promise<CallToolResult | InputRequiredResult> => {
        const ctx = await currentToolContext();
        const responses = mcpCtx.mcpReq.inputResponses;
        if (inputResponse(responses, "confirm").kind === "missing") {
          return inputRequired({
            inputRequests: {
              confirm: inputRequired.elicit({
                message: await def.confirmMessage(ctx, input),
                requestedSchema: ConfirmSchema,
              }),
            },
          });
        }
        if (
          acceptedContent(responses, "confirm", ConfirmSchema)?.confirm !== true
        ) {
          return {
            content: [
              {
                type: "text",
                text: "Cancelled by the user; nothing was changed.",
              },
            ],
            isError: true,
          };
        }
        return run(() => def.execute(ctx, input));
      },
    );
  }

  return server;
}
