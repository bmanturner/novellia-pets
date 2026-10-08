/** Full-page frame for a form opened by a hard load (no dialog). */
export function FormPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-[640px] flex-1 px-4 pt-6 pb-16 sm:px-6 lg:pt-10">
      <section className="rounded-xl border border-rule bg-page">
        <h1 className="px-5 pt-5 text-[22px] leading-7 font-bold">{title}</h1>
        {children}
      </section>
    </main>
  );
}
