import type { PetsUIMessage } from "@/lib/chat/agent";
import type { ConfirmationData } from "@/lib/chat/contract";

/** The server-streamed description of a pending mutation. */
export function findConfirmation(
  message: PetsUIMessage,
  toolCallId: string,
): ConfirmationData | undefined {
  for (const part of message.parts) {
    if (part.type === "data-confirm" && part.id === toolCallId) {
      return part.data;
    }
  }
  return undefined;
}
