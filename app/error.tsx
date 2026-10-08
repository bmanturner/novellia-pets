"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-[560px] flex-1 px-4 py-16">
      <div className="rounded-xl border border-rule bg-page p-6">
        <h1 className="text-[22px] leading-7 font-bold">
          Your pets couldn&rsquo;t be loaded
        </h1>
        <p className="mt-2 text-[15px] leading-6 text-ink-muted">
          The records are safe; this page failed to read them. Try again, and if
          it keeps happening, restart the app.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-cover px-4 text-[14px] font-semibold text-cover-ink transition-colors duration-150 hover:bg-cover-deep"
        >
          <RotateCcw className="size-4" aria-hidden />
          Try again
        </button>
      </div>
    </main>
  );
}
