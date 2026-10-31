import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { Menu, NavItem } from "@/types/nav";

/** `null` = this store never saved the menu (callers show the starter menu); `[]` = emptied on purpose. */
export async function fetchMenu(id: "header" | "footer", tenantId: string): Promise<NavItem[] | null> {
  const snap = await getDoc(doc(getFirebaseDb(), "stores", tenantId, "menus", id));
  if (!snap.exists()) return null;
  const data = snap.data() as Menu;
  return data.items ?? [];
}
