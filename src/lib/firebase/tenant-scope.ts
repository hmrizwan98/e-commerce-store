import "server-only";
import { adminDb } from "./admin";
import { requireCurrentTenant } from "@/lib/tenant/current";

/** Every tenant-scoped collection lives under stores/{storeId}/{name} - see docs/multi-tenant plan. */
export async function tenantCollection(name: string) {
  const tenant = await requireCurrentTenant();
  return adminDb().collection("stores").doc(tenant.id).collection(name);
}

export async function tenantDoc(name: string, id: string) {
  return (await tenantCollection(name)).doc(id);
}
