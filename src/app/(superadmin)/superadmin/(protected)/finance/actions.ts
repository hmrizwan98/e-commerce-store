"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/firebase/require-super-admin";
import { createPayout, updatePayoutStatus } from "@/lib/firebase/repositories/payouts";
import type { PayoutStatus } from "@/types/payout";

// Payout Architecture - architecture only, no payment transfer integration. Status only
// ever advances via these explicit Super Admin actions.
export async function createPayoutRequest(storeId: string, amount: number, note?: string): Promise<void> {
  const decoded = await requireSuperAdmin();
  await createPayout(storeId, amount, { note, requestedBy: decoded.uid });
  revalidatePath("/superadmin/finance");
}

export async function updatePayoutStatusAction(payoutId: string, status: PayoutStatus): Promise<void> {
  await requireSuperAdmin();
  await updatePayoutStatus(payoutId, status);
  revalidatePath("/superadmin/finance");
}
