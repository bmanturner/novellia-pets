"use client";

import { Trash2 } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";

const TRIGGERS = {
  row: "inline-flex h-11 items-center rounded-md px-4 text-[13px] font-semibold text-danger hover:bg-danger/[0.06] sm:h-8 sm:px-3",
  page: "inline-flex h-10 items-center gap-2 rounded-md border border-danger/40 bg-page px-3.5 text-[14px] font-semibold text-danger transition-colors duration-150 hover:border-danger/70 hover:bg-danger/[0.06]",
};

function ConfirmButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center gap-2 rounded-md bg-danger px-4 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-danger/90 disabled:opacity-60"
    >
      {pending ? "Deleting…" : label}
    </button>
  );
}

/**
 * A delete button that asks first. The confirmation is a modal owned by this
 * component, not a route, because nothing about it needs a URL.
 */
export function DeleteDialog({
  triggerLabel,
  triggerVariant,
  title,
  description,
  confirmLabel,
  action,
  fields,
}: {
  triggerLabel: ReactNode;
  triggerVariant: "row" | "page";
  title: string;
  description: string;
  confirmLabel: string;
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // A hidden (kept-alive) route must not leave a modal holding the page inert.
  useEffect(() => {
    const dialog = ref.current;
    return () => dialog?.close();
  }, []);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
        className={TRIGGERS[triggerVariant]}
      >
        {triggerVariant === "page" && <Trash2 className="size-4" aria-hidden />}
        {triggerLabel}
      </button>
      <dialog
        ref={ref}
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target === event.currentTarget) ref.current?.close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-[440px] rounded-xl border border-rule bg-page p-0 text-ink shadow-[0_24px_64px_rgb(20_33_72/0.35)] backdrop:bg-cover-deep/55 animate-[dialog-in_200ms_var(--ease-out-expo)_both]"
      >
        <form action={action}>
          {Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <div className="px-5 pt-5 pb-4">
            <h2 id={titleId} className="text-[22px] leading-7 font-bold">
              {title}
            </h2>
            <p
              id={descriptionId}
              className="mt-2 text-[15px] leading-6 text-ink-muted"
            >
              {description}
            </p>
          </div>
          <div className="flex justify-end gap-3 border-t border-rule px-5 py-4">
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-cover/25 bg-page px-3.5 text-[14px] font-semibold text-cover transition-colors duration-150 hover:border-cover/50 hover:bg-page-tint"
            >
              Cancel
            </button>
            <ConfirmButton label={confirmLabel} />
          </div>
        </form>
      </dialog>
    </>
  );
}
