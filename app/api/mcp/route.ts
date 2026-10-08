import { createMcpHandler } from "@modelcontextprotocol/server";
import { rejectNonLocalRequest } from "@/lib/local-request";
import { createPetsMcpServer } from "@/lib/mcp/server";

const handler = createMcpHandler(createPetsMcpServer);

async function handle(req: Request): Promise<Response> {
  return rejectNonLocalRequest(req) ?? handler.fetch(req);
}

export { handle as DELETE, handle as GET, handle as POST };
