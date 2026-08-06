"use server";

import { revalidatePath } from "next/cache";
import { adminDb, serverTimestamp } from "@/lib/firebase/admin";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { requireAdmin } from "@/lib/firebase/require-admin";
import { stripUndefined } from "@/lib/firebase/repositories/utils";
import { getTestimonialById } from "@/lib/firebase/repositories/testimonials";
import { deleteImagesByUrls, diffRemovedImages } from "@/lib/images/cleanup";

export interface TestimonialFormInput {
  clientName: string;
  content: string;
  rating?: number;
  image?: string;
  designation?: string;
  company?: string;
  country?: string;
  order: number;
  isActive: boolean;
}

function revalidateStorefront() {
  revalidatePath("/admin/testimonials");
  revalidatePath("/", "layout");
  revalidatePath("/about");
}

export async function createTestimonial(input: TestimonialFormInput): Promise<string> {
  await requireAdmin();
  const ref = (await tenantCollection("testimonials")).doc();
  await ref.set({ ...stripUndefined(input), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  revalidateStorefront();
  return ref.id;
}

export async function updateTestimonial(id: string, input: TestimonialFormInput): Promise<void> {
  await requireAdmin();
  const before = await getTestimonialById(id);

  await (await tenantCollection("testimonials")).doc(id).update({ ...stripUndefined(input), updatedAt: serverTimestamp() });
  revalidateStorefront();

  await deleteImagesByUrls(diffRemovedImages([before?.image], [input.image]));
}

export async function deleteTestimonial(id: string): Promise<void> {
  await requireAdmin();
  const testimonial = await getTestimonialById(id);
  await (await tenantCollection("testimonials")).doc(id).delete();
  revalidateStorefront();
  await deleteImagesByUrls([testimonial?.image]);
}

export async function duplicateTestimonial(id: string): Promise<string> {
  await requireAdmin();
  const testimonial = await getTestimonialById(id);
  if (!testimonial) throw new Error("Testimonial not found");
  const ref = (await tenantCollection("testimonials")).doc();
  await ref.set({
    ...stripUndefined({
      clientName: `${testimonial.clientName} (copy)`,
      content: testimonial.content,
      rating: testimonial.rating,
      image: testimonial.image,
      designation: testimonial.designation,
      company: testimonial.company,
      country: testimonial.country,
      order: testimonial.order + 1,
      isActive: false,
    }),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  revalidateStorefront();
  return ref.id;
}

export async function setTestimonialActive(id: string, isActive: boolean): Promise<void> {
  await requireAdmin();
  await (await tenantCollection("testimonials")).doc(id).update({ isActive, updatedAt: serverTimestamp() });
  revalidateStorefront();
}

export async function reorderTestimonials(orderedIds: string[]): Promise<void> {
  await requireAdmin();
  const testimonials = await tenantCollection("testimonials");
  const batch = adminDb().batch();
  orderedIds.forEach((id, index) => {
    batch.update(testimonials.doc(id), { order: index, updatedAt: serverTimestamp() });
  });
  await batch.commit();
  revalidateStorefront();
}
