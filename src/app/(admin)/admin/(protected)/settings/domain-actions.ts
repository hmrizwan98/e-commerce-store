"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { requireCurrentTenant } from "@/lib/tenant/current";
import { checkRateLimit } from "@/lib/firebase/rate-limit";
import {
  checkCustomDomain,
  removeCustomDomain,
  requestCustomDomain,
  type CustomDomainView,
  type DomainResult,
} from "@/lib/domains/custom-domain-service";

/** Store Admin -> Settings -> Custom Domain. The store is always the admin's own tenant
 * (requireAdmin cross-checks the session's tenant against the request host); results are
 * returned, not thrown, so production shows the real message. */
async function run(label: string, fn: (storeId: string, uid: string) => Promise<DomainResult>): Promise<DomainResult<CustomDomainView>> {
  const decoded = await requireAdmin();
  try {
    const store = await requireCurrentTenant();
    const limit = await checkRateLimit("custom-domain", store.id);
    if (!limit.allowed) {
      return { ok: false, error: `Too many attempts - please wait ${Math.ceil((limit.retryAfterSeconds ?? 60) / 60)} minute(s) and try again.` };
    }
    const result = await fn(store.id, decoded.uid);
    revalidatePath("/admin/settings");
    return result;
  } catch (err) {
    console.error(`[custom-domain] ${label} failed`, err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function addCustomDomainAction(domain: string): Promise<DomainResult<CustomDomainView>> {
  return run("request", (storeId, uid) => requestCustomDomain(storeId, String(domain ?? ""), uid));
}

export async function checkCustomDomainAction(): Promise<DomainResult<CustomDomainView>> {
  return run("check", (storeId, uid) => checkCustomDomain(storeId, uid));
}

export async function removeCustomDomainAction(): Promise<DomainResult<CustomDomainView>> {
  return run("remove", (storeId, uid) => removeCustomDomain(storeId, uid));
}
