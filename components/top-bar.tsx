import { PawPrint } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";
import { AskButton } from "@/components/chat/ask-button";
import { AddPetLink, TopBarAddPet } from "@/components/top-bar-add-pet";
import { routes } from "@/lib/routes";

export function TopBar({ chat }: { chat: boolean }) {
  return (
    <header data-top-bar className="bg-cover text-cover-ink">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href={routes.home}
          className="flex min-w-0 items-center gap-3 rounded-sm text-foil focus-visible:outline-foil"
        >
          <PawPrint
            className={`size-[22px] ${chat ? "hidden sm:block" : ""}`}
            strokeWidth={1.75}
            aria-hidden
          />
          <span className="text-[15px] font-bold tracking-[0.16em] whitespace-nowrap uppercase">
            Novellia Pets
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {chat && <AskButton />}
          <Suspense fallback={<AddPetLink />}>
            <TopBarAddPet />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
