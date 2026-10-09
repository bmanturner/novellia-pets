"use client";

import { FileText, MoreHorizontal, Pencil } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

const ITEM =
  "flex h-11 items-center gap-2 rounded-md px-3 text-[14px] font-semibold text-cover hover:bg-page-tint focus-visible:bg-page-tint";

/** Phone overflow for the secondary pet actions: a disclosure of real links. */
export function PetActionsMenu({
  editHref,
  summaryHref,
}: {
  editHref: string;
  summaryHref: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLElement>("a")?.focus();
    function onPointerDown(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function onKeyDown(event: React.KeyboardEvent) {
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const items = [
        ...(root.current?.querySelectorAll<HTMLElement>("a") ?? []),
      ];
      if (items.length === 0) return;
      event.preventDefault();
      const at = items.indexOf(document.activeElement as HTMLElement);
      const step = event.key === "ArrowDown" ? 1 : -1;
      items[(at + step + items.length) % items.length].focus();
    }
  }

  return (
    <div
      ref={root}
      className="relative sm:hidden"
      onKeyDown={onKeyDown}
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget as Node | null))
          setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 items-center gap-2 rounded-md border border-cover/25 bg-page px-3.5 text-[14px] font-semibold text-cover transition-colors duration-150 hover:border-cover/50 hover:bg-page-tint"
      >
        <MoreHorizontal className="size-4" aria-hidden />
        More
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="More pet actions"
          className="absolute top-full right-0 z-20 mt-2 w-48 rounded-lg border border-rule bg-page p-1 shadow-lg"
        >
          <Link
            href={editHref}
            role="menuitem"
            className={ITEM}
            onClick={() => setOpen(false)}
          >
            <Pencil className="size-4" aria-hidden />
            Edit pet
          </Link>
          <Link
            href={summaryHref}
            role="menuitem"
            className={ITEM}
            onClick={() => setOpen(false)}
          >
            <FileText className="size-4" aria-hidden />
            Vet summary
          </Link>
        </div>
      )}
    </div>
  );
}
