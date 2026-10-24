"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { requireCurrentTenant } from "@/lib/tenant/current";
import { checkRateLimit } from "@/lib/firebase/rate-limit";
import { requestCommissionChange } from "@/lib/finance/commission-service";
import type { CommissionPolicy } from "@/lib/finance/commission";

/** Store Admin can only REQUEST a commission change - it takes effect only after Super
 * Admin approves it (see commission-service.ts). The store is the admin's own tenant. */
export async function requestCommissionChangeAction(
  proposed: Partial<CommissionPolicy>,
  reason: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const decoded = await requireAdmin();
  try {
    const store = await requireCurrentTenant();
    const limit = await checkRateLimit("superadmin-sensitive", `commission-request:${store.id}`);
    if (!limit.allowed) return { ok: false, error: "Too many requests - please try again later." };
    const result = await requestCommissionChange({
      storeId: store.id,
      proposed,
      reason,
      actor: { uid: decoded.uid, email: decoded.email },
    });
    if (!result.ok) return result;
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (err) {
    console.error("[commission] request failed", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
