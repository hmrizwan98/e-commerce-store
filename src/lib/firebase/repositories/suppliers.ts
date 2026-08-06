import "server-only";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { Supplier } from "@/types/supplier";

const COLLECTION = "suppliers";

// --- Admin only - suppliers are never storefront-facing ---

export async function getSupplierById(id: string): Promise<Supplier | null> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc(id).get();
  return docData<Supplier>(doc);
}

export async function getAllSuppliersForAdmin(includeDeleted = false): Promise<Supplier[]> {
  return safeQuery("getAllSuppliersForAdmin", [], async () => {
    const col = await tenantCollection(COLLECTION);
    let query = col.orderBy("name", "asc") as FirebaseFirestore.Query;
    if (!includeDeleted) {
      query = query.where("isDeleted", "==", false);
    }
    const snap = await query.get();
    return snap.docs
      .map((doc) => docData<Supplier>(doc))
      .filter((s): s is Supplier => s !== null);
  });
}
