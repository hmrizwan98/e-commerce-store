import "server-only";
import { adminDb, serverTimestamp } from "../admin";
import { stripUndefined } from "./utils";
import type { BookDemoRequest } from "@/types/book-demo-request";

const COLLECTION = "bookDemoRequests";

export interface CreateBookDemoRequestInput {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  storeType?: string;
  message?: string;
}

/**
 * Genuinely tenant-independent - no tenantCollection()/getCurrentTenant() call at
 * all. Writes only; no admin UI reads this yet (that would start the CRM
 * integration this task explicitly doesn't build) - see BookDemoRequest's doc comment.
 */
export async function createBookDemoRequest(input: CreateBookDemoRequestInput): Promise<string> {
  const ref = adminDb().collection(COLLECTION).doc();
  await ref.set({
    ...stripUndefined(input),
    status: "new" satisfies BookDemoRequest["status"],
    crmSynced: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
