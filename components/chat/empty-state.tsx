"use client";

import { CornerDownRight } from "lucide-react";
import type { ChatPet } from "@/lib/chat/chat-provider";

function suggestionsFor(pet: ChatPet | null): string[] {
  if (pet) {
    return [
      `When is ${pet.name}'s next vaccination due?`,
      `What is ${pet.name} allergic to?`,
      `What happened at ${pet.name}'s last vet visit?`,
    ];
  }
  return [
    "What's overdue or due soon?",
    "Who's on medication right now?",
    "Is chocolate dangerous for dogs?",
  ];
}

export function EmptyState({
  contextPet,
  onAsk,
}: {
  contextPet: ChatPet | null;
  onAsk: (text: string) => void;
}) {
  return (
    <div>
      <h2 className="text-[22px] leading-tight font-bold text-ink">
        Ask about your pets
      </h2>
      <ul className="mt-4 border-t border-rule">
        {suggestionsFor(contextPet).map((text) => (
          <li key={text} className="border-b border-rule">
            <button
              type="button"
              onClick={() => onAsk(text)}
              className="flex w-full items-start gap-2 px-1 py-3 text-left text-sm text-ink transition-colors duration-150 hover:bg-page-tint"
            >
              <CornerDownRight
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-ink-muted"
              />
              <span>{text}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[13px] leading-snug text-ink-muted">
        Answers come from your records and name the ones they used. General
        advice isn&apos;t a diagnosis. For anything urgent, call your vet.
      </p>
    </div>
  );
}
