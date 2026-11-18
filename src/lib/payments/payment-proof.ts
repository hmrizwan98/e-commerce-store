import type { Order, PaymentProof } from "@/types/order";

/**
 * Payment proof (bank transfer / JazzCash / EasyPaisa screenshot) rules - pure, shared by the
 * upload action and the tests.
 */
// Under the hosting request-body limit (~4.5 MB); the browser compresses first anyway.
export const PROOF_MAX_BYTES = 4 * 1024 * 1024;
export const PROOF_MAX_PER_ORDER = 3;
export type ProofFormat = "jpg" | "png" | "webp";

/** The file type is decided from the bytes themselves (magic numbers), never from the file
 * name or the browser's declared type. Only plain images: no SVG (scripts), no PDF/HTML. */
export function detectProofFormat(bytes: Uint8Array): ProofFormat | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((b, i) => bytes[i] === b)) return "png";
  if (
    bytes.length >= 12 &&
    String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === "RIFF" &&
    String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) === "WEBP"
  )
    return "webp";
  return null;
}

export type ProofFileCheck = { ok: true; format: ProofFormat } | { ok: false; error: string };

export function validateProofFile(bytes: Uint8Array): ProofFileCheck {
  if (!bytes.length) return { ok: false, error: "Please choose an image file." };
  if (bytes.length > PROOF_MAX_BYTES) return { ok: false, error: "The image is larger than 4 MB." };
  const format = detectProofFormat(bytes);
  if (!format) return { ok: false, error: "Only JPG, PNG or WEBP images are accepted." };
  return { ok: true, format };
}

export type ProofEligibility = { ok: true } | { ok: false; error: string };

/** Only prepaid (non-COD) orders that aren't paid/refunded/cancelled, up to the per-order limit. */
export function proofUploadEligibility(order: Pick<Order, "paymentMethod" | "paymentStatus" | "orderStatus" | "paymentProofs">): ProofEligibility {
  if (order.paymentMethod === "cod") return { ok: false, error: "This order is Cash on Delivery - no payment proof is needed." };
  if (order.paymentStatus === "paid" || order.paymentStatus === "refunded") return { ok: false, error: "This order's payment is already settled." };
  if (order.orderStatus === "cancelled" || order.orderStatus === "refunded") return { ok: false, error: "This order is closed." };
  if ((order.paymentProofs?.length ?? 0) >= PROOF_MAX_PER_ORDER)
    return { ok: false, error: `You've already uploaded ${PROOF_MAX_PER_ORDER} payment screenshots for this order.` };
  return { ok: true };
}

/** Private Cloudinary path - inside the store's own folder, so store deletion cleans it up. */
export function proofPublicId(storeFolder: string, orderId: string, now: number, rand: string): string {
  const safe = (v: string) => v.replace(/[^a-zA-Z0-9-_]/g, "");
  return `${safe(storeFolder)}/payment-proofs/${safe(orderId)}/${now}-${safe(rand)}`;
}

/** A stored proof may only be viewed for the order (and store folder) it belongs to. */
export function proofBelongsTo(proof: Pick<PaymentProof, "publicId">, storeFolder: string, orderId: string): boolean {
  return proof.publicId.startsWith(`${storeFolder}/payment-proofs/${orderId}/`);
}
