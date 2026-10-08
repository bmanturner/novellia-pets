"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

/**
 * Next.js only scrolls on navigation when the new page's first element is
 * outside the viewport, and it measures the deepest changed segment. A layout
 * that renders content above its page (like the pet header) therefore keeps
 * the previous route's scroll position. Rendered in such a layout, this
 * scrolls to the top whenever the segment is freshly entered by a push or
 * replace, while leaving back/forward restoration and in-layout navigations
 * (tab switches, dialogs) alone, since those keep the same `bfcacheId`.
 */
export function ScrollToTop() {
  const { bfcacheId } = useRouter();
  // Survives <Activity> hide/show, so revealing a preserved route on
  // back/forward does not count as a fresh entry.
  const handled = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (handled.current === bfcacheId) return;
    handled.current = bfcacheId;
    window.scrollTo(0, 0);
  }, [bfcacheId]);

  return null;
}
