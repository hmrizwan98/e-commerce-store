"use server";

import { revalidatePath } from "next/cache";
import { adminDb, serverTimestamp } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/firebase/require-admin";

export interface FaqFormInput {
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

function revalidateStorefront() {
  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
}

export async function createFaq(input: FaqFormInput): Promise<string> {
  await requireAdmin();
  const ref = adminDb().collection("faqs").doc();
  await ref.set({ ...input, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  revalidateStorefront();
  return ref.id;
}

export async function updateFaq(id: string, input: FaqFormInput): Promise<void> {
  await requireAdmin();
  await adminDb().collection("faqs").doc(id).update({ ...input, updatedAt: serverTimestamp() });
  revalidateStorefront();
}

export async function deleteFaq(id: string): Promise<void> {
  await requireAdmin();
  await adminDb().collection("faqs").doc(id).delete();
  revalidateStorefront();
}
