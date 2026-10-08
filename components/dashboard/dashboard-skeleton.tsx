const block = "animate-pulse rounded-md bg-rule/60";

/** Static-shell placeholder while the dashboard's data streams in. */
export function DashboardSkeleton() {
  return (
    <div
      aria-busy
      aria-label="Loading your pets"
      className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
    >
      <div className="lg:col-span-2">
        <div className={`${block} mb-3 h-7 w-36`} />
        <div className="divide-y divide-rule rounded-xl border border-rule bg-page">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center gap-5 px-5 py-4">
              <div className={`${block} h-8 w-16`} />
              <div className={`${block} h-12 w-10`} />
              <div className="flex-1 space-y-2">
                <div className={`${block} h-4 w-40`} />
                <div className={`${block} h-4 w-56`} />
              </div>
              <div className={`${block} hidden h-10 w-32 md:block`} />
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-start-2 lg:row-start-2">
        <div className={`${block} mb-3 h-7 w-52`} />
        <div className={`${block} h-40`} />
      </div>
      <div className="lg:col-start-1 lg:row-start-2">
        <div className={`${block} mb-3 h-7 w-24`} />
        <div className={`${block} mb-4 h-10`} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((card) => (
            <div
              key={card}
              className="flex gap-4 rounded-xl border border-rule bg-page p-4"
            >
              <div className={`${block} h-[112px] w-[88px]`} />
              <div className="flex-1 space-y-3">
                <div className={`${block} h-6 w-28`} />
                <div className={`${block} h-4`} />
                <div className={`${block} h-4 w-3/4`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
