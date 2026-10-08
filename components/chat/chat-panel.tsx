"use client";

import { ArrowDown, CircleAlert, LoaderCircle, X } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/components/chat/chat-message";
import { Composer } from "@/components/chat/composer";
import { EmptyState } from "@/components/chat/empty-state";
import { useChatPanel, usePetsChat } from "@/lib/chat/chat-provider";

const STICK_THRESHOLD_PX = 48;

function focusAskButton() {
  const button = document.getElementById("chat-ask-button");
  if (button && button.getClientRects().length > 0) button.focus();
}

export function ChatPanel() {
  const { open, setOpen, contextPet, dismissContextPet } = useChatPanel();
  const { messages, status, error, sendMessage, regenerate, stop } =
    usePetsChat();
  const [draft, setDraft] = useState("");
  const [showLatest, setShowLatest] = useState(false);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const stuckRef = useRef(true);

  const busy = status === "submitted" || status === "streaming";
  const lastMessage = messages.at(-1);

  function close() {
    setOpen(false);
    focusAskButton();
  }

  function scrollToEnd() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    stuckRef.current = true;
    setShowLatest(false);
    scroller.scrollTo({ top: scroller.scrollHeight });
  }

  function onScroll() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const distance =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    const stuck = distance <= STICK_THRESHOLD_PX;
    stuckRef.current = stuck;
    setShowLatest(!stuck);
  }

  // Follow content growth while the reader is at the end.
  useEffect(() => {
    const content = contentRef.current;
    const scroller = scrollerRef.current;
    if (!content || !scroller) return;
    const observer = new ResizeObserver(() => {
      if (stuckRef.current) {
        scroller.scrollTop = scroller.scrollHeight;
      } else {
        const distance =
          scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
        setShowLatest(distance > STICK_THRESHOLD_PX);
      }
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  // Opening focuses the composer and lands at the end of the conversation.
  useEffect(() => {
    if (!open) return;
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
    stuckRef.current = true;
  }, [open]);

  // The "Latest" pill never survives a reopen: the panel lands at the end.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setShowLatest(false);
  }

  // Finished answers and the failure line are announced once, by changing text.
  const announcement = error
    ? "Couldn't reach the assistant."
    : status === "ready" && lastMessage?.role === "assistant"
      ? lastMessage.parts
          .flatMap((part) => (part.type === "text" ? [part.text] : []))
          .join("\n")
          .trim()
      : "";

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    stuckRef.current = true;
    void sendMessage({ text: trimmed });
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    if (document.querySelector("dialog[open]")) return;
    event.preventDefault();
    close();
  }

  return (
    <aside
      id="chat-panel"
      aria-label="Ask about your pets"
      hidden={!open}
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-[55] flex-col bg-page not-[[hidden]]:flex not-[[hidden]]:animate-[chat-panel-in_200ms_var(--ease-out-expo)_both] sm:inset-y-0 sm:right-0 sm:left-auto sm:z-40 sm:w-(--chat-panel-width) sm:shadow-[-16px_0_40px_rgb(20_33_72/0.18)] xl:shadow-none"
    >
      <header className="flex h-[calc(4rem+env(safe-area-inset-top))] shrink-0 items-center gap-3 bg-cover px-4 pt-[env(safe-area-inset-top)] text-cover-ink sm:h-16 sm:border-l sm:border-cover-ink/15 sm:pt-0">
        <div className="flex min-w-0 flex-1 items-baseline gap-3">
          <h2 className="text-base font-bold">Ask</h2>
          <p className="truncate text-[13px] text-cover-muted">
            Not saved · reload clears
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          className="grid size-8 shrink-0 place-items-center rounded-md text-cover-muted transition-colors duration-150 hover:bg-cover-ink/10 hover:text-cover-ink focus-visible:outline-foil"
        >
          <X aria-hidden className="size-4" />
          <span className="sr-only">Close chat</span>
        </button>
      </header>

      <div className="relative min-h-0 flex-1 sm:border-l sm:border-rule">
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          aria-live="off"
          className="flex h-full flex-col overflow-y-auto overscroll-contain px-4 py-5"
        >
          <div ref={contentRef} className="mt-auto space-y-5">
            {messages.length === 0 ? (
              <EmptyState contextPet={contextPet} onAsk={send} />
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  messages={messages}
                  streaming={
                    status === "streaming" &&
                    message.role === "assistant" &&
                    message === lastMessage
                  }
                />
              ))
            )}
            {status === "submitted" && lastMessage?.role === "user" ? (
              <p className="flex items-center gap-2 text-[13px] text-ink-muted">
                <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
                Working on it…
              </p>
            ) : null}
            {error ? (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                <CircleAlert
                  aria-hidden
                  className="size-4 shrink-0 text-danger"
                />
                <p className="text-sm text-ink">
                  Couldn&apos;t reach the assistant.
                </p>
                <button
                  type="button"
                  onClick={() => void regenerate()}
                  className="inline-flex h-8 items-center rounded-md border border-cover/25 bg-page px-3 text-[13px] font-semibold text-cover transition-colors duration-150 hover:border-cover/50 hover:bg-page-tint"
                >
                  Try again
                </button>
              </div>
            ) : null}
          </div>
        </div>
        {showLatest ? (
          <button
            type="button"
            onClick={scrollToEnd}
            className="absolute bottom-3 left-1/2 inline-flex h-8 -translate-x-1/2 items-center gap-1.5 rounded-md border border-cover/25 bg-page px-3 text-[13px] font-semibold text-cover transition-colors duration-150 hover:border-cover/50 hover:bg-page-tint"
          >
            <ArrowDown aria-hidden className="size-3.5" />
            Latest
          </button>
        ) : null}
      </div>

      <div role="status" className="sr-only">
        {announcement}
      </div>

      <Composer
        draft={draft}
        onDraftChange={setDraft}
        onSend={() => {
          send(draft);
          setDraft("");
        }}
        onStop={() => void stop()}
        busy={busy}
        contextPet={contextPet}
        onDismissPet={dismissContextPet}
        open={open}
      />
    </aside>
  );
}
