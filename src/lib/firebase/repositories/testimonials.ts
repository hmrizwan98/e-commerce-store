import "server-only";
import { tenantCollection } from "../tenant-scope";
import { docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { Testimonial } from "@/types/testimonial";
import { isPublicTestimonial } from "@/lib/testimonials/seed";
import { queryPublicTestimonials } from "./storefront-queries";
import { adminDb } from "../admin";
import { requireCurrentTenant } from "@/lib/tenant/current";

const COLLECTION = "testimonials";

export async function getActiveTestimonials(): Promise<Testimonial[]> {
  // Storefront: unchanged installer samples are never presented as real customers.
  const tenant = await requireCurrentTenant();
  return safeQuery("getActiveTestimonials", [], () => queryPublicTestimonials(adminDb(), tenant.id), []);
}

export async function getTestimonialsByIds(ids: string[]): Promise<Testimonial[]> {
  if (!ids || !ids.length) return [];
  return safeQuery("getTestimonialsByIds", [], async () => {
    const snap = await (await tenantCollection(COLLECTION))
      .where("isActive", "==", true)
      .get();

    const all = snap.docs
      .map((doc) => docData<Testimonial>(doc))
      .filter((t): t is Testimonial => t !== null && isPublicTestimonial(t));

    return ids
      .map((id) => all.find((t) => t.id === id))
      .filter((t): t is Testimonial => t !== undefined);
  });
}

// --- Admin ---

export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  const doc = await (await tenantCollection(COLLECTION)).doc(id).get();
  return docData<Testimonial>(doc);
}

export async function getAllTestimonialsForAdmin(): Promise<Testimonial[]> {
  const snap = await (await tenantCollection(COLLECTION)).orderBy("order", "asc").get();
  return snap.docs
    .map((doc) => docData<Testimonial>(doc))
    .filter((t): t is Testimonial => t !== null);
}
