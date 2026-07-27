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
}
