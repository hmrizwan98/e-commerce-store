import "server-only";

/** Structured, duration-measuring stage logger for long multi-step
 * pipelines (store provisioning) - logs how long each named stage took,
 * so a slow step shows up directly in production logs instead of only a
 * generic function-timeout error. Not a general logging framework - scoped
 * to this one use case. */
export function createStageTimer(traceId: string) {
  let last = Date.now();
  return function stage(name: string, extra?: Record<string, unknown>) {
    const now = Date.now();
    const durationMs = now - last;
    last = now;
    console.log(`[stage:${traceId}] ${name}`, { durationMs, ...extra });
  };
}
