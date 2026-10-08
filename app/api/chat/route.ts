import { getPet } from "@/db/models/pet";
import {
  chatEnabled,
  createPetsAgent,
  createPetsChatResponse,
} from "@/lib/chat/agent";
import { rejectNonLocalRequest } from "@/lib/local-request";
import { currentToolContext } from "@/lib/tools/registry";

export async function POST(req: Request): Promise<Response> {
  const rejected = rejectNonLocalRequest(req);
  if (rejected) return rejected;
  if (!chatEnabled()) {
    return new Response("Chat is not configured.", { status: 404 });
  }

  const body: unknown = await req.json().catch(() => null);
  const messages =
    body && typeof body === "object" && "messages" in body
      ? body.messages
      : undefined;
  if (!Array.isArray(messages)) {
    return new Response("Expected a JSON body with a messages array.", {
      status: 400,
    });
  }

  const rawPetId =
    body && typeof body === "object" && "petId" in body
      ? body.petId
      : undefined;
  const petId =
    typeof rawPetId === "number" &&
    Number.isSafeInteger(rawPetId) &&
    rawPetId > 0
      ? rawPetId
      : undefined;

  const ctx = await currentToolContext();
  const pet = petId ? await getPet(ctx.householdId, petId) : undefined;
  const agent = createPetsAgent(ctx, {
    viewingPet: pet && { id: pet.id, name: pet.name },
  });
  return createPetsChatResponse({
    ctx,
    agent,
    uiMessages: messages,
    abortSignal: req.signal,
  });
}
