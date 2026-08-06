"use server";

import { revalidatePath } from "next/cache";
import { serverTimestamp } from "@/lib/firebase/admin";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined } from "@/lib/firebase/repositories/utils";

export interface AnnouncementBarFormInput {
  title: string;
  subtitle?: string;
  textColor: string;
  backgroundColor: string;
  buttonText?: string;
  buttonHref?: string;
  autoScroll: boolean;
  isClosable: boolean;
  showOnDesktop: boolean;
  showOnMobile: boolean;
  startDate?: number | null;
  endDate?: number | null;
  priority: number;
  isActive: boolean;
  order: number;
}

function revalidateStorefront() {
  revalidatePath("/admin/announcements");
  revalidatePath("/", "layout");
}

export async function createAnnouncementBar(input: AnnouncementBarFormInput): Promise<string> {
  await requireAdmin();
  const ref = (await tenantCollection("announcementBars")).doc();
  await ref.set({ ...stripUndefined(input), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  revalidateStorefront();
  return ref.id;
}

export async function updateAnnouncementBar(id: string, input: AnnouncementBarFormInput): Promise<void> {
  await requireAdmin();
  await (await tenantCollection("announcementBars"))
    .doc(id)
    .update({ ...stripUndefined(input), updatedAt: serverTimestamp() });
  revalidateStorefront();
}

export async function deleteAnnouncementBar(id: string): Promise<void> {
  await requireAdmin();
  await (await tenantCollection("announcementBars")).doc(id).delete();
  revalidateStorefront();
}
