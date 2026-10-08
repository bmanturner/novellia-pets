"use client";

import { ArrowUp, Square, X } from "lucide-react";
import { type KeyboardEvent, useEffect, useLayoutEffect, useRef } from "react";
import { SpeciesMarkView } from "@/components/species-mark-view";
import type { ChatPet } from "@/lib/chat/chat-provider";

export function Composer({
  draft,
  onDraftChange,
  onSend,
  onStop,
  busy,
  contextPet,
  onDismissPet,
  open,
}: {
  draft: string;
  onDraftChange: (draft: string) => void;
  onSend: () => void;
  onStop: () => void;
  busy: boolean;
  contextPet: ChatPet | null;
  onDismissPet: () => void;
  open: boolean;
}) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const canSend = draft.trim().length > 0;

  // Height is only measurable while the panel is shown.
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft, open]);

  useEffect(() => {
    if (open) innerRef.current?.focus();
  }, [open]);

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    event.preventDefault();
    if (canSend && !busy) onSend();
  }

  const subject = contextPet ? contextPet.name : "your pets";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend && !busy) onSend();
      }}
      className="border-t border-rule bg-page p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:border-l"
    >
      <div className="rounded-md border border-rule bg-page transition-colors duration-150 focus-within:border-focus focus-within:ring-2 focus-within:ring-focus/30 hover:border-rule-strong">
        <textarea
          ref={innerRef}
          aria-label="Message"
          rows={1}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`Ask about ${subject}, or tell me what to log…`}
          className="block max-h-[calc(9em+1rem)] w-full resize-none overflow-y-auto rounded-md bg-transparent px-3 pt-2.5 text-[16px] leading-normal text-ink outline-none placeholder:text-ink-muted sm:text-[15px]"
        />
        <div className="flex items-center justify-between gap-2 px-2 pb-2">
          {contextPet ? (
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-[13px] text-ink-muted">About</span>
              <span className="inline-flex min-w-0 items-center gap-2 rounded-md border border-rule bg-page-tint py-0.5 pr-0.5 pl-1.5">
                <SpeciesMarkView
                  species={contextPet.species}
                  art={contextPet.art}
                  size="inline"
                />
                <span className="truncate text-[13px] font-semibold text-ink">
                  {contextPet.name}
                </span>
                <button
                  type="button"
                  onClick={onDismissPet}
                  className="grid size-6 shrink-0 place-items-center rounded text-ink-muted transition-colors duration-150 hover:bg-cover/10 hover:text-cover"
                >
                  <X aria-hidden className="size-3.5" />
                  <span className="sr-only">
                    Remove {contextPet.name} from this question
                  </span>
                </button>
              </span>
            </div>
          ) : (
            <span />
          )}
          {busy ? (
            <button
              type="button"
              onClick={onStop}
              className="grid size-8 shrink-0 place-items-center rounded-md border border-cover/25 bg-page text-cover transition-colors duration-150 hover:border-cover/50 hover:bg-page-tint"
            >
              <Square aria-hidden className="size-4" />
              <span className="sr-only">Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canSend}
              className="grid size-8 shrink-0 place-items-center rounded-md bg-cover text-cover-ink transition-colors duration-150 hover:bg-cover-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowUp aria-hidden className="size-4" />
              <span className="sr-only">Send</span>
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
