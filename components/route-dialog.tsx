"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useId, useRef } from "react";

/** Closes the surrounding route dialog; `null` outside of one. */
export const DialogCloseContext = createContext<(() => void) | null>(null);

const SIZES = {
  form: "sm:max-w-[640px]",
  confirm: "sm:max-w-[440px]",
};

/**
 * A modal for an intercepted route. It opens on mount and closes by going
 * back, so the URL and the dialog never disagree. Below `sm` it fills the
 * screen.
 */
export function RouteDialog({
  title,
  size = "form",
  children,
}: {
  title: string;
  size?: "form" | "confirm";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Next keeps visited routes mounted but hidden, which runs effect cleanups;
  // closing here releases the modal's inert page and scroll lock.
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  const close = () => router.back();

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className={`m-0 h-dvh max-h-none w-full max-w-none flex-col bg-page p-0 text-ink backdrop:bg-cover-deep/55 open:flex open:animate-[dialog-in_200ms_var(--ease-out-expo)_both] sm:m-auto sm:h-fit sm:max-h-[calc(100dvh-4rem)] sm:w-[calc(100%-2rem)] sm:rounded-xl sm:border sm:border-rule sm:shadow-[0_24px_64px_rgb(20_33_72/0.35)] ${SIZES[size]}`}
    >
      <div className="flex items-center justify-between border-b border-rule px-5 py-4">
        <h2 id={titleId} className="text-[22px] leading-7 font-bold">
          {title}
        </h2>
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="grid size-8 place-items-center rounded-md text-ink-muted hover:bg-page-tint hover:text-ink"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <DialogCloseContext value={close}>{children}</DialogCloseContext>
    </dialog>
  );
}
