import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  productId: string;
  variantId?: string;
  slug: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  variantLabel?: string;
  maxStock: number;
}

interface CartState {
  items: CartItem[];
}

const CART_STORAGE_KEY = "cart_items";

/**
 * TEMPORARY (Phase 8A) - real production tenants each live on their own
 * subdomain, a distinct browser storage origin, so CART_STORAGE_KEY is
 * already naturally cart-isolated per tenant with zero extra code. The
 * /frontstore/{slug} preview mechanism intentionally tests multiple tenants
 * under the SAME origin on one Vercel domain, where that free isolation
 * doesn't exist - so only in that specific case, namespace the key by the
 * previewed slug (extracted from the URL path, not any tenant/store data).
 * Outside of /frontstore/, this returns the exact unchanged key, so real
 * production cart persistence is byte-identical to before this change.
 */
function extractFrontstoreSlug(pathname: string | null | undefined): string | null {
  const match = pathname?.match(/^\/(?:store|frontstore)\/([^/]+)/);
  return match ? match[1] : null;
}

export function getCartStorageKey(pathname: string | null | undefined): string {
  const slug = extractFrontstoreSlug(pathname);
  return slug ? `${CART_STORAGE_KEY}__frontstore_${slug}` : CART_STORAGE_KEY;
}

// Always starts empty - matching what the server renders - so the first
// client render is hydration-safe. The real localStorage cart is loaded via
// `hydrateCart` from a client-only effect after mount (see CartHydrator).
const initialState: CartState = { items: [] };

function sameLine(a: { productId: string; variantId?: string }, b: { productId: string; variantId?: string }) {
  return a.productId === b.productId && a.variantId === b.variantId;
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(
      state,
      action: PayloadAction<{ item: Omit<CartItem, "quantity">; quantity: number }>
    ) {
      const { item, quantity } = action.payload;
      const existing = state.items.find((i) => sameLine(i, item));
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, existing.maxStock || 99);
      } else {
        state.items.push({ ...item, quantity: Math.min(quantity, item.maxStock || 99) });
      }
    },
    removeItem(state, action: PayloadAction<{ productId: string; variantId?: string }>) {
      state.items = state.items.filter((i) => !sameLine(i, action.payload));
    },
    updateQuantity(
      state,
      action: PayloadAction<{ productId: string; variantId?: string; quantity: number }>
    ) {
      const { quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => !sameLine(i, action.payload));
        return;
      }
      const item = state.items.find((i) => sameLine(i, action.payload));
      if (item) item.quantity = Math.min(quantity, item.maxStock || 99);
    },
    clearCart(state) {
      state.items = [];
    },
    hydrateCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart, hydrateCart } = cartSlice.actions;
export default cartSlice.reducer;
export { CART_STORAGE_KEY };
