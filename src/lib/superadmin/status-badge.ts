import type { StoreStatus } from "@/types/store";

/** Single source of truth for how a Store's status renders as a badge, reused across the
 * dashboard, store list, and Store Details pages. */
export const STATUS_BADGE_CLASS: Record<StoreStatus, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  archived: "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
};
