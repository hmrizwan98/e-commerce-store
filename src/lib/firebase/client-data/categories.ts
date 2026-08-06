import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { Category } from "@/types/category";

export async function fetchActiveCategories(tenantId: string): Promise<Category[]> {
  const q = query(
    collection(getFirebaseDb(), "stores", tenantId, "categories"),
    where("isActive", "==", true),
    where("isDeleted", "==", false),
    orderBy("order", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ ...(doc.data() as Category), id: doc.id }));
}
