/**
 * COD Order Verification - representative test cases for the pure engine/phone logic.
 * Run: npx tsx --test scripts/test-order-verification.ts
 * (No Firestore access - the persistence/actions layer is exercised manually in the admin.)
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateOrderVerification,
  requiresCodVerification,
  resolveRejectionReason,
  summarizeHistory,
  type HistoryOrder,
  type VerificationInput,
} from "../src/lib/orders/verification/engine";
import { buildVerificationWhatsAppLink, normalizePhone, phoneQueryVariants } from "../src/lib/orders/verification/phone";
import { ALLOWED_ORDER_STATUS_TRANSITIONS } from "../src/lib/orders/order-status-transitions";

const NOW = Date.UTC(2026, 9, 3, 12);
const DAY = 24 * 60 * 60 * 1000;

const goodAddress = {
  fullName: "Ayesha Khan",
  phone: "0300-1234567",
  line1: "House 12, Street 4, Block B, Gulberg III",
  city: "Lahore",
  country: "Pakistan",
};

function input(history: HistoryOrder[], overrides: Partial<VerificationInput> = {}): VerificationInput {
  return {
    total: 4500,
    items: [{ quantity: 2 }],
    shippingAddress: goodAddress,
    history: summarizeHistory(history, { excludeOrderId: "current", now: NOW, truncated: false }),
    ...overrides,
  };
}

const delivered = (id: string, daysAgo: number, total = 4000): HistoryOrder => ({
  id,
  orderStatus: "delivered",
  total,
  createdAt: NOW - daysAgo * DAY,
  statusHistory: [{ status: "pending", at: 0 }, { status: "shipped", at: 1 }, { status: "delivered", at: 2 }],
});
const rto = (id: string, daysAgo: number): HistoryOrder => ({
  id,
  orderStatus: "cancelled",
  total: 3000,
  createdAt: NOW - daysAgo * DAY,
  statusHistory: [{ status: "pending", at: 0 }, { status: "shipped", at: 1 }, { status: "cancelled", at: 2 }],
});

test("1. returning successful customer -> LOW / RECOMMEND_CONFIRM", () => {
  const r = evaluateOrderVerification(input([delivered("a", 30), delivered("b", 60)]));
  assert.equal(r.riskLevel, "LOW");
  assert.equal(r.recommendation, "RECOMMEND_CONFIRM");
  assert.ok(r.reasons.some((x) => x.code === "delivered_history"));
});

test("2. new customer -> MEDIUM / CALL_CUSTOMER", () => {
  const r = evaluateOrderVerification(input([]));
  assert.equal(r.riskLevel, "MEDIUM");
  assert.equal(r.recommendation, "CALL_CUSTOMER");
  assert.ok(r.reasons.some((x) => x.code === "new_customer"));
});

test("3. repeated RTO -> HIGH / MANUAL_REVIEW", () => {
  const r = evaluateOrderVerification(input([rto("a", 10), rto("b", 40), delivered("c", 90)]));
  assert.equal(r.riskLevel, "HIGH");
  assert.equal(r.recommendation, "MANUAL_REVIEW");
  assert.ok(r.reasons.some((x) => x.code === "repeated_rto"));
});

test("4a. short street address (city present) -> MEDIUM even for a returning customer", () => {
  const r = evaluateOrderVerification(
    input([delivered("a", 30)], { shippingAddress: { ...goodAddress, line1: "Gulberg" } })
  );
  assert.equal(r.riskLevel, "MEDIUM");
  assert.ok(r.reasons.some((x) => x.code === "address_short"));
});

test("4b. missing city -> HIGH", () => {
  const r = evaluateOrderVerification(input([], { shippingAddress: { ...goodAddress, city: "" } }));
  assert.equal(r.riskLevel, "HIGH");
  assert.ok(r.reasons.some((x) => x.code === "city_missing"));
});

test("invalid phone -> HIGH", () => {
  const r = evaluateOrderVerification(input([], { shippingAddress: { ...goodAddress, phone: "12345" } }));
  assert.equal(r.riskLevel, "HIGH");
});

test("multiple orders in 24h and unusual value/quantity are flagged", () => {
  const recent: HistoryOrder = { id: "r", orderStatus: "pending", total: 4000, createdAt: NOW - 2 * 60 * 60 * 1000 };
  const r = evaluateOrderVerification(
    input([delivered("a", 30, 2000), recent], { total: 9000, items: [{ quantity: 12 }] })
  );
  const codes = r.reasons.map((x) => x.code);
  assert.ok(codes.includes("recent_orders"));
  assert.ok(codes.includes("large_quantity"));
  assert.ok(codes.includes("high_value_vs_history"));
  assert.equal(r.riskLevel, "HIGH"); // 3 warnings
});

test("current order is excluded from its own history", () => {
  const h = summarizeHistory([{ id: "current", orderStatus: "pending", createdAt: NOW }], {
    excludeOrderId: "current",
    now: NOW,
    truncated: false,
  });
  assert.equal(h.totalOrders, 0);
});

test("6. reject without a reason is blocked; 'Other' needs text", () => {
  assert.equal(resolveRejectionReason(undefined, undefined).ok, false);
  assert.equal(resolveRejectionReason("", "").ok, false);
  assert.equal(resolveRejectionReason("not_a_reason", "").ok, false);
  assert.equal(resolveRejectionReason("other", "  ").ok, false);
});

test("7. reject with a reason resolves the audit text", () => {
  const preset = resolveRejectionReason("wrong_phone", undefined);
  assert.deepEqual(preset, { ok: true, code: "wrong_phone", reason: "Wrong phone number" });
  const other = resolveRejectionReason("other", "  Fake address given  ");
  assert.deepEqual(other, { ok: true, code: "other", reason: "Fake address given" });
});

test("8. WhatsApp link uses +92 international digits", () => {
  for (const raw of ["0300-1234567", "03001234567", "3001234567", "+92 300 1234567", "923001234567", "0092 300 1234567"]) {
    assert.equal(normalizePhone(raw).international, "+923001234567", raw);
  }
  const link = buildVerificationWhatsAppLink({
    phone: "0300-1234567",
    customerName: "Ayesha",
    storeName: "Glamix",
    orderNumber: "ORD-ABC",
    amountLabel: "Rs 4,500",
    address: "House 12, Lahore",
  })!;
  assert.ok(link.startsWith("https://wa.me/923001234567?text="));
  const text = decodeURIComponent(link.split("?text=")[1]);
  assert.ok(text.startsWith("Assalam-o-Alaikum Ayesha,"));
  assert.ok(text.includes("Aap ne Glamix par Order #ORD-ABC place kiya hai."));
  assert.ok(text.includes("Total: Rs 4,500"));
  assert.ok(text.includes("Delivery Address: House 12, Lahore"));
  assert.equal(buildVerificationWhatsAppLink({ phone: "123", customerName: "", storeName: "", orderNumber: "", amountLabel: "", address: "" }), null);
  assert.ok(phoneQueryVariants("0300-1234567").includes("03001234567"));
  assert.equal(phoneQueryVariants("0300-1234567").length, 7);
});

test("9. prepaid orders do not enter COD verification", () => {
  assert.equal(requiresCodVerification("cod"), true);
  assert.equal(requiresCodVerification("bank_transfer"), false);
  assert.equal(requiresCodVerification("jazzcash"), false);
});

test("10. existing order status lifecycle is unchanged", () => {
  assert.deepEqual(ALLOWED_ORDER_STATUS_TRANSITIONS, {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["packed", "cancelled"],
    packed: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
    refunded: [],
  });
});
