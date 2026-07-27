"use client";

import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { Product } from "@/types/product";

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  const db = getFirebaseDb();
  const docs = await Promise.all(ids.map((id) => getDoc(doc(db, "products", id))));
  return docs
    .filter((d) => d.exists())
    .map((d) => ({ ...(d.data() as Product), id: d.id }))
    .filter((p) => !p.isDeleted && p.status === "active");
}
