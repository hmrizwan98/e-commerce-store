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

export interface Customer {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  role: "customer" | "admin";
  totalSpend?: number;
  orderCount?: number;
  createdAt?: number;
}
