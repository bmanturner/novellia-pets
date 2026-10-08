"use client";

import { useEffect, useRef } from "react";

/**
 * Keeps a results area from shrinking while it stays mounted. When a filter
 * shows fewer results, a shorter page makes the browser clamp the scroll
 * position, which yanks the filters the owner just used out from under them.
 * Holding the tallest height seen keeps them in place; the space resets on a
 * width change (another layout, another height) or a fresh page load.
 */
export function HoldHeight({ children }: { children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = outer.current;
    const content = inner.current;
    if (!box || !content) return;
    let width = -1;
    let held = 0;
    // Sets the minimum straight on the element: no re-render, and it lands
    // before paint, so the shorter content never shortens the page.
    const observer = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      held = w === width ? Math.max(held, h) : h;
      width = w;
      box.style.minHeight = `${held}px`;
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={outer}>
      <div ref={inner}>{children}</div>
    </div>
  );
}
