"use client";

import { MessageSquareText } from "lucide-react";
import { useChatPanel } from "@/lib/chat/chat-provider";

export function AskButton() {
  const { open, toggle } = useChatPanel();
  return (
    <button
      type="button"
      id="chat-ask-button"
      aria-expanded={open}
      aria-controls="chat-panel"
      onClick={toggle}
      className={[
        "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-cover-ink/30 px-3 text-sm font-semibold text-cover-ink transition-colors duration-150 hover:bg-cover-ink/10 focus-visible:outline-foil sm:px-4",
        open ? "bg-cover-ink/15" : "",
      ].join(" ")}
    >
      <MessageSquareText aria-hidden className="size-4" />
      <span className="sr-only sm:not-sr-only">Ask</span>
    </button>
  );
}
