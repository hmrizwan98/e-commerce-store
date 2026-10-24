/** Shown while a tracking lookup runs (the form submits as a normal page navigation). */
export default function Loading() {
  const bar = "animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800";
  const card = "bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8";
  return (
    <div className="container py-12 lg:pb-24 lg:pt-16 max-w-3xl space-y-8" aria-busy="true" aria-label="Loading order status">
      <div className="flex flex-col items-center gap-3">
        <div className={`${bar} h-5 w-44`} />
        <div className={`${bar} h-9 w-72`} />
        <div className={`${bar} h-4 w-80 max-w-full`} />
      </div>
      <div className={`${card} grid sm:grid-cols-5 gap-4 items-end`}>
        <div className={`${bar} h-11 sm:col-span-2 !rounded-2xl`} />
        <div className={`${bar} h-11 sm:col-span-2 !rounded-2xl`} />
        <div className={`${bar} h-11 sm:col-span-1 !rounded-2xl`} />
      </div>
      <div className={`${card} space-y-8`}>
        <div className="flex justify-between gap-4">
          <div className="space-y-2">
            <div className={`${bar} h-3 w-20`} />
            <div className={`${bar} h-7 w-48`} />
          </div>
          <div className={`${bar} h-8 w-32`} />
        </div>
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`${bar} w-8 h-8 sm:w-10 sm:h-10`} />
              <div className={`${bar} h-2.5 w-12`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
