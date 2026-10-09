"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

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

  // Bumped each time a hidden dialog is revealed again, so that open mounts its
  // children fresh instead of resurfacing the previous visit's form state.
  const [visit, setVisit] = useState(0);
  const mounted = useRef(false);

  // Next keeps visited routes mounted but hidden, which runs effect cleanups
  // (and re-runs setup on reveal); closing here releases the modal's inert page
  // and scroll lock. State is only updated in setup, never in cleanup.
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    // Skip the first mount (children are already fresh); any later setup is a
    // reveal of a preserved route (or a StrictMode re-run, which is harmless).
    if (mounted.current) setVisit((count) => count + 1);
    mounted.current = true;
    return () => {
      dialog?.close();
    };
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
          className="relative grid size-8 place-items-center rounded-md text-ink-muted before:absolute before:-inset-1.5 before:content-[''] hover:bg-page-tint hover:text-ink sm:before:hidden"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <DialogCloseContext value={close}>
        <Fragment key={visit}>{children}</Fragment>
      </DialogCloseContext>
    </dialog>
  );
}
