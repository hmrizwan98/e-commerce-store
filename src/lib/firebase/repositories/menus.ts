import "server-only";
import { adminDb } from "../admin";
import type { Menu, NavItem } from "@/types/nav";

const COLLECTION = "menus";

export async function getMenu(id: "header" | "footer"): Promise<NavItem[]> {
  const snap = await adminDb().collection(COLLECTION).doc(id).get();
  if (!snap.exists) return [];
  const data = snap.data() as Menu | undefined;
  return data?.items ?? [];
}
