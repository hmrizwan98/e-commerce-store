/**
 * Commission + ledger math (pure - no Firestore).
 * Run: npx tsx --test scripts/test-commission.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateCommission,
  calculateOrderCommission,
  commissionReturnedOnRefund,
  describePolicy,
  policyFromLegacySettings,
  samePolicy,
  validateCommissionPolicy,
  type CommissionPolicy,
} from "../src/lib/finance/commission";
import { buildTrend, orderLedgerState, rangeBounds, summarizeLedger, type LedgerEntry } from "../src/lib/finance/ledger-math";

const pct = (percentage: number): CommissionPolicy => ({ type: "percentage", percentage, fixedPerOrder: 0 });
const DAY = 86400000;

test("validateCommissionPolicy normalises and rejects bad input", () => {
  assert.deepEqual(validateCommissionPolicy({ type: "percentage", percentage: 5, fixedPerOrder: 99 }), {
    ok: true,
    policy: { type: "percentage", percentage: 5, fixedPerOrder: 0 },
  });
  assert.deepEqual(validateCommissionPolicy({ type: "fixed", percentage: 7, fixedPerOrder: 50 }), {
    ok: true,
    policy: { type: "fixed", percentage: 0, fixedPerOrder: 50 },
  });
  assert.deepEqual(validateCommissionPolicy({ type: "none", percentage: 9 }), {
    ok: true,
    policy: { type: "none", percentage: 0, fixedPerOrder: 0 },
  });
  assert.equal(validateCommissionPolicy({ type: "percentage", percentage: 101 }).ok, false);
  assert.equal(validateCommissionPolicy({ type: "percentage", percentage: -1 }).ok, false);
  assert.equal(validateCommissionPolicy({ type: "fixed", fixedPerOrder: -5 }).ok, false);
  assert.equal(validateCommissionPolicy({ type: "percentage", percentage: Number.NaN }).ok, false);
  assert.equal(validateCommissionPolicy({ type: "bogus" as never }).ok, false);
  assert.equal(validateCommissionPolicy(null).ok, false);
});

test("calculateOrderCommission for each policy type", () => {
  assert.deepEqual(calculateOrderCommission(2000, pct(5)), { percentagePart: 100, fixedPart: 0, amount: 100 });
  assert.deepEqual(calculateOrderCommission(2000, { type: "fixed", percentage: 0, fixedPerOrder: 30 }), {
    percentagePart: 0,
    fixedPart: 30,
    amount: 30,
  });
  assert.deepEqual(calculateOrderCommission(1000, { type: "percentage_plus_fixed", percentage: 2.5, fixedPerOrder: 20 }), {
    percentagePart: 25,
    fixedPart: 20,
    amount: 45,
  });
  assert.equal(calculateOrderCommission(1000, { type: "none", percentage: 10, fixedPerOrder: 10 }).amount, 0);
  // Rounded to paisa.
  assert.equal(calculateOrderCommission(333.33, pct(3)).amount, 10);
});

test("commission is never more than the order amount and never negative", () => {
  assert.equal(calculateOrderCommission(10, { type: "fixed", percentage: 0, fixedPerOrder: 50 }).amount, 10);
  assert.equal(calculateOrderCommission(10, { type: "percentage_plus_fixed", percentage: 50, fixedPerOrder: 50 }).amount, 10);
  assert.equal(calculateOrderCommission(-500, pct(10)).amount, 0);
  assert.equal(calculateOrderCommission(0, { type: "fixed", percentage: 0, fixedPerOrder: 50 }).amount, 0);
});

test("legacy store setting maps to the same rate as before", () => {
  assert.deepEqual(policyFromLegacySettings({ type: "percentage", value: 4 }), pct(4));
  assert.deepEqual(policyFromLegacySettings({ type: "fixed", value: 25 }), { type: "fixed", percentage: 0, fixedPerOrder: 25 });
  assert.equal(policyFromLegacySettings(null).type, "none");
  assert.equal(policyFromLegacySettings({ type: "none", value: 9 }).type, "none");
  // Deprecated helper keeps producing the old numbers.
  assert.equal(calculateCommission(1000, { type: "percentage", value: 4 }), 40);
  assert.equal(calculateCommission(1000, { type: "fixed", value: 25 }), 25);
});

test("refund returns commission proportionally and never over-returns", () => {
  assert.equal(commissionReturnedOnRefund(100, 2000, 2000), 100); // full refund
  assert.equal(commissionReturnedOnRefund(100, 2000, 500), 25); // 25 % refund
  assert.equal(commissionReturnedOnRefund(100, 2000, 5000), 100); // refund > payment is capped
  assert.equal(commissionReturnedOnRefund(100, 2000, 1500, 25), 75); // second partial refund
  assert.equal(commissionReturnedOnRefund(100, 2000, 2000, 90), 10); // only what's left
  assert.equal(commissionReturnedOnRefund(100, 2000, 2000, 100), 0);
  assert.equal(commissionReturnedOnRefund(0, 2000, 2000), 0);
  assert.equal(commissionReturnedOnRefund(100, 0, 2000), 0);
});

test("describePolicy / samePolicy", () => {
  assert.equal(describePolicy(pct(5)), "5% per order");
  assert.equal(describePolicy({ type: "fixed", percentage: 0, fixedPerOrder: 30 }, (n) => `Rs ${n}`), "Rs 30 per order");
  assert.equal(describePolicy({ type: "percentage_plus_fixed", percentage: 2, fixedPerOrder: 10 }, (n) => `Rs ${n}`), "2% + Rs 10 per order");
  assert.equal(describePolicy({ type: "none", percentage: 0, fixedPerOrder: 0 }), "No commission");
  assert.ok(samePolicy(pct(5), { type: "percentage", percentage: 5.001, fixedPerOrder: 0 }));
  assert.ok(!samePolicy(pct(5), pct(6)));
});

const e = (type: LedgerEntry["type"], amount: number, commissionAmount: number, createdAt: number, orderId = "o1"): LedgerEntry => ({
  orderId,
  type,
  amount,
  commissionAmount,
  createdAt,
});

test("orderLedgerState: paid -> unpaid -> paid counts the order once", () => {
  const entries = [e("payment", 2000, 100, 1), e("reversal", 2000, 100, 2), e("payment", 2000, 100, 3)];
  const s = orderLedgerState(entries);
  assert.equal(s.isPaid, true);
  assert.equal(s.paidAmount, 2000);
  assert.equal(s.duplicatePayments, false);
  const sum = summarizeLedger(entries);
  assert.equal(sum.grossRevenue, 2000);
  assert.equal(sum.commissionNet, 100);
  assert.equal(sum.paidOrders, 1);
});

test("orderLedgerState flags past duplicate payments and unpaid orders", () => {
  assert.equal(orderLedgerState([e("payment", 2000, 100, 1), e("payment", 2000, 100, 2)]).duplicatePayments, true);
  const reversed = orderLedgerState([e("payment", 2000, 100, 1), e("reversal", 2000, 100, 2)]);
  assert.equal(reversed.isPaid, false);
  assert.equal(reversed.paidAmount, 0);
  assert.equal(orderLedgerState([]).isPaid, false);
});

test("summarizeLedger: gross, net, refunds and net commission", () => {
  const entries = [
    e("payment", 2000, 100, 1, "a"),
    e("refund", 500, 25, 2, "a"),
    e("payment", 1000, 50, 3, "b"),
    e("reversal", 1000, 50, 4, "b"),
    e("payment", 3000, 150, 5, "c"),
  ];
  const s = summarizeLedger(entries);
  assert.equal(s.payments, 6000);
  assert.equal(s.reversals, 1000);
  assert.equal(s.refunds, 500);
  assert.equal(s.grossRevenue, 5000);
  assert.equal(s.netRevenue, 4500);
  assert.equal(s.commissionCharged, 300);
  assert.equal(s.commissionReturned, 75);
  assert.equal(s.commissionNet, 225);
  assert.equal(s.paidOrders, 2);
  const refundState = orderLedgerState(entries.filter((x) => x.orderId === "a"));
  assert.equal(refundState.refunded, 500);
  assert.equal(refundState.commissionReturnedOnRefunds, 25);
});

test("summarizeLedger handles floating point without drift", () => {
  const entries = Array.from({ length: 10 }, (_, i) => e("payment", 0.1, 0.01, i, `o${i}`));
  assert.equal(summarizeLedger(entries).grossRevenue, 1);
  assert.equal(summarizeLedger(entries).commissionNet, 0.1);
});

test("buildTrend: zero-filled day buckets, nets reversals/refunds, counts orders", () => {
  const from = Date.UTC(2026, 0, 1);
  const to = Date.UTC(2026, 0, 3, 12);
  const trend = buildTrend(
    [
      e("payment", 1000, 50, from + 1000),
      e("refund", 200, 10, from + DAY + 1000),
      e("payment", 500, 25, from + 2 * DAY + 1000, "o2"),
      e("payment", 999, 0, from - 1000, "outside"),
    ],
    [from + 10, from + 20, from + 2 * DAY, to + DAY],
    from,
    to,
    "day"
  );
  assert.deepEqual(
    trend.map((p) => [p.key, p.netRevenue, p.commissionNet, p.orders]),
    [
      ["2026-01-01", 1000, 50, 2],
      ["2026-01-02", -200, -10, 0],
      ["2026-01-03", 500, 25, 1],
    ]
  );
});

test("buildTrend: month buckets across a year boundary", () => {
  const trend = buildTrend([e("payment", 100, 5, Date.UTC(2026, 0, 15))], [], Date.UTC(2025, 10, 1), Date.UTC(2026, 1, 10), "month");
  assert.deepEqual(trend.map((p) => p.key), ["2025-11", "2025-12", "2026-01", "2026-02"]);
  assert.equal(trend[2].grossRevenue, 100);
});

test("rangeBounds are UTC-aligned", () => {
  const now = Date.UTC(2026, 9, 24, 15, 30);
  assert.equal(rangeBounds("7d", now).from, Date.UTC(2026, 9, 18));
  assert.equal(rangeBounds("30d", now).from, Date.UTC(2026, 8, 25));
  assert.equal(rangeBounds("mtd", now).from, Date.UTC(2026, 9, 1));
  assert.equal(rangeBounds("12m", now).from, Date.UTC(2025, 10, 1));
  assert.equal(rangeBounds("12m", now).granularity, "month");
  assert.equal(rangeBounds("all", now).from, 0);
  assert.equal(rangeBounds("7d", now).to, now);
});
