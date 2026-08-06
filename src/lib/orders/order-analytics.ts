/** Order Analytics metadata - pure calculations kept out of Firestore, mirroring
 * inventory-math.ts's style. All derived from fields already on Order, so storing them
 * would just be denormalized state that goes stale on every status/shipment update. */

import type { Order } from "@/types/order";

const HOUR_MS = 60 * 60 * 1000;

export function getOrderAgeHours(order: Order): number | null {
  if (!order.createdAt) return null;
  return (Date.now() - order.createdAt) / HOUR_MS;
}

export function getFulfillmentDurationHours(order: Order): number | null {
  if (!order.dispatchDate || !order.createdAt) return null;
  return (order.dispatchDate - order.createdAt) / HOUR_MS;
}

export function getDeliveryDurationHours(order: Order): number | null {
  if (!order.deliveryDate || !order.dispatchDate) return null;
  return (order.deliveryDate - order.dispatchDate) / HOUR_MS;
}

const OPEN_STATUSES = new Set(["pending", "confirmed", "processing"]);

export function isOrderStale(order: Order, thresholdHours = 48): boolean {
  if (!OPEN_STATUSES.has(order.orderStatus)) return false;
  const age = getOrderAgeHours(order);
  return age !== null && age > thresholdHours;
}
