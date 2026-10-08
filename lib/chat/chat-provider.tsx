"use client";

import { Chat, useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Pet } from "@/db/models/pet";
import type { PetsUIMessage } from "@/lib/chat/agent";
import { hrefFor, MUTATION_TOOLS } from "@/lib/chat/contract";
import { inkPet } from "@/lib/ink";

/** `art` is the species stamp art URL resolved on the server (`null` until it exists). */
export type ChatPet = {
  id: number;
  name: string;
  species: Pet["species"];
  art: string | null;
};

type ChatRouter = { push(href: string): void; refresh(): void };

type ChatPanelContextValue = {
  open: boolean;
  setOpen(open: boolean): void;
  toggle(): void;
  contextPet: ChatPet | null;
  dismissContextPet(): void;
  registerPet(pet: ChatPet): void;
  unregisterPet(petId: number): void;
};

const PHONE_QUERY = "(max-width: 639.98px)";

function isOnPetPage(petId: number): boolean {
  const path = window.location.pathname;
  const base = `/pets/${petId}`;
  return path === base || path.startsWith(`${base}/`);
}

function numericField(value: unknown, key: string): number | null {
  if (typeof value !== "object" || value === null) return null;
  const field = (value as Record<string, unknown>)[key];
  return typeof field === "number" ? field : null;
}

/**
 * Latest router and context pet for the single long-lived Chat instance;
 * updated from effects, read only inside Chat callbacks.
 */
class ChatBridge {
  #router: ChatRouter | null = null;
  #contextPet: ChatPet | null = null;

  setRouter(router: ChatRouter) {
    this.#router = router;
  }
  setContextPet(pet: ChatPet | null) {
    this.#contextPet = pet;
  }
  get router(): ChatRouter {
    if (!this.#router) throw new Error("Chat router is not ready.");
    return this.#router;
  }
  get contextPetId(): number | undefined {
    return this.#contextPet?.id;
  }
}

/** Messages live only in this instance; nothing is persisted. */
function createPetsChat(
  bridge: ChatBridge,
  closeOnPhone: () => void,
): Chat<PetsUIMessage> {
  const chat: Chat<PetsUIMessage> = new Chat<PetsUIMessage>({
    // A fixed id keeps construction free of random work during prerender.
    id: "novellia-pets",
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({
        id,
        messages,
        trigger,
        messageId,
        body,
      }) => {
        const petId = bridge.contextPetId;
        return {
          body: {
            ...body,
            id,
            messages,
            trigger,
            messageId,
            ...(petId === undefined ? {} : { petId }),
          },
        };
      },
    }),
    // Resend after a navigate output or an approval answer is added.
    sendAutomaticallyWhen: (options) =>
      lastAssistantMessageIsCompleteWithToolCalls(options) ||
      lastAssistantMessageIsCompleteWithApprovalResponses(options),
    onToolCall({ toolCall }) {
      if (toolCall.dynamic || toolCall.toolName !== "navigate") return;
      const href = hrefFor(toolCall.input.target);
      bridge.router.push(href);
      // Never await here: addToolOutput waits for this callback, so it would deadlock.
      void chat.addToolOutput({
        tool: "navigate",
        toolCallId: toolCall.toolCallId,
        output: { href },
      });
      closeOnPhone();
    },
    onFinish({ message }) {
      const router = bridge.router;
      const inkedPets = new Set<number>();
      let wroteData = false;
      let deletedViewedPet = false;

      for (const part of message.parts) {
        if (!part.type.startsWith("tool-")) continue;
        if (!("state" in part) || part.state !== "output-available") continue;
        const tool = part.type.slice(5);
        if (!(MUTATION_TOOLS as readonly string[]).includes(tool)) continue;
        wroteData = true;

        if (tool === "createMedicalRecord" || tool === "updateMedicalRecord") {
          const petId = numericField(
            "output" in part ? part.output : null,
            "petId",
          );
          if (petId !== null) inkedPets.add(petId);
        } else if (tool === "deletePet") {
          const petId = numericField(
            "input" in part ? part.input : null,
            "petId",
          );
          if (petId !== null && isOnPetPage(petId)) deletedViewedPet = true;
        }
      }

      if (!wroteData) return;
      if (deletedViewedPet) router.push("/");
      else router.refresh();
      for (const petId of inkedPets) inkPet(petId);
    },
  });
  return chat;
}

const ChatContext = createContext<Chat<PetsUIMessage> | null>(null);
const ChatPanelContext = createContext<ChatPanelContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [registeredPet, setRegisteredPet] = useState<ChatPet | null>(null);
  const [dismissedPetId, setDismissedPetId] = useState<number | null>(null);
  const [bridge] = useState(() => new ChatBridge());
  const [chat] = useState(() =>
    createPetsChat(bridge, () => {
      if (window.matchMedia(PHONE_QUERY).matches) setOpen(false);
    }),
  );

  useEffect(() => {
    bridge.setRouter(router);
  }, [bridge, router]);

  const contextPet =
    registeredPet && registeredPet.id !== dismissedPetId ? registeredPet : null;
  useEffect(() => {
    bridge.setContextPet(contextPet);
  }, [bridge, contextPet]);

  useEffect(() => {
    if (!open) return;
    document.documentElement.dataset.chatPanel = "open";
    return () => {
      delete document.documentElement.dataset.chatPanel;
    };
  }, [open]);

  const toggle = useCallback(() => setOpen((value) => !value), []);
  const contextPetId = contextPet?.id ?? null;
  const dismissContextPet = useCallback(() => {
    setDismissedPetId(contextPetId);
  }, [contextPetId]);
  const registerPet = useCallback((pet: ChatPet) => {
    setRegisteredPet((current) => {
      if (current && current.id !== pet.id) setDismissedPetId(null);
      return pet;
    });
  }, []);
  const unregisterPet = useCallback((petId: number) => {
    setRegisteredPet((current) => (current?.id === petId ? null : current));
  }, []);

  const panel = useMemo<ChatPanelContextValue>(
    () => ({
      open,
      setOpen,
      toggle,
      contextPet,
      dismissContextPet,
      registerPet,
      unregisterPet,
    }),
    [open, toggle, contextPet, dismissContextPet, registerPet, unregisterPet],
  );

  return (
    <ChatContext value={chat}>
      <ChatPanelContext value={panel}>{children}</ChatPanelContext>
    </ChatContext>
  );
}

export function usePetsChat() {
  const chat = useContext(ChatContext);
  if (!chat) throw new Error("usePetsChat must be used inside <ChatProvider>.");
  return useChat({ chat });
}

export function useChatPanel() {
  const panel = useContext(ChatPanelContext);
  if (!panel) {
    throw new Error("useChatPanel must be used inside <ChatProvider>.");
  }
  const { open, setOpen, toggle, contextPet, dismissContextPet } = panel;
  return { open, setOpen, toggle, contextPet, dismissContextPet };
}

/** Rendered by pet pages; does nothing when chat isn't configured. */
export function ChatPetContext({ pet }: { pet: ChatPet }): null {
  const panel = useContext(ChatPanelContext);
  const registerPet = panel?.registerPet;
  const unregisterPet = panel?.unregisterPet;
  const { id, name, art } = pet;
  const { id: speciesId, name: speciesName, emoji: speciesEmoji } = pet.species;

  useEffect(() => {
    if (!registerPet || !unregisterPet) return;
    registerPet({
      id,
      name,
      species: { id: speciesId, name: speciesName, emoji: speciesEmoji },
      art,
    });
    return () => unregisterPet(id);
  }, [
    registerPet,
    unregisterPet,
    id,
    name,
    speciesId,
    speciesName,
    speciesEmoji,
    art,
  ]);

  return null;
}
