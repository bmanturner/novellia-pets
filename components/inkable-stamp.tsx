"use client";

import { useEffect, useState } from "react";
import type { CareStatus } from "@/db/models/care";
import { Stamp } from "@/components/stamp";
import { INK_WINDOW_MS, useInkedAt } from "@/lib/ink";

/**
 * A pet's care stamp that replays stamp-down when the chat agent changes that
 * pet (`inkPet`), and once more if the refreshed status lands shortly after.
 * `inked` still replays it for the server-driven `?logged` flag.
 */
export function InkableStamp({
  status,
  petId,
  inked = false,
}: {
  status: CareStatus;
  petId: number;
  inked?: boolean;
}) {
  const inkedAt = useInkedAt(petId);
  // A signal fired before this stamp mounted is not ours to replay.
  const [handledAt, setHandledAt] = useState(inkedAt);
  const [seenStatus, setSeenStatus] = useState(status);
  // Open for INK_WINDOW_MS after a signal; a status change inside it replays.
  const [windowOpen, setWindowOpen] = useState(false);
  const [plays, setPlays] = useState(0);

  if (inkedAt !== handledAt) {
    setHandledAt(inkedAt);
    if (inkedAt !== null) {
      setWindowOpen(true);
      setPlays((n) => n + 1);
    }
  }
  if (status !== seenStatus) {
    setSeenStatus(status);
    if (windowOpen) setPlays((n) => n + 1);
  }

  useEffect(() => {
    if (!windowOpen) return;
    const timer = setTimeout(() => setWindowOpen(false), INK_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [windowOpen, handledAt]);

  return (
    <Stamp
      key={plays}
      status={status}
      seed={petId}
      inked={inked || plays > 0}
    />
  );
}
