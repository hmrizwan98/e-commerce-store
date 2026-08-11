import "server-only";
import { cookies, headers } from "next/headers";
import { AggregateField, FieldPath, Timestamp } from "firebase-admin/firestore";
import { adminDb, adminAuth, serverTimestamp } from "../admin";
import { tenantCollection } from "@/lib/firebase/tenant-scope";
import { docData, stripUndefined } from "./utils";
import { safeQuery } from "./safe-query";
import { computeOrderTotals } from "@/lib/checkout/totals";
import { getShippingSettings, getGeneralSettings, getPaymentSettings } from "./site-settings";
import type { Order, OrderItem, OrderAddress, OrderStatus, PaymentMethod, PaymentStatus, ReturnStatus } from "@/types/order";

/**
 * Derives and verifies the authenticated customer's UID from the server context
 * (session cookies or Bearer auth header). Returns verified string UID, or undefined for guest checkouts.
 */
async function getAuthenticatedUserId(): Promise<string | undefined> {
  try {
    const sessionCookie =
      cookies().get("session")?.value ||
      cookies().get("user_session")?.value ||
      cookies().get("customer_session")?.value;
    if (sessionCookie) {
      const decoded = await adminAuth().verifySessionCookie(sessionCookie, true);
      if (decoded?.uid) return decoded.uid;
    }
    const authHeader = headers().get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const idToken = authHeader.split("Bearer ")[1]?.trim();
      if (idToken) {
        const decoded = await adminAuth().verifyIdToken(idToken);
        if (decoded?.uid) return decoded.uid;
      }
    }
  } catch {
    // Guest checkout fallback
  }
  return undefined;
}

const COLLECTION = "orders";

// Advanced Filters - status/paymentStatus/returnStatus stay mutually exclusive
// equality filters (each paired with the existing orderStatus+createdAt-shaped
// composite index) rather than combining, which would need its own new index.
export interface AdminOrdersCursor {
  /** createdAt (millis) for the default/filtered branch, orderNumber for the search
   * branch - whichever field that branch actually sorts by. */
  value: number | string;
  id: string;
}

export interface AdminOrderSearchParams {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  returnStatus?: ReturnStatus;
  dateFrom?: number;
  dateTo?: number;
  search?: string;
  pageSize?: number;
  startAfter?: AdminOrdersCursor;
}

export interface AdminOrderSearchResult {
  orders: Order[];
  total: number;
  hasMore: boolean;
}

/**
 * Cursor-paginated - startAfter(...) + limit(pageSize+1), never offset(). The two
 * mutually-exclusive branches (search vs filtered/default) sort by different fields
 * (orderNumber asc vs createdAt desc), so the cursor's `value` means whichever field
 * that branch actually orders by. Both branches add an explicit document-ID tiebreaker
 * (matching each branch's own sort direction) since neither orderNumber (timestamp-
 * derived, ties possible under concurrent checkouts) nor createdAt (a Firestore
 * Timestamp) is provably unique - Firestore already appends `__name__` as an implicit
 * final index component to every query, so this doesn't change what the existing
 * indexes already support (verified empirically). `total` still comes from the same
 * `.count()` aggregation this function already used - not a new/duplicate query - since
 * the existing "Orders (N)" heading already displays it.
 */
export async function searchAdminOrders(
  params: AdminOrderSearchParams
): Promise<AdminOrderSearchResult> {
  const pageSize = params.pageSize ?? 20;

  const ordersCol = await tenantCollection(COLLECTION);
  let baseQuery: FirebaseFirestore.Query = ordersCol;
  const isSearch = !!params.search;

  if (params.search) {
    // Order-number prefix match - the range field and orderBy field are the
    // same, so this needs no new composite index.
    const q = params.search.trim();
    baseQuery = baseQuery
      .where("orderNumber", ">=", q)
      .where("orderNumber", "<=", q + "")
      .orderBy("orderNumber", "asc")
      .orderBy(FieldPath.documentId(), "asc");
  } else {
    if (params.status) {
      baseQuery = baseQuery.where("orderStatus", "==", params.status);
    } else if (params.paymentStatus) {
      baseQuery = baseQuery.where("paymentStatus", "==", params.paymentStatus);
    } else if (params.returnStatus) {
      baseQuery = baseQuery.where("returnStatus", "==", params.returnStatus);
    }
    if (params.dateFrom) {
      baseQuery = baseQuery.where("createdAt", ">=", Timestamp.fromMillis(params.dateFrom));
    }
    if (params.dateTo) {
      baseQuery = baseQuery.where("createdAt", "<=", Timestamp.fromMillis(params.dateTo));
    }
    baseQuery = baseQuery.orderBy("createdAt", "desc").orderBy(FieldPath.documentId(), "desc");
  }

  return safeQuery("searchAdminOrders", { orders: [], total: 0, hasMore: false }, async () => {
    const countSnap = await baseQuery.count().get();
    const total = countSnap.data().count;

    let pageQuery = baseQuery;
    if (params.startAfter) {
      const cursorValue = isSearch
        ? params.startAfter.value
        : Timestamp.fromMillis(params.startAfter.value as number);
      pageQuery = pageQuery.startAfter(cursorValue, params.startAfter.id);
    }

    const snap = await pageQuery.limit(pageSize + 1).get();
    const orders = snap.docs
      .slice(0, pageSize)
      .map((doc) => docData<Order>(doc))
      .filter((o): o is Order => o !== null);

    return { orders, total, hasMore: snap.docs.length > pageSize };
  });
}

export async function getOrderById(id: string): Promise<Order | null> {
  const col = await tenantCollection(COLLECTION);
  const doc = await col.doc(id).get();
  return docData<Order>(doc);
}

export async function getOrderByOrderNumber(orderNumber: string): Promise<Order | null> {
  const col = await tenantCollection(COLLECTION);
  const snap = await col
    .where("orderNumber", "==", orderNumber)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return docData<Order>(snap.docs[0]);
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  return safeQuery("getOrdersByUserId", [], async () => {
    const col = await tenantCollection(COLLECTION);
    const snap = await col
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs
      .map((doc) => docData<Order>(doc))
      .filter((o): o is Order => o !== null);
  });
}

/** Read-only - for the Customer CRM to attribute guest-checkout orders to a
 * virtual customer row. Not part of the order lifecycle/workflow. */
export async function getOrdersByGuestEmail(email: string): Promise<Order[]> {
  return safeQuery("getOrdersByGuestEmail", [], async () => {
    const col = await tenantCollection(COLLECTION);
    const snap = await col
      .where("guestEmail", "==", email)
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs
      .map((doc) => docData<Order>(doc))
      .filter((o): o is Order => o !== null);
  });
}

export interface CreateGuestOrderInput {
  items: { productId: string; variantId?: string; quantity: number }[];
  guestName: string;
  guestEmail: string;
  shippingAddress: OrderAddress;
  paymentMethod: PaymentMethod;
  paymentTransactionRef?: string;
  userId?: string;
  idempotencyKey?: string;
}

export interface CreateGuestOrderResult {
  orderId: string;
  orderNumber: string;
}

import { checkRateLimit } from "@/lib/firebase/rate-limit";
import { getCurrentTenant } from "@/lib/tenant/current";

/**
 * Re-validates price/stock server-side from Firestore (never trusts the
 * client-submitted cart) and atomically decrements stock alongside creating
 * the order, so a race between two checkouts can't oversell inventory.
 *
 * Atomically checks `idempotencyKey` inside the transaction to ensure concurrent
 * identical checkout attempts return the exact same created order result without
 * creating duplicate orders or double-decrementing stock.
 *
 * If an authenticated customer context exists, their verified UID is automatically
 * associated with the created order document (userId).
 */
export async function createGuestOrder(input: CreateGuestOrderInput): Promise<CreateGuestOrderResult> {
  if (!input.items.length) throw new Error("Your cart is empty.");

  const verifiedUserId = await getAuthenticatedUserId();
  const reqHeaders = headers();
  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() || reqHeaders.get("x-real-ip") || "anonymous";
  const tenant = await getCurrentTenant();
  const rateLimitKey = `${tenant?.id || "default"}:${verifiedUserId || ip}`;
  const rateCheck = await checkRateLimit("checkout", rateLimitKey);
  if (!rateCheck.allowed) {
    throw new Error("Too many checkout attempts. Please try again in a few minutes.");
  }

  const paymentSettings = await getPaymentSettings();
  const methodEnabled =
    input.paymentMethod === "bank_transfer"
      ? paymentSettings.bankTransfer.enabled
      : paymentSettings[input.paymentMethod].enabled;
  if (!methodEnabled) throw new Error("The selected payment method is not available.");

  const [shipping, general] = await Promise.all([getShippingSettings(), getGeneralSettings()]);

  const db = adminDb();
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

  const ordersCol = await tenantCollection(COLLECTION);
  const productsCol = await tenantCollection("products");

  const idempotencyKey = input.idempotencyKey?.trim();
  const idempotencyCol = await tenantCollection("idempotencyKeys");
  const idempotencyRef = idempotencyKey ? idempotencyCol.doc(idempotencyKey) : null;

  const result = await db.runTransaction(async (tx) => {
    if (idempotencyRef) {
      const idempotencyDoc = await tx.get(idempotencyRef);
      if (idempotencyDoc.exists) {
        const data = idempotencyDoc.data();
        if (data?.orderId && data?.orderNumber) {
          return { orderId: data.orderId as string, orderNumber: data.orderNumber as string };
        }
      }
    }

    const productRefs = input.items.map((i) => productsCol.doc(i.productId));
    const variantRefs = input.items.map((item, idx) =>
      item.variantId ? productRefs[idx].collection("variants").doc(item.variantId) : null
    );

    const [productDocs, variantDocs] = await Promise.all([
      Promise.all(productRefs.map((ref) => tx.get(ref))),
      Promise.all(variantRefs.map((ref) => (ref ? tx.get(ref) : Promise.resolve(null)))),
    ]);

    const orderItems: OrderItem[] = [];
    const stockUpdates: { ref: FirebaseFirestore.DocumentReference; newStock: number }[] = [];
    let subtotal = 0;

    for (let idx = 0; idx < input.items.length; idx++) {
      const reqItem = input.items[idx];
      if (!Number.isInteger(reqItem.quantity) || reqItem.quantity < 1) {
        throw new Error("Item quantity must be a positive whole number.");
      }
      const doc = productDocs[idx];
      if (!doc.exists) throw new Error("One of the items in your cart is no longer available.");
      const product = doc.data()!;
      if (product.isDeleted || product.status !== "active") {
        throw new Error(`"${product.name}" is no longer available.`);
      }

      let unitPrice: number = product.price;
      let availableStock: number = product.stock;
      let stockRef = productRefs[idx];

      const variantDoc = variantDocs[idx];
      if (reqItem.variantId) {
        if (!variantDoc || !variantDoc.exists) {
          throw new Error(`"${product.name}"'s selected option is no longer available.`);
        }
        const variant = variantDoc.data()!;
        unitPrice = variant.price ?? product.price;
        availableStock = variant.stock;
        stockRef = variantDoc.ref;
      }

      if (product.trackInventory && availableStock < reqItem.quantity) {
        throw new Error(`Only ${availableStock} of "${product.name}" left in stock.`);
      }

      const lineTotal = Math.round(unitPrice * reqItem.quantity * 100) / 100;
      subtotal += lineTotal;

      orderItems.push({
        productId: reqItem.productId,
        variantId: reqItem.variantId,
        name: product.name,
        image: product.images?.[0],
        sku: product.sku,
        unitPrice,
        quantity: reqItem.quantity,
        lineTotal,
      });

      if (product.trackInventory) {
        stockUpdates.push({ ref: stockRef, newStock: availableStock - reqItem.quantity });
      }
    }

    const totals = computeOrderTotals({
      subtotal,
      shippingFlatRate: shipping.flatRate,
      freeShippingThreshold: shipping.freeShippingThreshold,
      taxRatePercent: general.taxRatePercent,
      taxInclusive: general.taxInclusive,
    });

    const orderRef = ordersCol.doc();
    const now = Date.now();

    stockUpdates.forEach(({ ref, newStock }) => tx.update(ref, { stock: newStock }));
    tx.set(orderRef, {
      ...stripUndefined({
        orderNumber,
        userId: verifiedUserId,
        guestEmail: input.guestEmail.trim(),
        guestName: input.guestName.trim(),
        items: orderItems,
        subtotal: totals.subtotal,
        shippingCost: totals.shippingCost,
        tax: totals.tax,
        total: totals.total,
        shippingAddress: input.shippingAddress,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === "cod" ? "unpaid" : "proof_submitted",
        paymentTransactionRef: input.paymentTransactionRef || undefined,
        orderStatus: "pending",
        statusHistory: [{ status: "pending", at: now }],
      }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (idempotencyRef) {
      tx.set(idempotencyRef, {
        orderId: orderRef.id,
        orderNumber,
        createdAt: serverTimestamp(),
      });
    }

    return { orderId: orderRef.id, orderNumber };
  });

  return result;
}

/**
 * Computed entirely via Firestore's native count()/sum() aggregation queries instead
 * of transferring and reducing every order document - each of the three numbers below
 * is the exact same value the old full-scan-then-reduce implementation produced
 * (totalOrders = count of all order docs, totalRevenue = sum of `total` where
 * paymentStatus=="paid", pendingOrders = count where orderStatus=="pending"), just
 * computed server-side instead of document-by-document in memory.
 */
export async function getOrderStats(): Promise<{
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}> {
  const col = await tenantCollection(COLLECTION);
  const [totalSnap, revenueSnap, pendingSnap] = await Promise.all([
    col.count().get(),
    col
      .where("paymentStatus", "==", "paid")
      .aggregate({ totalRevenue: AggregateField.sum("total") })
      .get(),
    col.where("orderStatus", "==", "pending").count().get(),
  ]);
  return {
    totalOrders: totalSnap.data().count,
    totalRevenue: revenueSnap.data().totalRevenue,
    pendingOrders: pendingSnap.data().count,
  };
}

export interface TopSellingProduct {
  productId: string;
  name: string;
  quantitySold: number;
  revenue: number;
}

/**
 * Firestore aggregation queries (count()/sum()/average()) have no "group by" -
 * they can only reduce a whole query result to a single scalar, not a per-product
 * breakdown - so a per-product tally still requires reading order documents (unlike
 * getOrderStats above, which was converted to pure aggregation). `.select()` limits
 * each transferred document to only the two fields actually read below
 * (orderStatus, items), cutting payload/deserialization cost without changing which
 * orders are read or how they're reduced - a genuine per-product rollup would need a
 * denormalized aggregate doc, which is a schema change out of this phase's scope.
 */
export async function getTopSellingProducts(limit = 5): Promise<TopSellingProduct[]> {
  const col = await tenantCollection(COLLECTION);
  const snap = await col.select("orderStatus", "items").get();
  const byProduct = new Map<string, TopSellingProduct>();

  snap.docs.forEach((doc) => {
    const order = docData<Order>(doc);
    if (!order || order.orderStatus === "cancelled") return;
    order.items.forEach((item) => {
      const existing = byProduct.get(item.productId);
      if (existing) {
        existing.quantitySold += item.quantity;
        existing.revenue += item.lineTotal;
      } else {
        byProduct.set(item.productId, {
          productId: item.productId,
          name: item.name,
          quantitySold: item.quantity,
          revenue: item.lineTotal,
        });
      }
    });
  });

  return Array.from(byProduct.values())
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, limit);
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
}

export async function getRevenueTrend(days = 14): Promise<RevenueTrendPoint[]> {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  const col = await tenantCollection(COLLECTION);
  const snap = await col
    .where("paymentStatus", "==", "paid")
    .where("createdAt", ">=", since)
    .orderBy("createdAt", "desc")
    .select("createdAt", "total")
    .get();


  const byDay = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }

  snap.docs.forEach((doc) => {
    const order = docData<Order>(doc);
    if (!order?.createdAt) return;
    const key = new Date(order.createdAt).toISOString().slice(0, 10);
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + order.total);
  });

  return Array.from(byDay.entries()).map(([date, revenue]) => ({ date, revenue }));
}
