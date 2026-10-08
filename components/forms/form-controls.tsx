"use client";

import { ChevronDown, CircleAlert } from "lucide-react";
import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useFormStatus } from "react-dom";
import { DialogCloseContext } from "@/components/route-dialog";
import { addMonths, isIsoDate } from "@/lib/dates";
import { formatDate } from "@/lib/format";

export const LABEL_CLASS =
  "text-[11px] leading-4 font-semibold tracking-[0.08em] text-ink-muted uppercase";

const CONTROL_CLASS =
  "w-full rounded-md border border-rule bg-page px-3 text-[15px] hover:border-rule-strong focus-visible:border-focus aria-[invalid=true]:border-danger";

const SECONDARY_BUTTON =
  "inline-flex h-10 items-center gap-2 rounded-md border border-cover/25 bg-page px-3.5 text-[14px] font-semibold text-cover transition-colors duration-150 hover:border-cover/50 hover:bg-page-tint";

const PRIMARY_BUTTON =
  "inline-flex h-10 items-center gap-2 rounded-md bg-cover px-4 text-[14px] font-semibold text-cover-ink transition-colors duration-150 hover:bg-cover-deep disabled:opacity-60";

const FieldScopeContext = createContext("");

/** A field's DOM id, unique to its form so a dialog never collides with a form beneath it. */
function useFieldId(name: string) {
  return `${useContext(FieldScopeContext)}${name}`;
}

function describedBy(id: string, error?: string, hint?: string) {
  const ids = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

/**
 * The form shell for pet and record forms. It scopes field ids and, after a
 * save comes back with errors, moves focus to the first invalid control so the
 * failure is announced.
 */
export function ScopedForm({
  action,
  errors,
  children,
}: {
  action: (formData: FormData) => void;
  errors: Record<string, string>;
  children: React.ReactNode;
}) {
  const scope = useId();
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    ref.current
      ?.querySelector<HTMLElement>(
        '[aria-invalid="true"], [data-invalid] input',
      )
      ?.focus();
  }, [errors]);

  return (
    <form ref={ref} action={action} className="flex min-h-0 flex-1 flex-col">
      <FieldScopeContext value={scope}>{children}</FieldScopeContext>
    </form>
  );
}

function FieldError({ id, error }: { id: string; error: string }) {
  return (
    <p
      id={`${id}-error`}
      className="mt-1 flex items-center gap-1.5 text-[13px] text-danger"
    >
      <CircleAlert className="size-4 shrink-0" aria-hidden />
      {error}
    </p>
  );
}

/** A labelled control with an optional hint and an inline error. */
export function FormField({
  label,
  name,
  error,
  hint,
  className = "",
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const id = useFieldId(name);
  return (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className={`mb-1 block ${LABEL_CLASS}`}>
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-[13px] text-ink-muted">
          {hint}
        </p>
      )}
      {error && <FieldError id={id} error={error} />}
    </div>
  );
}

/** A group of radios with a legend and an inline error tied to the group. */
export function RadioFieldset({
  legend,
  name,
  error,
  className = "",
  children,
}: {
  legend: string;
  name: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const id = useFieldId(name);
  return (
    <fieldset
      aria-describedby={error ? `${id}-error` : undefined}
      data-invalid={error ? "" : undefined}
      className={`min-w-0 ${className}`}
    >
      <legend className={`mb-1 ${LABEL_CLASS}`}>{legend}</legend>
      {children}
      {error && <FieldError id={id} error={error} />}
    </fieldset>
  );
}

/** A `<datalist>` id scoped like the fields. */
export function useListId(name: string) {
  return useFieldId(`${name}-list`);
}

type ControlProps<T extends "input" | "select" | "textarea"> =
  React.ComponentProps<T> & {
    name: string;
    error?: string;
    hint?: string;
  };

export function Input({
  name,
  error,
  hint,
  className = "",
  ...props
}: ControlProps<"input">) {
  const id = useFieldId(name);
  return (
    <input
      id={id}
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hint)}
      className={`h-10 ${CONTROL_CLASS} ${className}`}
      {...props}
    />
  );
}

function spanOf(months: number): string {
  if (months === 12) return "a year";
  if (months === 1) return "a month";
  return months % 12 === 0 ? `${months / 12} years` : `${months} months`;
}

/**
 * Quick picks under a date field ("Next year"). Each sets the field to a whole
 * number of months after the `from` field's date, or after today when there is
 * no `from` field or it's blank.
 */
export function DateShortcuts({
  name,
  label,
  from,
  today,
  options,
}: {
  name: string;
  /** The field's label, for the screen-reader description and announcement. */
  label: string;
  from?: { name: string; label: string };
  today: string;
  options: { label: string; months: number }[];
}) {
  const [announcement, setAnnouncement] = useState("");

  function pick(button: HTMLButtonElement, months: number) {
    const { form } = button;
    const field = form?.elements.namedItem(name);
    if (!(field instanceof HTMLInputElement)) return;
    const anchor = from && form?.elements.namedItem(from.name);
    const start =
      anchor instanceof HTMLInputElement && isIsoDate(anchor.value)
        ? anchor.value
        : today;
    field.value = addMonths(start, months);
    setAnnouncement(`${label} set to ${formatDate(field.value, today)}.`);
  }

  return (
    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
      {options.map((option) => (
        <button
          key={option.months}
          type="button"
          onClick={(event) => pick(event.currentTarget, option.months)}
          className="rounded-sm font-semibold text-cover underline decoration-cover/40 underline-offset-2 transition-colors duration-150 hover:decoration-cover"
        >
          {option.label}
          <span className="sr-only">
            : set {label.toLowerCase()} to {spanOf(option.months)} after{" "}
            {from ? from.label.toLowerCase() : "today"}
          </span>
        </button>
      ))}
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}

export function Textarea({
  name,
  error,
  hint,
  className = "",
  ...props
}: ControlProps<"textarea">) {
  const id = useFieldId(name);
  return (
    <textarea
      id={id}
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hint)}
      className={`min-h-24 py-2 ${CONTROL_CLASS} ${className}`}
      {...props}
    />
  );
}

export function Select({
  name,
  error,
  hint,
  className = "",
  children,
  ...props
}: ControlProps<"select">) {
  const id = useFieldId(name);
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`h-10 appearance-none pr-9 ${CONTROL_CLASS} ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
        aria-hidden
      />
    </div>
  );
}

/** Cancel (closes the dialog, or links away on a full page) and submit. */
export function FormFooter({
  submitLabel,
  pendingLabel,
  cancelHref,
}: {
  submitLabel: string;
  pendingLabel: string;
  cancelHref: string;
}) {
  const { pending } = useFormStatus();
  const closeDialog = useContext(DialogCloseContext);
  return (
    <div className="flex justify-end gap-3 border-t border-rule px-5 py-4">
      {closeDialog ? (
        <button
          type="button"
          onClick={closeDialog}
          className={SECONDARY_BUTTON}
        >
          Cancel
        </button>
      ) : (
        <Link href={cancelHref} className={SECONDARY_BUTTON}>
          Cancel
        </Link>
      )}
      <button type="submit" disabled={pending} className={PRIMARY_BUTTON}>
        {pending ? pendingLabel : submitLabel}
      </button>
    </div>
  );
}
