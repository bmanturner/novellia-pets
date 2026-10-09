"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/lib/routes";

/** Hidden on the Add pet page itself; the pathname is runtime data, so render inside Suspense. */
export function TopBarAddPet() {
  if (usePathname() === routes.newPet) return null;
  return <AddPetLink />;
}

export function AddPetLink() {
  return (
    <Link
      href={routes.newPet}
      className="inline-flex h-10 items-center gap-2 rounded-md bg-cover-ink px-3.5 text-[14px] font-semibold whitespace-nowrap text-cover transition-colors duration-150 hover:bg-white focus-visible:outline-foil"
    >
      <Plus className="size-4" strokeWidth={2.5} aria-hidden />
      Add pet
    </Link>
  );
}
