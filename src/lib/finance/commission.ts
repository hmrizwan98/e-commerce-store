/** Pure calculation kept out of Firestore, mirroring inventory-math.ts's style - the
 * commission owed on a single payment amount, given a store's CommissionSettings. The
 * *result* of this function is stored once on a Transaction at write time (see
 * transactions.ts) since a ledger entry is a historical fact, not a live display value -
 * but the function itself stays pure/stateless. */

import type { CommissionSettings } from "@/types/site-settings";

export function calculateCommission(amount: number, settings: CommissionSettings): number {
  if (settings.type === "percentage") return Math.max(0, amount * (settings.value / 100));
  if (settings.type === "fixed") return Math.min(Math.max(0, settings.value), amount);
  return 0;
}
