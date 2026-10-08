"use client";

import { useSearchParams } from "next/navigation";
import type { CareStatus } from "@/db/models/care";
import { InkableStamp } from "@/components/inkable-stamp";

/** The pet's care stamp; replays stamp-down while `?logged` is in the URL. */
export function HeaderStamp({
  status,
  seed,
}: {
  status: CareStatus;
  seed: number;
}) {
  const inked = useSearchParams().has("logged");
  return <InkableStamp status={status} petId={seed} inked={inked} />;
}
