import type { Banner } from "@/types/banner";

function toMs(v: unknown): number | undefined {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && typeof (v as { toMillis?: unknown }).toMillis === "function") {
    return (v as { toMillis: () => number }).toMillis();
  }
  return undefined;
}

/** A banner is shown when it is Active and inside its optional schedule (start/end date, if set). */
export function isBannerLive(b: Pick<Banner, "isActive" | "startDate" | "endDate">, now = Date.now()): boolean {
  if (b.isActive !== true) return false;
  const start = toMs(b.startDate);
  const end = toMs(b.endDate);
  if (start && start > now) return false;
  if (end && end < now) return false;
  return true;
}
