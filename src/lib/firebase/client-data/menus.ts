import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { Menu, NavItem } from "@/types/nav";

export async function fetchMenu(id: "header" | "footer"): Promise<NavItem[]> {
  const snap = await getDoc(doc(getFirebaseDb(), "menus", id));
  if (!snap.exists()) return [];
  const data = snap.data() as Menu;
  return data.items ?? [];
}
