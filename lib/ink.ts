"use client";

import { useSyncExternalStore } from "react";

/**
 * Client-side "re-ink this pet's stamp" signal for changes made outside a
 * page navigation (the chat agent). Stamps replay stamp-down when the signal
 * lands, and again if the refreshed status arrives within `INK_WINDOW_MS`.
 */
export const INK_WINDOW_MS = 2000;

type Ink = { petId: number; at: number };

let latest: Ink | null = null;
const listeners = new Set<() => void>();

export function inkPet(petId: number): void {
  latest = { petId, at: Date.now() };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** When this pet was last inked, or `null`. */
export function useInkedAt(petId: number): number | null {
  return useSyncExternalStore(
    subscribe,
    () => (latest?.petId === petId ? latest.at : null),
    () => null,
  );
}
