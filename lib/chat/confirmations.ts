import type { PetsUIMessage } from "@/lib/chat/agent";

/** The server-streamed confirmation sentence for a pending mutation. */
export function findConfirmText(
  message: PetsUIMessage,
  toolCallId: string,
): string | undefined {
  for (const part of message.parts) {
    if (part.type === "data-confirm" && part.id === toolCallId) {
      return part.data.text;
    }
  }
  return undefined;
}
