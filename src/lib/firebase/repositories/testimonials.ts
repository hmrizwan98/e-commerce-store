import "server-only";
import { adminDb } from "../admin";
import { docData } from "./utils";
import type { Testimonial } from "@/types/testimonial";

const COLLECTION = "testimonials";

export async function getActiveTestimonials(): Promise<Testimonial[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("isActive", "==", true)
    .orderBy("order", "asc")
    .get();
  return snap.docs
    .map((doc) => docData<Testimonial>(doc))
    .filter((t): t is Testimonial => t !== null);
}

// --- Admin ---

export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  return docData<Testimonial>(doc);
}

export async function getAllTestimonialsForAdmin(): Promise<Testimonial[]> {
  const snap = await adminDb().collection(COLLECTION).orderBy("order", "asc").get();
  return snap.docs
    .map((doc) => docData<Testimonial>(doc))
    .filter((t): t is Testimonial => t !== null);
}
