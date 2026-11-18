/**
 * Product create/save results that reach the browser. Server Actions that THROW lose their
 * message in production builds (Next.js replaces it with a generic digest), so the product
 * form could never show the real reason. Input problems the merchant can fix are returned as
 * text; anything else becomes a generic message (details stay in the server log).
 */
export type ProductSaveResult = { ok: true; id: string } | { ok: false; error: string };

export const PRODUCT_SAVE_FAILED = "The product could not be saved. Please try again.";

/** An error whose message is safe and useful to show the merchant (e.g. a duplicate slug). */
export class ProductInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductInputError";
  }
}

export function productSaveError(err: unknown): string {
  return err instanceof ProductInputError || (err instanceof Error && err.name === "ProductInputError")
    ? err.message
    : PRODUCT_SAVE_FAILED;
}

export function duplicateSlugMessage(slug: string): string {
  return `A product with the URL slug "${slug}" already exists in your store. Change the slug (or edit the existing product).`;
}

/** Next.js redirect()/notFound() work by throwing - they must never be swallowed into a result
 * (e.g. requireAdmin() redirecting an expired session to the login page). */
export function isNextControlFlowError(err: unknown): boolean {
  const digest = (err as { digest?: unknown } | null)?.digest;
  return typeof digest === "string" && (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_NOT_FOUND"));
}
