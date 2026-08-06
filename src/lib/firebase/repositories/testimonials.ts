import "server-only";
import { tenantCollection } from "../tenant-scope";
import { docData } from "./utils";
import { safeQuery } from "./safe-query";
import type { Testimonial } from "@/types/testimonial";

const COLLECTION = "testimonials";

export async function getActiveTestimonials(): Promise<Testimonial[]> {
  return safeQuery("getActiveTestimonials", [], async () => {
    const snap = await (await tenantCollection(COLLECTION))
      .where("isActive", "==", true)
      .orderBy("order", "asc")
      .get();
    return snap.docs
      .map((doc) => docData<Testimonial>(doc))
      .filter((t): t is Testimonial => t !== null);
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
