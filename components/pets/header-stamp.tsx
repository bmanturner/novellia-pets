"use client";

import { useSearchParams } from "next/navigation";
import type { CareStatus } from "@/db/models/care";
import { Stamp } from "@/components/stamp";

/** The pet's care stamp; replays stamp-down while `?logged` is in the URL. */
export function HeaderStamp({
  status,
  seed,
}: {
  status: CareStatus;
  seed: number;
}) {
  const inked = useSearchParams().has("logged");
  return <Stamp status={status} seed={seed} inked={inked} />;
}
