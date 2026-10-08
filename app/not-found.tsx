import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-[560px] flex-1 px-4 py-16">
      <div className="rounded-xl border border-rule bg-page p-6">
        <h1 className="text-[22px] leading-7 font-bold">
          We couldn&rsquo;t find that page
        </h1>
        <p className="mt-2 text-[15px] leading-6 text-ink-muted">
          It may have been deleted, or the link is out of date.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-cover px-4 text-[14px] font-semibold text-cover-ink transition-colors duration-150 hover:bg-cover-deep"
        >
          Back to your pets
        </Link>
      </div>
    </main>
  );
}
