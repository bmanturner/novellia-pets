import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { routes } from "@/lib/routes";

/** Full-page frame for a form opened by a hard load (no dialog). */
export function FormPage({
  title,
  backHref = routes.home,
  backLabel = "Pets",
  children,
}: {
  title: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-[640px] flex-1 px-4 pt-6 pb-16 sm:px-6 lg:pt-10">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 rounded-sm text-[14px] text-ink-muted transition-colors duration-150 hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {backLabel}
      </Link>
      <section className="rounded-xl border border-rule bg-page">
        <h1 className="px-5 pt-5 text-[22px] leading-7 font-bold">{title}</h1>
        {children}
      </section>
    </main>
  );
}
