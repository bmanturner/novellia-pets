import { createMcpHandler } from "@modelcontextprotocol/server";
import { rejectForeignRequest } from "@/lib/request-guard";
import { createPetsMcpServer } from "@/lib/mcp/server";

const handler = createMcpHandler(createPetsMcpServer);

async function handle(req: Request): Promise<Response> {
  return rejectForeignRequest(req) ?? handler.fetch(req);
}

export { handle as DELETE, handle as GET, handle as POST };
