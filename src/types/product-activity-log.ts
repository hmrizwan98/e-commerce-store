// "trashed"/"restored" name the soft-delete/restore flow (isDeleted), deliberately not
// "archived" - that word is already Product.status's own distinct "archived" state.
export type ProductActivityAction =
  | "created"
  | "updated"
  | "trashed"
  | "restored"
  | "permanently_deleted"
  | "stock_adjusted"
  | "duplicated";

/** Per-store product audit trail - unlike storeActivityLogs (Super Admin, global, top-level),
 * this is tenant-scoped: stores/{storeId}/productActivityLogs/{id}. */
export interface ProductActivityLog {
  id: string;
  productId: string;
  action: ProductActivityAction;
  actorUid: string;
  meta?: Record<string, string>;
  createdAt?: number;
}
