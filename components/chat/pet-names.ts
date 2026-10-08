import { useChatPanel } from "@/lib/chat/chat-provider";
import type { PetsUIMessage } from "@/lib/chat/agent";

export function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readPet(value: unknown): { id: number; name: string } | null {
  const pet = asRecord(value);
  return pet && typeof pet.id === "number" && typeof pet.name === "string"
    ? { id: pet.id, name: pet.name }
    : null;
}

/** Pets mentioned by tool outputs in the conversation, newest output wins. */
export function collectPetNames(
  messages: PetsUIMessage[],
): Map<number, string> {
  const names = new Map<number, string>();
  const add = (pet: { id: number; name: string } | null) => {
    if (pet) names.set(pet.id, pet.name);
  };
  for (const message of messages) {
    for (const part of message.parts) {
      if (!part.type.startsWith("tool-") || !("output" in part)) continue;
      const output: unknown = part.output;
      if (output === undefined) continue;
      switch (part.type) {
        case "tool-findPets":
          if (Array.isArray(output)) {
            for (const entry of output) add(readPet(asRecord(entry)?.pet));
          }
          break;
        case "tool-getPet":
          add(readPet(asRecord(output)?.pet));
          break;
        case "tool-createPet":
        case "tool-updatePet":
          add(readPet(output));
          break;
        case "tool-citeRecords": {
          const records = asRecord(output)?.records;
          if (Array.isArray(records)) {
            for (const record of records) {
              const r = asRecord(record);
              if (
                r &&
                typeof r.petId === "number" &&
                typeof r.petName === "string"
              ) {
                names.set(r.petId, r.petName);
              }
            }
          }
          break;
        }
      }
    }
  }
  return names;
}

/** Resolves a pet id to a name from the conversation, then the page's pet. */
export function usePetName(
  messages: PetsUIMessage[],
): (petId: number | undefined) => string | undefined {
  const { contextPet } = useChatPanel();
  const names = collectPetNames(messages);
  return (petId) => {
    if (petId === undefined) return undefined;
    return (
      names.get(petId) ??
      (contextPet?.id === petId ? contextPet.name : undefined)
    );
  };
}
