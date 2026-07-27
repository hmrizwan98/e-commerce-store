"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined } from "@/lib/firebase/repositories/utils";
import type { NavItem } from "@/types/nav";

export async function updateMenu(id: "header" | "footer", items: NavItem[]): Promise<void> {
  await requireAdmin();
  await adminDb()
    .collection("menus")
    .doc(id)
    .set({ id, items: stripUndefined(items), updatedAt: FieldValue.serverTimestamp() });
  revalidatePath("/admin/menus");
  revalidatePath("/", "layout");
}
