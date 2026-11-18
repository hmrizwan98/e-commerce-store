import { normalizePhone } from "@/lib/orders/verification/phone";
import type { Order } from "@/types/order";

/** Order number + the email OR phone given at checkout. Phones are compared after
 * normalization (0300-1234567 == +92 300 1234567); unparseable numbers fall back to a
 * digits-only comparison, and need at least 7 digits so a short guess can't match.
 * Shared by order tracking and payment-proof upload (the customer's only "credential"). */
export function orderMatchesContact(order: Pick<Order, "guestEmail" | "shippingAddress">, contact: string): boolean {
  const c = contact.trim();
  if (!c) return false;
  if (c.includes("@")) {
    return !!order.guestEmail && order.guestEmail.trim().toLowerCase() === c.toLowerCase();
  }
  const orderPhone = order.shippingAddress?.phone ?? "";
  const a = normalizePhone(c);
  const b = normalizePhone(orderPhone);
  if (a.isValid && b.isValid) return a.digits === b.digits;
  const digitsA = c.replace(/\D/g, "");
  return digitsA.length >= 7 && digitsA === orderPhone.replace(/\D/g, "");
}
