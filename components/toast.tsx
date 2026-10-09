"use client";

import { Stamp as StampIcon, X } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Confirms a just-finished action and drops its URL param (`?logged=<id>`,
 * `?notice=<code>`) so a refresh doesn't confirm it again. `history.replaceState`
 * updates the URL without a server render, which would unmount this toast.
 */
export function Toast({
  message,
  param,
}: {
  message: string;
  param: "logged" | "notice";
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete(param);
    window.history.replaceState(null, "", url);
    const timer = window.setTimeout(() => setOpen(false), 6000);
    return () => window.clearTimeout(timer);
  }, [param]);

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-[calc(var(--chat-inset,0px)+24px)] sm:bottom-6 print:hidden"
    >
      {open && (
        <p className="pointer-events-auto flex animate-[toast-in_200ms_var(--ease-out-expo)_both] items-center gap-3 rounded-lg bg-cover py-2.5 pr-2 pl-4 text-[14px] text-cover-ink shadow-[0_8px_24px_rgb(20_33_72/0.28)]">
          <StampIcon className="size-4 text-foil" aria-hidden />
          {message}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid size-8 place-items-center rounded-md text-cover-muted hover:bg-cover-ink/10 hover:text-cover-ink focus-visible:outline-foil"
          >
            <X className="size-4" aria-hidden />
            <span className="sr-only">Dismiss</span>
          </button>
        </p>
      )}
    </div>
  );
}
