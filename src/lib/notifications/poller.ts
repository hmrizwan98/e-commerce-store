/**
 * Visibility-aware, non-overlapping poller (no React, so it's unit-testable).
 *
 * - runs `task` immediately, then every `intervalMs` while the page is visible;
 * - never starts a run while the previous one is still in flight (no request pile-up on a
 *   slow network or a cold server);
 * - pauses while the tab is hidden (another tab, minimised window) and runs once as soon as
 *   it becomes visible again - a page that isn't open on screen never reads anything;
 * - optional `idleMs`: if nobody has moved the mouse / typed / scrolled / touched the page for
 *   that long, automatic runs stop; the first activity afterwards triggers one run and resumes
 *   the schedule (keeps a dashboard left open on a screen all day from using Firestore reads);
 * - `trigger()` asks for an extra run now (e.g. after navigation, or a Refresh button) -
 *   coalesced if one is in flight, and it also counts as activity;
 * - `stop()` removes every timer and listener (call it from the effect cleanup).
 */
export interface PollerEnv {
  setInterval: (fn: () => void, ms: number) => unknown;
  clearInterval: (id: unknown) => void;
  isVisible: () => boolean;
  onVisibilityChange: (fn: () => void) => () => void;
  /** Subscribe to user activity (mouse, keys, scroll, touch). */
  onActivity?: (fn: () => void) => () => void;
  now?: () => number;
}

export interface PollerOptions {
  /** Pause automatic runs after this long without user activity. */
  idleMs?: number;
}

export interface Poller {
  trigger: () => void;
  stop: () => void;
  /** True while automatic runs are paused because the user is idle. */
  isIdle: () => boolean;
}

const ACTIVITY_EVENTS = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "scroll"] as const;

export function browserPollerEnv(): PollerEnv {
  return {
    setInterval: (fn, ms) => window.setInterval(fn, ms),
    clearInterval: (id) => window.clearInterval(id as number),
    isVisible: () => document.visibilityState === "visible",
    onVisibilityChange: (fn) => {
      document.addEventListener("visibilitychange", fn);
      return () => document.removeEventListener("visibilitychange", fn);
    },
    onActivity: (fn) => {
      // Throttled: pointermove/scroll fire constantly; one call per second is plenty.
      let last = 0;
      const handler = () => {
        const t = Date.now();
        if (t - last < 1000) return;
        last = t;
        fn();
      };
      ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, handler, { passive: true }));
      return () => ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, handler));
    },
    now: () => Date.now(),
  };
}

export function startPoller(
  task: () => Promise<void>,
  intervalMs: number,
  env: PollerEnv = browserPollerEnv(),
  options: PollerOptions = {}
): Poller {
  const now = env.now ?? (() => Date.now());
  let stopped = false;
  let inFlight = false;
  let queued = false;
  let lastActivity = now();
  let idle = false;

  const isIdleNow = () => Boolean(options.idleMs) && now() - lastActivity >= (options.idleMs as number);

  const run = async () => {
    if (stopped || !env.isVisible()) return;
    if (inFlight) {
      queued = true;
      return;
    }
    inFlight = true;
    try {
      await task();
    } catch {
      // the task handles and reports its own errors; never break the loop
    } finally {
      inFlight = false;
      if (queued && !stopped) {
        queued = false;
        void run();
      }
    }
  };

  // Scheduled ticks respect the idle pause; explicit triggers / returning to the page don't.
  const scheduled = () => {
    if (isIdleNow()) {
      idle = true;
      return;
    }
    void run();
  };

  const markActive = () => {
    lastActivity = now();
    if (idle) {
      idle = false;
      void run();
    }
  };

  const timer = env.setInterval(scheduled, intervalMs);
  const offVisibility = env.onVisibilityChange(() => {
    if (env.isVisible()) {
      // Coming back to the page counts as activity.
      lastActivity = now();
      idle = false;
      void run();
    }
  });
  const offActivity = options.idleMs && env.onActivity ? env.onActivity(markActive) : () => {};
  void run();

  return {
    trigger: () => {
      lastActivity = now();
      idle = false;
      void run();
    },
    stop: () => {
      stopped = true;
      env.clearInterval(timer);
      offVisibility();
      offActivity();
    },
    isIdle: () => idle,
  };
}

/** Ids present now that weren't in the previous poll. `null` previous = first poll of the
 * session: nothing is "new" yet (it only sets the baseline, so a page load never chimes). */
export function newlyArrived(previous: string[] | null, current: string[]): string[] {
  if (!previous) return [];
  const seen = new Set(previous);
  return current.filter((id) => !seen.has(id));
}
