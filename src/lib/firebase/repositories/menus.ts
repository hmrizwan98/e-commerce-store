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
