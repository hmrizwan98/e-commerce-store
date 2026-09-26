import type { OrderStatus } from "@/types/order";

/** Single source of truth for which order-status transitions are valid, shared by the
 * server action that enforces it (orders/actions.ts) and the admin UI that should only
 * ever let an admin pick a transition that will actually succeed (OrderActions.tsx) -
 * previously the dropdown listed all 8 statuses regardless of this table, so picking an
 * unreachable one (e.g. "Refunded", which nothing ever transitions into here - that's the
 * separate initiateRefund flow) silently failed. */
export const ALLOWED_ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
  refunded: [],
};
