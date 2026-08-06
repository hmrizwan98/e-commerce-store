export interface CustomerAddress {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDefault?: boolean;
}

export type CustomerStatus = "active" | "blocked" | "deleted" | "guest";

export interface CustomerNoteEntry {
  text: string;
  authorUid: string;
  at: number;
}

export interface Customer {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  role: "customer" | "admin";
  totalSpend?: number;
  orderCount?: number;
  createdAt?: number;
  updatedAt?: number;

  // Customer Status - undefined is treated as "active" everywhere (existing
  // docs predate this field). "guest" marks a customer materialized from a
  // guest checkout order rather than a real registered account.
  status?: CustomerStatus;

  // Customer Tags - free-form, admin-assigned (mirrors Product.tags).
  tags?: string[];

  // Internal Notes - append-only, mirrors Order.internalNotes' shape.
  internalNotes?: CustomerNoteEntry[];

  // Schema only - nothing writes this yet, since no real customer
  // authentication flow exists in this codebase to trigger it. Ready for a
  // future login system to call recordCustomerLogin() with.
  lastLoginAt?: number;
}
