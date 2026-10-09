"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { routes } from "@/lib/routes";

type TabKey = "status" | "records" | "profile";

/**
 * The pet's three pages as underline tabs. While a form dialog is open the
 * URL is a path none of the tabs own (e.g. /records/new), so the last tab
 * that matched stays current.
 */
export function PetTabs({
  petId,
  recordCount,
}: {
  petId: number;
  recordCount: number;
}) {
  const tabs: { key: TabKey; label: string; href: string }[] = [
    { key: "status", label: "Status", href: routes.pet(petId) },
    { key: "records", label: "Records", href: routes.petRecords(petId) },
    { key: "profile", label: "Profile", href: routes.petProfile(petId) },
  ];
  const pathname = usePathname();
  const matched = tabs.find((tab) => tab.href.split("?")[0] === pathname)?.key;
  const [current, setCurrent] = useState<TabKey>(matched ?? "status");
  if (matched && matched !== current) setCurrent(matched);

  return (
    <nav aria-label="Pet sections">
      <ul className="flex gap-6 border-b border-rule">
        {tabs.map(({ key, label, href }) => {
          const isCurrent = key === current;
          return (
            <li key={key}>
              <Link
                href={href}
                scroll={false}
                aria-current={isCurrent ? "page" : undefined}
                className={[
                  "relative inline-flex h-11 items-center gap-1.5 text-[15px]",
                  isCurrent
                    ? "font-bold text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:rounded-full after:bg-cover"
                    : "text-ink-muted hover:text-ink",
                ].join(" ")}
              >
                {label}
                {key === "records" && (
                  <span className="font-normal text-ink-muted">
                    {recordCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
