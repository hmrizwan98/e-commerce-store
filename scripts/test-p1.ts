/**
 * P1 rules (pure / mocked providers - no Firestore, no network, no browser):
 * order email + WhatsApp report real delivery, notification/template settings show only what
 * exists, contact form validation, payment-proof file + access rules, legacy branding logos,
 * honest domain banner.
 * Run: npx tsx --require ./scripts/stub-server-only.cjs --test scripts/test-p1.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  sendOrderConfirmationEmail,
  renderOrderSubject,
  DEFAULT_ORDER_SUBJECT_TEMPLATE,
} from "../src/lib/notifications/email-service";
import { sendWhatsAppNotification } from "../src/lib/notifications/whatsapp-service";
import { describeChannels, TEMPLATE_SUPPORT } from "../src/lib/notifications/channel-availability";
import { validateContactInput, contactReplyHref, CONTACT_LIMITS } from "../src/lib/contact/contact-message";
import {
  detectProofFormat,
  validateProofFile,
  proofUploadEligibility,
  proofPublicId,
  proofBelongsTo,
  PROOF_MAX_BYTES,
  PROOF_MAX_PER_ORDER,
} from "../src/lib/payments/payment-proof";
import { orderMatchesContact } from "../src/lib/orders/contact-match";
import { legacyLogoAdoption } from "../src/lib/theme/theme-safety";

const order = {
  orderNumber: "WR-1001",
  guestEmail: "ali@gmail.com",
  guestName: "Ali",
  items: [{ name: "Shirt", quantity: 1, unitPrice: 1000 }],
  subtotal: 1000,
  total: 1000,
  shippingAddress: { fullName: "Ali", phone: "0300-1234567", line1: "St 1", city: "Lahore", country: "PK" },
} as any;

const okFetch = (async () => new Response("{}", { status: 200 })) as unknown as typeof fetch;
const rejectFetch = (async () => new Response('{"message":"API key sk_live_secret invalid"}', { status: 401 })) as unknown as typeof fetch;
const throwFetch = (async () => {
  throw new Error("ECONNRESET with token sk_live_secret");
}) as unknown as typeof fetch;

function withEnv<T>(vars: Record<string, string | undefined>, fn: () => Promise<T>): Promise<T> {
  const saved = Object.fromEntries(Object.keys(vars).map((k) => [k, process.env[k]]));
  for (const [k, v] of Object.entries(vars)) v === undefined ? delete process.env[k] : (process.env[k] = v);
  return fn().finally(() => {
    for (const [k, v] of Object.entries(saved)) v === undefined ? delete process.env[k] : (process.env[k] = v);
  });
}

test("email: never reports success unless the provider accepted it", async () => {
  await withEnv({ RESEND_API_KEY: "test-key" }, async () => {
    assert.equal((await sendOrderConfirmationEmail(order, { fetchImpl: okFetch })).status, "sent");
    const rejected = await sendOrderConfirmationEmail(order, { fetchImpl: rejectFetch });
    assert.deepEqual([rejected.status, rejected.success], ["failed", false]);
    const thrown = await sendOrderConfirmationEmail(order, { fetchImpl: throwFetch });
    assert.deepEqual([thrown.status, thrown.success], ["failed", false]);
    for (const r of [rejected, thrown]) assert.doesNotMatch(r.message, /sk_live|secret|key|ECONN/i, "no provider internals");
    assert.equal((await sendOrderConfirmationEmail(order, { enabled: false, fetchImpl: okFetch })).status, "disabled");
    assert.equal((await sendOrderConfirmationEmail({ ...order, guestEmail: "" }, { fetchImpl: okFetch })).status, "no_recipient");
    assert.equal((await sendOrderConfirmationEmail({ ...order, guestEmail: "x@example.com" }, { fetchImpl: okFetch })).status, "no_recipient");
  });
  await withEnv({ RESEND_API_KEY: undefined }, async () => {
    const r = await sendOrderConfirmationEmail(order, { fetchImpl: okFetch });
    assert.deepEqual([r.status, r.success], ["not_configured", false], "the old code said success:true here");
  });
});

test("email: subject keeps today's format by default; template placeholders; no header injection", async () => {
  const vars = { storeName: "Glamix", orderNumber: "WR-1001" };
  assert.equal(renderOrderSubject(undefined, vars), "Glamix: Order Confirmation #WR-1001");
  assert.equal(renderOrderSubject(DEFAULT_ORDER_SUBJECT_TEMPLATE, vars), "Glamix: Order Confirmation #WR-1001");
  assert.equal(renderOrderSubject("  ", vars), "Glamix: Order Confirmation #WR-1001");
  assert.equal(renderOrderSubject("Thanks! {{ orderNumber }} from {{storeName}}", vars), "Thanks! WR-1001 from Glamix");
  assert.doesNotMatch(renderOrderSubject("Hi\r\nBcc: evil@x.com", vars), /[\r\n]/);
  assert.ok(renderOrderSubject("x".repeat(500), vars).length <= 200);

  let sentSubject = "";
  const captureFetch = (async (_u: string, init: any) => {
    sentSubject = JSON.parse(init.body).subject;
    return new Response("{}", { status: 200 });
  }) as unknown as typeof fetch;
  await withEnv({ RESEND_API_KEY: "test-key" }, () =>
    sendOrderConfirmationEmail(order, { fetchImpl: captureFetch, brand: { storeName: "Glamix" }, subjectTemplate: "Order {{orderNumber}} received" })
  );
  assert.equal(sentSubject, "Order WR-1001 received");

  // The stored default (Settings -> Email Templates) equals the subject emails always had.
  const repo = fs.readFileSync("src/lib/firebase/repositories/site-settings.ts", "utf8");
  assert.match(repo, /orderConfirmation: \{ subject: "\{\{storeName\}\}: Order Confirmation #\{\{orderNumber\}\}", enabled: true \}/);
});

test("whatsapp: honest status; click-to-chat link still provided", async () => {
  await withEnv({ WHATSAPP_API_URL: undefined, WHATSAPP_API_TOKEN: undefined }, async () => {
    const r = await sendWhatsAppNotification("ORDER_PLACED", order, null, null, { enabled: true });
    assert.deepEqual([r.status, r.success], ["not_configured", false], "the old code said success:true here");
    assert.match(r.waLink, /^https:\/\/wa\.me\/923001234567\?text=/);
    assert.equal((await sendWhatsAppNotification("ORDER_PLACED", order, null, null, { enabled: false })).status, "disabled");
    const noPhone = { ...order, shippingAddress: { ...order.shippingAddress, phone: "" } };
    assert.equal((await sendWhatsAppNotification("ORDER_PLACED", noPhone, null, null, { enabled: true })).status, "no_recipient");
  });
  await withEnv({ WHATSAPP_API_URL: "https://gateway.test/send", WHATSAPP_API_TOKEN: "t" }, async () => {
    assert.equal((await sendWhatsAppNotification("ORDER_PLACED", order, null, null, { enabled: true, fetchImpl: okFetch })).status, "sent");
    assert.equal((await sendWhatsAppNotification("ORDER_PLACED", order, null, null, { enabled: true, fetchImpl: rejectFetch })).status, "failed");
  });
});

test("order flow records the real outcome and honours both switches", () => {
  const src = fs.readFileSync("src/lib/firebase/repositories/orders.ts", "utf8");
  assert.match(src, /"notificationDelivery\.confirmationEmail": \{ status: res\.status, message: res\.message/);
  assert.match(src, /enabled: notifications\?\.email\.enabled !== false && templates\?\.orderConfirmation\.enabled !== false/);
  assert.match(src, /subjectTemplate: templates\?\.orderConfirmation\.subject/);
  assert.match(src, /themeConfig\?\.logos\?\.logoLight/, "logo from the Theme Customizer");
  assert.match(src, /whatsapp\.enabled === true/);
});

test("notification channels: push/SMS shown as not available, WhatsApp/email warn when unconfigured", () => {
  const none = describeChannels({ emailProvider: false, whatsappGateway: false });
  const byKey = Object.fromEntries(none.map((c) => [c.key, c]));
  assert.equal(byKey.push.implemented, false);
  assert.equal(byKey.sms.implemented, false);
  assert.equal(byKey.whatsapp.implemented, true);
  assert.equal(byKey.whatsapp.configured, false);
  assert.match(byKey.whatsapp.description, /nothing is sent automatically/);
  assert.match(byKey.email.description, /no emails are sent/);
  const all = Object.fromEntries(describeChannels({ emailProvider: true, whatsappGateway: true }).map((c) => [c.key, c]));
  assert.equal(all.email.configured && all.whatsapp.configured, true);
  assert.equal(all.push.implemented || all.sms.implemented, false, "never pretends push/SMS work");

  const supported = Object.entries(TEMPLATE_SUPPORT).filter(([, v]) => v.supported).map(([k]) => k);
  assert.deepEqual(supported, ["orderConfirmation"]);

  const ui = fs.readFileSync("src/app/(admin)/admin/(protected)/settings/SettingsPageClient.tsx", "utf8");
  assert.match(ui, /describeChannels\(channels\)/);
  assert.match(ui, /disabled=\{!c\.implemented\}/);
  assert.match(ui, /disabled=\{!info\.supported\}/);
  assert.doesNotMatch(ui, /\["push", "Push Notifications"\]/, "old fake toggles removed");
});

test("contact form: validation, limits, safe reply link", () => {
  assert.equal(validateContactInput({ name: "", email: "a@b.co", message: "hi" }).ok, false);
  assert.equal(validateContactInput({ name: "A", email: "not-an-email", message: "hi" }).ok, false);
  assert.equal(validateContactInput({ name: "A", email: "a@b.co", message: "x".repeat(CONTACT_LIMITS.message + 1) }).ok, false);
  assert.equal(validateContactInput({ name: "x".repeat(CONTACT_LIMITS.name + 1), email: "a@b.co", message: "hi" }).ok, false);
  const ok = validateContactInput({ name: " Ali\r\nBcc ", email: " Ali@B.CO ", message: " Hello " });
  assert.deepEqual(ok, { ok: true, value: { name: "Ali Bcc", email: "ali@b.co", message: "Hello" } });
  assert.equal(contactReplyHref("a@b.co", "Glamix & Co"), "mailto:a%40b.co?subject=Re%3A%20your%20message%20to%20Glamix%20%26%20Co");
  assert.equal(contactReplyHref("javascript:alert(1)", "x"), null);
  assert.equal(contactReplyHref('a@b.co"><script>', "x"), null);
});

const JPG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
const WEBP = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]); // "RIFF....WEBP"

test("payment proof: file type by bytes only; size cap", () => {
  assert.equal(detectProofFormat(JPG), "jpg");
  assert.equal(detectProofFormat(PNG), "png");
  assert.equal(detectProofFormat(WEBP), "webp");
  for (const bad of ["<svg onload=alert(1)>", "%PDF-1.7", "<html>", "GIF89a"]) assert.equal(detectProofFormat(Buffer.from(bad)), null, bad);
  assert.equal(validateProofFile(new Uint8Array()).ok, false);
  const big = new Uint8Array(PROOF_MAX_BYTES + 1);
  big.set(JPG);
  assert.equal(validateProofFile(big).ok, false);
  assert.deepEqual(validateProofFile(JPG), { ok: true, format: "jpg" });
});

test("payment proof: only unsettled prepaid orders, max per order", () => {
  const base = { paymentMethod: "bank_transfer", paymentStatus: "proof_submitted", orderStatus: "pending", paymentProofs: [] } as any;
  assert.equal(proofUploadEligibility(base).ok, true);
  assert.equal(proofUploadEligibility({ ...base, paymentMethod: "cod" }).ok, false);
  assert.equal(proofUploadEligibility({ ...base, paymentStatus: "paid" }).ok, false);
  assert.equal(proofUploadEligibility({ ...base, orderStatus: "cancelled" }).ok, false);
  const full = Array.from({ length: PROOF_MAX_PER_ORDER }, (_, i) => ({ publicId: `p${i}` }));
  assert.equal(proofUploadEligibility({ ...base, paymentProofs: full }).ok, false);
});

test("payment proof: private path inside the store's folder; cross-store/order access refused", () => {
  const id = proofPublicId("glamix", "order1", 123, "ab/../c");
  assert.equal(id, "glamix/payment-proofs/order1/123-abc");
  assert.equal(proofPublicId("../zyvora", "o/1", 1, "r"), "zyvora/payment-proofs/o1/1-r");
  assert.ok(proofBelongsTo({ publicId: id }, "glamix", "order1"));
  assert.equal(proofBelongsTo({ publicId: id }, "zyvora-hub", "order1"), false, "other store");
  assert.equal(proofBelongsTo({ publicId: id }, "glamix", "order2"), false, "other order");

  const route = fs.readFileSync("src/app/api/payment-proof/route.ts", "utf8");
  assert.match(route, /orderMatchesContact\(order, contact\)/);
  assert.match(route, /checkRateLimit\("payment-proof"/);
  assert.match(route, /validateProofFile\(original\)/);
  assert.match(route, /uploadPrivateImage/);
  const priv = fs.readFileSync("src/lib/cloudinary/private-assets.ts", "utf8");
  assert.match(priv, /type: "private"/);
  assert.match(priv, /expires_at/);
});

test("order contact match (tracking + proof upload)", () => {
  const o = { guestEmail: "Ali@Gmail.com", shippingAddress: { phone: "0300-1234567" } } as any;
  assert.ok(orderMatchesContact(o, "ali@gmail.com"));
  assert.ok(orderMatchesContact(o, "+92 300 1234567"));
  assert.equal(orderMatchesContact(o, "other@gmail.com"), false);
  assert.equal(orderMatchesContact(o, "123"), false);
  assert.equal(orderMatchesContact(o, ""), false);
});

test("branding: legacy logo copied to the theme only into an EMPTY slot, https only", () => {
  assert.deepEqual(legacyLogoAdoption("faviconUrl", "https://cdn/x.png", {}), { ok: true, key: "favicon", value: "https://cdn/x.png" });
  assert.equal(legacyLogoAdoption("faviconUrl", "https://cdn/x.png", { favicon: "https://cdn/existing.png" }).ok, false);
  assert.equal(legacyLogoAdoption("logoUrl", "javascript:alert(1)", {}).ok, false);
  assert.equal(legacyLogoAdoption("logoUrl", "http://insecure/x.png", {}).ok, false);
  assert.equal(legacyLogoAdoption("primaryColor", "https://x", {}).ok, false);
  const ui = fs.readFileSync("src/app/(admin)/admin/(protected)/settings/SettingsPageClient.tsx", "utf8");
  assert.doesNotMatch(ui, /<label className=\{labelClass\}>Favicon URL<\/label>/, "free-text favicon field removed");
});

test("domain banner describes the real check", () => {
  const panel = fs.readFileSync("src/app/(superadmin)/superadmin/(protected)/DomainManagementPanel.tsx", "utf8");
  assert.doesNotMatch(panel, /no real check is performed yet/);
  assert.match(panel, /hostingConnected/);
  assert.match(panel, /const result = await reverifyDomain/);
  assert.doesNotMatch(panel, /Re-verification requested/);
});
