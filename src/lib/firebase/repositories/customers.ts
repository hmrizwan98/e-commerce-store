import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import type { DocumentSnapshot, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { docData, stripUndefined } from "./utils";
import { safeQuery } from "./safe-query";
import { searchAdminOrders, getOrdersByGuestEmail } from "./orders";
import type { Customer } from "@/types/customer";

const COLLECTION = "customers";

/** Customer's own identity field is `uid`, not `id` - docData() only knows how to
 * inject `id`, so this reuses its timestamp-conversion logic and remaps. */
function customerDocData(snap: DocumentSnapshot | QueryDocumentSnapshot): Customer | null {
  const data = docData<Omit<Customer, "uid"> & { id: string }>(snap);
  if (!data) return null;
  const { id, ...rest } = data;
  return { ...rest, uid: id };
}

export async function getCustomers(limit = 50): Promise<Customer[]> {
  return safeQuery("getCustomers", [], async () => {
    const col = await tenantCollection(COLLECTION);
    const snap = await col
      .where("role", "==", "customer")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snap.docs
      .map((doc) => customerDocData(doc))
      .filter((c): c is Customer => c !== null);
  });
}

export async function getCustomerById(uid: string): Promise<Customer | null> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc(uid).get();
  return customerDocData(doc);
}

export async function getCustomerAddresses(uid: string) {
  const col = await tenantCollection(COLLECTION);
  const snap = await col.doc(uid).collection("addresses").get();
  return snap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

export async function getCustomerCount(): Promise<number> {
  const col = await tenantCollection(COLLECTION);
  const snap = await col
    .where("role", "==", "customer")
    .count()
    .get();
  return snap.data().count;
}

// --- Customer CRM (additive) ---

const GUEST_ROUTE_PREFIX = "guest-";

/** Route/doc-id convention for a not-yet-materialized guest customer - the
 * admin route id before any Firestore doc exists for them. */
export function guestRouteId(email: string): string {
  return `${GUEST_ROUTE_PREFIX}${encodeURIComponent(email)}`;
}

export function isGuestRouteId(id: string): boolean {
  return id.startsWith(GUEST_ROUTE_PREFIX);
}

export function guestEmailFromRouteId(id: string): string {
  return decodeURIComponent(id.slice(GUEST_ROUTE_PREFIX.length));
}

export interface GuestCustomer {
  uid: string; // guestRouteId(email) - matches the admin route convention above
  email: string;
  displayName?: string;
  status: "guest";
  createdAt?: number; // earliest order's createdAt
  orderCount: number;
  totalSpend: number;
}

/**
 * Derives virtual guest-customer rows from recent orders (bounded scan via
 * searchAdminOrders, same trade-off already accepted by getOrderStats
 * elsewhere) - grouped by guestEmail, never stored. orderCount/totalSpend are
 * tallied from this same scan (no extra per-guest query). A guest only gets a
 * real Firestore doc the first time an admin acts on them (see getOrCreateCustomerDoc).
 */
export async function getGuestCustomers(scanLimit = 200): Promise<GuestCustomer[]> {
  const { orders } = await searchAdminOrders({ pageSize: scanLimit });
  const byEmail = new Map<string, GuestCustomer>();
  for (const order of orders) {
    if (order.userId || !order.guestEmail) continue;
    const netTotal = order.total - (order.refundAmount ?? 0);
    const existing = byEmail.get(order.guestEmail);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpend += netTotal;
      if ((order.createdAt ?? 0) < (existing.createdAt ?? 0)) existing.createdAt = order.createdAt;
    } else {
      byEmail.set(order.guestEmail, {
        uid: guestRouteId(order.guestEmail),
        email: order.guestEmail,
        displayName: order.guestName,
        status: "guest",
        createdAt: order.createdAt,
        orderCount: 1,
        totalSpend: netTotal,
      });
    }
  }
  return Array.from(byEmail.values());
}

/**
 * Fetch-or-lazily-create - every mutating CRM action (tags/notes/status/GDPR)
 * goes through this so guest materialization logic isn't duplicated per action.
 * A guest's Firestore doc id is its own email (stable, deterministic - matches
 * the id the admin route decodes from guestRouteId()); its displayName is
 * self-resolved from that guest's own orders, no fallback needed from the caller.
 * A non-guest routeId is expected to already exist (real customers only ever
 * reach an action via a route/list that already found their doc) - throws if not.
 */
export async function getOrCreateCustomerDoc(routeId: string): Promise<Customer> {
  if (!isGuestRouteId(routeId)) {
    const existing = await getCustomerById(routeId);
    if (!existing) throw new Error("Customer not found.");
    return existing;
  }

  const email = guestEmailFromRouteId(routeId);
  const existing = await getCustomerById(email);
  if (existing) return existing;

  const guestOrders = await getOrdersByGuestEmail(email);
  const created: Customer = {
    uid: email,
    email,
    displayName: guestOrders[0]?.guestName,
    role: "customer",
    status: "guest",
  };
  const col = await tenantCollection(COLLECTION);
  await col.doc(email).set(stripUndefined({ ...created, createdAt: FieldValue.serverTimestamp() }));
  return created;
}

export interface ResolvedCustomer {
  customer: Customer;
  materialized: boolean; // false = virtual, no Firestore doc exists yet
}

/**
 * Read-only id resolution (never writes) - the detail page's counterpart to
 * getOrCreateCustomerDoc, which writes on first mutation. Returns null if the
 * id doesn't resolve to a real customer or any guest order at all.
 */
export async function resolveCustomerForDisplay(routeId: string): Promise<ResolvedCustomer | null> {
  if (!isGuestRouteId(routeId)) {
    const existing = await getCustomerById(routeId);
    return existing ? { customer: existing, materialized: true } : null;
  }

  const email = guestEmailFromRouteId(routeId);
  const existing = await getCustomerById(email);
  if (existing) return { customer: existing, materialized: true };

  const guestOrders = await getOrdersByGuestEmail(email);
  if (!guestOrders.length) return null;
  const earliestCreatedAt = guestOrders.reduce<number | undefined>(
    (earliest, o) => (o.createdAt && (!earliest || o.createdAt < earliest) ? o.createdAt : earliest),
    undefined
  );
  const virtual: Customer = {
    uid: email,
    email,
    displayName: guestOrders[0]?.guestName,
    role: "customer",
    status: "guest",
    createdAt: earliestCreatedAt,
  };
  return { customer: virtual, materialized: false };
}
