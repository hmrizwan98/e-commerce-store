import "server-only";

/** Structured, duration-measuring stage logger for long multi-step
 * pipelines (store provisioning) - logs how long each named stage took,
 * so a slow step shows up directly in production logs instead of only a
 * generic function-timeout error. Not a general logging framework - scoped
 * to this one use case.
 *
 * Logs elapsed time SINCE START, not "since the previous call" - once part
 * of the pipeline runs concurrently (Promise.all), multiple stage() calls
 * can resolve in overlapping ticks; a shared "last call" timestamp would
 * race across them and produce meaningless/negative durations depending on
 * delivery order. Elapsed-since-start is a monotonic value per call, safe
 * under concurrency, and log delivery/print order no longer matters - the
 * real timeline can always be reconstructed by sorting on elapsedMs. */
export function createStageTimer(traceId: string) {
  const startedAt = Date.now();
  return function stage(name: string, extra?: Record<string, unknown>) {
    console.log(`[stage:${traceId}] ${name}`, { elapsedMs: Date.now() - startedAt, ...extra });
  };
}
