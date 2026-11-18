"use server";

import { headers } from "next/headers";
import { adminDb, serverTimestamp } from "@/lib/firebase/admin";
import { getCurrentTenant } from "@/lib/tenant/current";
import { checkRateLimit } from "@/lib/firebase/rate-limit";
import { validateContactInput } from "@/lib/contact/contact-message";

export interface ContactFormInput {
  name: string;
  email: string;
  message: string;
}

export async function submitContactForm(input: ContactFormInput): Promise<{ ok: boolean; message: string }> {
  const check = validateContactInput(input ?? {});
  if (!check.ok) return { ok: false, message: check.error };

  const tenant = await getCurrentTenant();
  const h = headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "anonymous";
  const rate = await checkRateLimit("contact", `${tenant?.id || "platform"}:${ip}`);
  if (!rate.allowed) return { ok: false, message: "Too many messages - please try again a little later." };

  // Shown to this store's admins in Admin → Messages (unread until opened).
  await adminDb().collection("contactSubmissions").add({
    ...(tenant ? { storeId: tenant.id } : {}),
    ...check.value,
    read: false,
    createdAt: serverTimestamp(),
  });

  return { ok: true, message: "Thanks for reaching out! We'll get back to you soon." };
}
