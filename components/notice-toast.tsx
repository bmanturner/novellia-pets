"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Toast } from "@/components/toast";

const MESSAGES = {
  "pet-added": "Pet added.",
  "pet-updated": "Changes saved.",
  "pet-deleted": "Pet and its records deleted.",
  "record-updated": "Record updated.",
  "record-deleted": "Record deleted.",
} as const;

type NoticeCode = keyof typeof MESSAGES;

function isNoticeCode(value: string | null): value is NoticeCode {
  return value !== null && Object.hasOwn(MESSAGES, value);
}

/**
 * Shows a toast for `?notice=<code>` after a redirect. It never clears on the
 * param's absence: the Toast removes the param itself with `replaceState`,
 * which `useSearchParams` reflects. Tracking the last seen param lets the same
 * notice show again after it has been stripped.
 */
export function NoticeToast() {
  const code = useSearchParams().get("notice");
  const [seen, setSeen] = useState<string | null>(null);
  const [shown, setShown] = useState<{ code: NoticeCode; key: number } | null>(
    null,
  );

  if (code !== seen) {
    setSeen(code);
    if (isNoticeCode(code)) setShown({ code, key: (shown?.key ?? 0) + 1 });
  }

  return shown ? (
    <Toast key={shown.key} message={MESSAGES[shown.code]} param="notice" />
  ) : null;
}
