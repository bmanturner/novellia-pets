/** A passport data-page field: a small-caps label over its value. */
export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="text-[11px] leading-4 font-semibold tracking-[0.08em] text-ink-muted uppercase">
        {label}
      </dt>
      <dd className="line-clamp-2 text-[14px] leading-5 break-words">
        {children}
      </dd>
    </div>
  );
}
