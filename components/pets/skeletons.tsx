const block = "animate-pulse rounded-md bg-rule/60";

/** Placeholder for the shared pet header and its tabs. */
export function PetHeaderSkeleton() {
  return (
    <div aria-busy aria-label="Loading pet">
      <div className={`${block} h-5 w-14`} />
      <div className="mt-3 rounded-xl border border-rule bg-page">
        <div className="flex gap-4 p-4 sm:gap-5 sm:p-5">
          <div className={`${block} h-12 w-10 sm:h-[112px] sm:w-[88px]`} />
          <div className="flex-1 space-y-3">
            <div className={`${block} h-7 w-40`} />
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
              {[0, 1, 2, 3].map((field) => (
                <div key={field} className={`${block} h-9`} />
              ))}
            </div>
            <div className={`${block} h-10 sm:ml-auto sm:w-64`} />
          </div>
        </div>
        <div className="border-t border-rule bg-page-tint px-4 py-2">
          <div className={`${block} h-4 w-48`} />
        </div>
      </div>
      <div className="mt-6 flex gap-6 border-b border-rule">
        {[0, 1, 2].map((tab) => (
          <div key={tab} className={`${block} mb-3 h-5 w-16`} />
        ))}
      </div>
    </div>
  );
}

export function StatusSkeleton() {
  return (
    <div aria-busy aria-label="Loading pet">
      <div className={`${block} mb-3 h-7 w-36`} />
      <div className="divide-y divide-rule rounded-xl border border-rule bg-page">
        {[0, 1].map((row) => (
          <div key={row} className="flex items-center gap-5 px-5 py-4">
            <div className={`${block} h-8 w-16`} />
            <div className="flex-1 space-y-2">
              <div className={`${block} h-4 w-40`} />
              <div className={`${block} h-4 w-24`} />
            </div>
            <div className={`${block} hidden h-10 w-32 md:block`} />
          </div>
        ))}
      </div>
      <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 @min-[1024px]:grid-cols-2">
        {[0, 1, 2, 3].map((section) => (
          <div key={section}>
            <div className={`${block} mb-3 h-7 w-48`} />
            <div className={`${block} h-28`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecordsSkeleton() {
  return (
    <div aria-busy aria-label="Loading pet">
      <div className={`${block} mb-3 h-10`} />
      <div className={`${block} mb-6 h-10 w-full max-w-[28rem]`} />
      <div className={`${block} mb-2 h-4 w-12`} />
      <div className="divide-y divide-rule rounded-xl border border-rule bg-page">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex gap-5 px-5 py-4">
            <div className={`${block} h-5 w-20`} />
            <div className="flex-1 space-y-2">
              <div className={`${block} h-5 w-48`} />
              <div className={`${block} h-4 w-64`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div aria-busy aria-label="Loading pet" className="max-w-[860px] space-y-6">
      <div className="grid gap-x-6 gap-y-4 rounded-xl border border-rule bg-page p-4 sm:grid-cols-2 sm:p-5">
        {[0, 1, 2, 3, 4, 5].map((field) => (
          <div key={field} className={`${block} h-9`} />
        ))}
        <div className={`${block} h-16 sm:col-span-2`} />
      </div>
      <div className={`${block} h-32`} />
    </div>
  );
}
