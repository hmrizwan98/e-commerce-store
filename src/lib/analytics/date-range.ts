// Pure date-range utilities - no Firestore/server-only APIs here, so this is
// safe to import from both Server Components (resolveDateRange) and Client
// Components (DateRangeFilter needs DATE_RANGE_PRESETS).
export type DateRangePreset =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "90d"
  | "this_month"
  | "last_month"
  | "this_year"
  | "custom";

export const DATE_RANGE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_year", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function endOfDay(d: Date): number {
  return startOfDay(d) + DAY_MS - 1;
}

export function resolveDateRange(
  preset: string | undefined,
  from?: string,
  to?: string
): { start: number; end: number; preset: DateRangePreset } {
  const now = new Date();

  if (preset === "custom" && from && to) {
    const start = startOfDay(new Date(from));
    const end = endOfDay(new Date(to));
    if (!Number.isNaN(start) && !Number.isNaN(end) && start <= end) {
      return { start, end, preset: "custom" };
    }
  }

  switch (preset) {
    case "yesterday": {
      const y = new Date(now.getTime() - DAY_MS);
      return { start: startOfDay(y), end: endOfDay(y), preset: "yesterday" };
    }
    case "7d":
      return { start: startOfDay(new Date(now.getTime() - 6 * DAY_MS)), end: endOfDay(now), preset: "7d" };
    case "90d":
      return { start: startOfDay(new Date(now.getTime() - 89 * DAY_MS)), end: endOfDay(now), preset: "90d" };
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return { start, end: endOfDay(now), preset: "this_month" };
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: startOfDay(start), end: endOfDay(end), preset: "last_month" };
    }
    case "this_year": {
      const start = new Date(now.getFullYear(), 0, 1).getTime();
      return { start, end: endOfDay(now), preset: "this_year" };
    }
    case "today":
      return { start: startOfDay(now), end: endOfDay(now), preset: "today" };
    case "30d":
    default:
      return { start: startOfDay(new Date(now.getTime() - 29 * DAY_MS)), end: endOfDay(now), preset: "30d" };
  }
}

/** The immediately preceding period of the same length - what spike/drop alerts compare against. */
export function getPreviousPeriod(range: { start: number; end: number }): { start: number; end: number } {
  const length = range.end - range.start;
  return { start: range.start - length - 1, end: range.start - 1 };
}

export function formatDateRangeLabel(range: { start: number; end: number }): string {
  const fmt = (ms: number) => new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(range.start)} – ${fmt(range.end)}`;
}
