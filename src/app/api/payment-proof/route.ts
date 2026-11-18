import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { adminDb } from "@/lib/firebase/admin";
import { getCurrentTenant } from "@/lib/tenant/current";
import { checkRateLimit } from "@/lib/firebase/rate-limit";
import { getOrderByOrderNumber } from "@/lib/firebase/repositories/orders";
import { attachPaymentProof } from "@/lib/firebase/repositories/payment-proofs";
import { logOrderActivity } from "@/lib/firebase/repositories/order-activity-logs";
import { orderMatchesContact } from "@/lib/orders/contact-match";
import { PROOF_MAX_BYTES, proofPublicId, proofUploadEligibility, validateProofFile } from "@/lib/payments/payment-proof";
import { uploadPrivateImage, deletePrivateImage } from "@/lib/cloudinary/private-assets";

export const runtime = "nodejs";

const NOT_FOUND = "We couldn't find an order with these details.";

/**
 * Customer uploads a payment screenshot for a prepaid order.
 * - Authorisation: order number + the email/phone given at checkout (same as order tracking),
 *   looked up only inside the CURRENT store (tenant-scoped), rate-limited per store + IP.
 * - File: checked by its bytes (JPG/PNG/WEBP only, ≤ 4 MB), then re-encoded with sharp, which
 *   drops metadata (e.g. location) and anything that isn't image pixels.
 * - Storage: Cloudinary `type: "private"` inside the store's own folder - no public URL exists;
 *   admins view it through a short-lived signed link.
 */
export async function POST(req: NextRequest) {
  const tenant = await getCurrentTenant();
  if (!tenant) return NextResponse.json({ error: "Store not found." }, { status: 404 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "anonymous";
  const rate = await checkRateLimit("payment-proof", `${tenant.id}:${ip}`);
  if (!rate.allowed) return NextResponse.json({ error: "Too many uploads. Please try again later." }, { status: 429 });

  const length = Number(req.headers.get("content-length") || 0);
  if (length > PROOF_MAX_BYTES + 64 * 1024) return NextResponse.json({ error: "The image is larger than 4 MB." }, { status: 413 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  const orderNumber = String(form.get("orderNumber") ?? "").trim().slice(0, 64);
  const contact = String(form.get("contact") ?? "").trim().slice(0, 254);
  const file = form.get("file");
  if (!orderNumber || !contact || !(file instanceof Blob)) return NextResponse.json({ error: "Missing details." }, { status: 400 });
  if (file.size > PROOF_MAX_BYTES) return NextResponse.json({ error: "The image is larger than 4 MB." }, { status: 413 });

  const order = await getOrderByOrderNumber(orderNumber).catch(() => null);
  if (!order || !orderMatchesContact(order, contact)) return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
  const eligibility = proofUploadEligibility(order);
  if (!eligibility.ok) return NextResponse.json({ error: eligibility.error }, { status: 409 });

  const original = Buffer.from(await file.arrayBuffer());
  const check = validateProofFile(original);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 415 });

  let clean: Buffer;
  try {
    clean = await sharp(original, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "This image couldn't be read. Please try another screenshot." }, { status: 415 });
  }

  const publicId = proofPublicId(tenant.cloudinaryFolder, order.id, Date.now(), Math.random().toString(36).slice(2, 8));
  let uploaded: { publicId: string; format: string; bytes: number };
  try {
    uploaded = await uploadPrivateImage(clean, publicId);
  } catch {
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }

  const attached = await attachPaymentProof(adminDb(), tenant.id, order.id, { ...uploaded, uploadedAt: Date.now() }).catch(() => ({
    ok: false as const,
    error: "Upload failed. Please try again.",
  }));
  if (!attached.ok) {
    await deletePrivateImage(uploaded.publicId);
    return NextResponse.json({ error: attached.error }, { status: 409 });
  }
  await logOrderActivity(order.id, "payment_proof_uploaded", "customer").catch(() => {});
  return NextResponse.json({ ok: true, message: "Payment screenshot received. The store will check it and confirm your payment." });
}
