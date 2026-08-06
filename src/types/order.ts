export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "cod" | "bank_transfer" | "jazzcash";
export type PaymentStatus = "unpaid" | "proof_submitted" | "paid" | "failed" | "refunded";

export interface OrderItem {
  productId: string;
  variantId?: string;
  name: string;
  image?: string;
  sku?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  at: number;
  note?: string;
}

// Payment Timeline - parallel array to statusHistory, same shape, appended
// alongside updatePaymentStatus's existing write.
export interface PaymentStatusHistoryEntry {
  status: PaymentStatus;
  at: number;
  note?: string;
}

// Internal Notes / Customer Notes - append-only arrays on the order doc,
// mirroring statusHistory's on-doc-array shape rather than a new collection.
export interface OrderNoteEntry {
  text: string;
  authorUid: string;
  at: number;
}

export type ReturnStatus = "requested" | "approved" | "rejected" | "received" | "completed";

export interface ReturnStatusHistoryEntry {
  status: ReturnStatus;
  at: number;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  guestEmail?: string;
  guestName?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax?: number;
  total: number;
  shippingAddress: OrderAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentProofUrl?: string;
  paymentTransactionRef?: string;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  statusHistory: OrderStatusHistoryEntry[];
  createdAt?: number;
  updatedAt?: number;

  // Payment Timeline
  paymentStatusHistory?: PaymentStatusHistoryEntry[];

  // Internal Notes / Customer Notes
  internalNotes?: OrderNoteEntry[];
  customerNotes?: OrderNoteEntry[];

  // Shipment Information - trackingNumber already exists above; courier name
  // and dispatch/delivery dates are new, separate fields (never repurposing
  // trackingNumber).
  courierName?: string;
  dispatchDate?: number;
  deliveryDate?: number;

  // Cancellation Workflow - order-side state only. Stock is never
  // adjusted here (see order-lifecycle actions for the rationale).
  cancellationReason?: string;
  cancelledAt?: number;
  cancelledBy?: string;

  // Refund Workflow - order-side state only, does not call any payment
  // gateway (none exists in this codebase) or touch stock.
  refundReason?: string;
  refundAmount?: number;
  refundedAt?: number;
  refundedBy?: string;

  // Return Workflow
  returnStatus?: ReturnStatus;
  returnReason?: string;
  returnStatusHistory?: ReturnStatusHistoryEntry[];
  returnRequestedAt?: number;
  returnResolvedAt?: number;
  returnResolvedBy?: string;
}
