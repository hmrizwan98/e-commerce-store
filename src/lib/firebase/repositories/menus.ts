import "server-only";
import { tenantCollection } from "../tenant-scope";
import type { Menu, NavItem } from "@/types/nav";

const COLLECTION = "menus";

export async function getMenu(id: "header" | "footer"): Promise<NavItem[]> {
  const snap = await (await tenantCollection(COLLECTION)).doc(id).get();
  if (!snap.exists) return [];
  const data = snap.data() as Menu | undefined;
  return data?.items ?? [];
}

/** Like getMenu, but `null` when the store has never saved this menu - so the storefront can
 * tell "never set up" (show the starter menu) from "deliberately emptied" (show nothing). */
export async function getMenuOrNull(id: "header" | "footer"): Promise<NavItem[] | null> {
  const snap = await (await tenantCollection(COLLECTION)).doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data() as Menu | undefined;
  return data?.items ?? [];
}
