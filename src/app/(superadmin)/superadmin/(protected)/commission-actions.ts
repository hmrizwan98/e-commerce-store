"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/firebase/require-super-admin";
import { checkRateLimit } from "@/lib/firebase/rate-limit";
import { resolveCommissionChangeRequest, setStoreCommissionPolicy } from "@/lib/finance/commission-service";
import type { CommissionPolicy } from "@/lib/finance/commission";

type Result = { ok: true } | { ok: false; error: string };

/** Only Super Admin can set a store's commission policy (audited, applied immediately). */
export async function setCommissionPolicyAction(storeId: string, policy: Partial<CommissionPolicy>, reason: string): Promise<Result> {
  const decoded = await requireSuperAdmin();
  const limit = await checkRateLimit("superadmin-sensitive", decoded.uid);
  if (!limit.allowed) return { ok: false, error: "Too many changes - please wait a few minutes." };
  try {
    const res = await setStoreCommissionPolicy({ storeId: String(storeId), policy, reason, actor: { uid: decoded.uid, email: decoded.email } });
    if (!res.ok) return res;
    revalidatePath(`/superadmin/${storeId}/edit`);
    revalidatePath("/superadmin");
    return { ok: true };
  } catch (err) {
    console.error("[commission] set policy failed", err);
    return { ok: false, error: "Could not save the commission policy." };
  }
}

export async function resolveCommissionRequestAction(storeId: string, requestId: string, approve: boolean, note?: string): Promise<Result> {
  const decoded = await requireSuperAdmin();
  try {
    const res = await resolveCommissionChangeRequest({ requestId: String(requestId), approve: Boolean(approve), note, actor: { uid: decoded.uid, email: decoded.email } });
    if (!res.ok) return res;
    revalidatePath(`/superadmin/${storeId}/edit`);
    revalidatePath("/superadmin/notifications");
    return { ok: true };
  } catch (err) {
    console.error("[commission] resolve request failed", err);
    return { ok: false, error: "Could not update the request." };
  }
}
