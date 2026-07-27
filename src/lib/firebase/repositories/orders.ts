import "server-only";
import { adminDb, serverTimestamp } from "../admin";
import { docData, stripUndefined } from "./utils";
import { computeOrderTotals } from "@/lib/checkout/totals";
import { getShippingSettings, getGeneralSettings, getPaymentSettings } from "./site-settings";
import type { Order, OrderItem, OrderAddress, OrderStatus, PaymentMethod } from "@/types/order";

const COLLECTION = "orders";

export interface AdminOrderSearchParams {
  status?: OrderStatus;
  page?: number;
  pageSize?: number;
}

export interface AdminOrderSearchResult {
  orders: Order[];
  total: number;
  totalPages: number;
}

export async function searchAdminOrders(
  params: AdminOrderSearchParams
): Promise<AdminOrderSearchResult> {
  const pageSize = params.pageSize ?? 20;
  const page = Math.max(1, params.page ?? 1);

  let query: FirebaseFirestore.Query = adminDb().collection(COLLECTION);
  if (params.status) {
    query = query.where("orderStatus", "==", params.status);
  }
  query = query.orderBy("createdAt", "desc");

  const countSnap = await query.count().get();
  const total = countSnap.data().count;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const snap = await query
    .offset((page - 1) * pageSize)
    .limit(pageSize)
    .get();

  const orders = snap.docs
    .map((doc) => docData<Order>(doc))
    .filter((o): o is Order => o !== null);

  return { orders, total, totalPages };
}

export async function getOrderById(id: string): Promise<Order | null> {
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  return docData<Order>(doc);
}

export async function getOrderByOrderNumber(orderNumber: string): Promise<Order | null> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("orderNumber", "==", orderNumber)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return docData<Order>(snap.docs[0]);
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs
    .map((doc) => docData<Order>(doc))
    .filter((o): o is Order => o !== null);
}

export interface CreateGuestOrderInput {
  items: { productId: string; variantId?: string; quantity: number }[];
  guestName: string;
  guestEmail: string;
  shippingAddress: OrderAddress;
  paymentMethod: PaymentMethod;
  paymentTransactionRef?: string;
}

export interface CreateGuestOrderResult {
  orderId: string;
  orderNumber: string;
}

/**
 * Re-validates price/stock server-side from Firestore (never trusts the
 * client-submitted cart) and atomically decrements stock alongside creating
 * the order, so a race between two checkouts can't oversell inventory.
 */
export async function createGuestOrder(input: CreateGuestOrderInput): Promise<CreateGuestOrderResult> {
  if (!input.items.length) throw new Error("Your cart is empty.");

  const paymentSettings = await getPaymentSettings();
  const methodEnabled =
    input.paymentMethod === "bank_transfer"
      ? paymentSettings.bankTransfer.enabled
      : paymentSettings[input.paymentMethod].enabled;
  if (!methodEnabled) throw new Error("The selected payment method is not available.");

  const [shipping, general] = await Promise.all([getShippingSettings(), getGeneralSettings()]);

  const db = adminDb();
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

  const result = await db.runTransaction(async (tx) => {
    const productRefs = input.items.map((i) => db.collection("products").doc(i.productId));
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

    const orderRef = db.collection(COLLECTION).doc();
    const now = Date.now();

    stockUpdates.forEach(({ ref, newStock }) => tx.update(ref, { stock: newStock }));
    tx.set(orderRef, {
      ...stripUndefined({
        orderNumber,
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

    return { orderId: orderRef.id, orderNumber };
  });

  return result;
}

export async function getOrderStats(): Promise<{
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}> {
  const snap = await adminDb().collection(COLLECTION).get();
  let totalRevenue = 0;
  let pendingOrders = 0;
  snap.docs.forEach((doc) => {
    const order = docData<Order>(doc);
    if (!order) return;
    if (order.paymentStatus === "paid") totalRevenue += order.total;
    if (order.orderStatus === "pending") pendingOrders += 1;
  });
  return { totalOrders: snap.size, totalRevenue, pendingOrders };
}

export interface TopSellingProduct {
  productId: string;
  name: string;
  quantitySold: number;
  revenue: number;
}

/**
 * No aggregate query exists for "sum of items across order docs" in
 * Firestore, so this tallies in memory - acceptable at this store's order
 * volume (same trade-off as getOrderStats above); revisit with a
 * denormalized rollup doc if the orders collection grows very large.
 */
export async function getTopSellingProducts(limit = 5): Promise<TopSellingProduct[]> {
  const snap = await adminDb().collection(COLLECTION).get();
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
  const snap = await adminDb()
    .collection(COLLECTION)
    .where("paymentStatus", "==", "paid")
    .get();

  const byDay = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }

  snap.docs.forEach((doc) => {
    const order = docData<Order>(doc);
    if (!order?.createdAt || order.createdAt < since) return;
    const key = new Date(order.createdAt).toISOString().slice(0, 10);
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + order.total);
  });

  return Array.from(byDay.entries()).map(([date, revenue]) => ({ date, revenue }));
}
