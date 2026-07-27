import "server-only";
import { adminDb } from "../admin";
import { docData } from "./utils";
import type { Customer } from "@/types/customer";

const COLLECTION = "users";

export async function getCustomers(limit = 50): Promise<Customer[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("role", "==", "customer")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snap.docs
    .map((doc) => ({ ...(doc.data() as Customer), uid: doc.id }))
    .filter((c): c is Customer => Boolean(c));
}

export async function getCustomerById(uid: string): Promise<Customer | null> {
  const doc = await adminDb().collection(COLLECTION).doc(uid).get();
  if (!doc.exists) return null;
  return { ...(doc.data() as Customer), uid: doc.id };
}

export async function getCustomerAddresses(uid: string) {
  const snap = await adminDb()
    .collection(COLLECTION)
    .doc(uid)
    .collection("addresses")
    .get();
  return snap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

export async function getCustomerCount(): Promise<number> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("role", "==", "customer")
    .count()
    .get();
  return snap.data().count;
}
