"use client";

import { ArrowDown, CircleAlert, LoaderCircle, X } from "lucide-react";
import {
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { ChatMessage } from "@/components/chat/chat-message";
import { Composer } from "@/components/chat/composer";
import { EmptyState } from "@/components/chat/empty-state";
import {
  PHONE_QUERY,
  useChatPanel,
  usePetsChat,
} from "@/lib/chat/chat-provider";

const STICK_THRESHOLD_PX = 48;
const USER_SCROLL_WINDOW_MS = 700;
const SCROLL_KEYS: Record<string, true> = {
  ArrowUp: true,
  ArrowDown: true,
  PageUp: true,
  PageDown: true,
  Home: true,
  End: true,
  " ": true,
};

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
  const [stoppedIds, setStoppedIds] = useState<ReadonlySet<string>>(new Set());
  const [stoppedBare, setStoppedBare] = useState(false);
  const asideRef = useRef<HTMLElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const stuckRef = useRef(true);
  const userScrollAtRef = useRef(Number.NEGATIVE_INFINITY);

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

  // Only the reader's own scrolling can leave the end; our programmatic jumps
  // (which land after content has already grown) must not unstick.
  function markUserScroll() {
    userScrollAtRef.current = performance.now();
  }

  function onScrollerKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (SCROLL_KEYS[event.key] === true) markUserScroll();
  }

  // On phones the sheet covers the page, so following an in-app link from the
  // transcript (View, citations, Opened…) closes it, as the navigate tool does.
  // Next's <Link> has already called preventDefault, so check the click itself.
  function onTranscriptClick(event: MouseEvent<HTMLDivElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey) return;
    if (event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest("a[href]");
    if (!link || link.getAttribute("target") === "_blank") return;
    const href = link.getAttribute("href") ?? "";
    if (!href.startsWith("/") || href.startsWith("//")) return;
    if (window.matchMedia(PHONE_QUERY).matches) setOpen(false);
  }

  function onScroll() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const distance =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    if (distance <= STICK_THRESHOLD_PX) {
      stuckRef.current = true;
      setShowLatest(false);
    } else if (
      performance.now() - userScrollAtRef.current <
      USER_SCROLL_WINDOW_MS
    ) {
      stuckRef.current = false;
      setShowLatest(true);
    }
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
    setStoppedBare(false);
    void sendMessage({ text: trimmed });
  }

  function onStop() {
    if (lastMessage?.role === "assistant") {
      const id = lastMessage.id;
      setStoppedIds((prev) => new Set(prev).add(id));
    } else if (lastMessage?.role === "user") {
      setStoppedBare(true);
    }
    void stop();
  }

  // Escape closes from anywhere while open, unless a dialog owns it.
  useEffect(() => {
    if (!open) return;
    function onDocKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (document.querySelector("dialog[open]")) return;
      event.preventDefault();
      setOpen(false);
      focusAskButton();
    }
    document.addEventListener("keydown", onDocKeyDown);
    return () => document.removeEventListener("keydown", onDocKeyDown);
  }, [open, setOpen]);

  // While the panel overlays the page (640–1279px), a press outside it closes
  // it and still reaches what was pressed. Docked from 1280px, the page beside
  // it is meant to be used, so presses there leave it open. The Ask button
  // toggles on its own, and an open dialog owns the page.
  useEffect(() => {
    if (!open) return;
    const overlay = window.matchMedia(
      "(min-width: 640px) and (max-width: 1279px)",
    );
    function onPointerDown(event: PointerEvent) {
      if (!overlay.matches || event.button !== 0) return;
      const target = event.target as Element | null;
      if (!target || asideRef.current?.contains(target)) return;
      if (target.closest("#chat-ask-button")) return;
      if (document.querySelector("dialog[open]")) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, setOpen]);

  // When the focused control unmounts (Cancel, Stop, Latest), focus falls to
  // <body>; bring it back into the panel. Clicks on the page are left alone.
  useEffect(() => {
    const aside = asideRef.current;
    if (!open || !aside) return;
    let pointerOutside = false;
    let frame = 0;
    function onPointerDown(event: PointerEvent) {
      pointerOutside = !aside?.contains(event.target as Node);
    }
    function onDocKey() {
      pointerOutside = false;
    }
    function onFocusOut(event: FocusEvent) {
      if (event.relatedTarget || pointerOutside) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!aside || aside.hidden || pointerOutside) return;
        if (document.activeElement !== document.body) return;
        if (window.matchMedia("(pointer: coarse)").matches) {
          scrollerRef.current?.focus({ preventScroll: true });
          return;
        }
        aside.querySelector("textarea")?.focus({ preventScroll: true });
      });
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onDocKey, true);
    aside.addEventListener("focusout", onFocusOut);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onDocKey, true);
      aside.removeEventListener("focusout", onFocusOut);
    };
  }, [open]);

  return (
    <aside
      id="chat-panel"
      aria-label="Ask about your pets"
      hidden={!open}
      ref={asideRef}
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
          onWheel={markUserScroll}
          onTouchStart={markUserScroll}
          onTouchMove={markUserScroll}
          onPointerDown={markUserScroll}
          onKeyDown={onScrollerKeyDown}
          aria-live="off"
          onClick={onTranscriptClick}
          className="flex h-full flex-col overflow-y-auto overscroll-contain px-4 pt-5 pb-8"
        >
          <div ref={contentRef} className="space-y-5">
            {messages.length === 0 ? (
              <EmptyState contextPet={contextPet} onAsk={send} />
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  messages={messages}
                  stopped={stoppedIds.has(message.id)}
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
            ) : stoppedBare &&
              status === "ready" &&
              lastMessage?.role === "user" ? (
              <p className="text-[13px] text-ink-muted">Stopped.</p>
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
            className="absolute bottom-0 left-1/2 z-10 inline-flex h-8 -translate-x-1/2 translate-y-3 items-center gap-1.5 rounded-md border border-cover/25 bg-page px-3 text-[13px] font-semibold text-cover shadow-[0_4px_14px_rgb(20_33_72/0.22)] transition-colors duration-150 hover:border-cover/50 hover:bg-page-tint"
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
        onStop={onStop}
        busy={busy}
        contextPet={contextPet}
        onDismissPet={dismissContextPet}
        open={open}
      />
    </aside>
  );
}
