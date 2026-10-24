/**
 * Platform commission - pure calculation rules (no Firestore), shared by the server-side
 * ledger (src/lib/finance/commission-service.ts), Super Admin UI and tests.
 *
 * Rules (also in README "Commission & Platform Finance"):
 * - A store's commission POLICY is set by Super Admin on the store doc (`commissionPolicy`).
 *   Stores created before this existed keep their legacy rate (tenant siteSettings/commission)
 *   until Super Admin sets a policy - nothing is silently changed.
 * - Commission is charged when an order's payment is RECOGNISED (payment status -> paid),
 *   computed on the server from the order total stored in Firestore, and the policy used is
 *   SNAPSHOTTED onto that ledger entry - later rate changes never rewrite history.
 * - Refunds return commission proportionally (refund / payment); a full payment reversal
 *   returns all of it.
 * - All money is rounded to 2 decimals; commission is never negative and never more than
 *   the amount it is charged on.
 */

import type { CommissionSettings } from "@/types/site-settings";

export type CommissionPolicyType = "none" | "percentage" | "fixed" | "percentage_plus_fixed";

export interface CommissionPolicy {
  type: CommissionPolicyType;
  /** 0-100, used by "percentage" and "percentage_plus_fixed". */
  percentage: number;
  /** Flat amount per order (store currency), used by "fixed" and "percentage_plus_fixed". */
  fixedPerOrder: number;
}

export type CommissionPolicySource = "platform" | "legacy_store_setting" | "default";

/** The policy in force for a store, plus where it came from. */
export interface EffectiveCommissionPolicy extends CommissionPolicy {
  source: CommissionPolicySource;
  /** Increments on every Super Admin change; 0 for legacy/default. */
  version: number;
  setBy?: string;
  setAt?: number;
  reason?: string;
}

/** What gets stored on each ledger entry - enough to re-derive the charge later. */
export interface CommissionSnapshot extends CommissionPolicy {
  source: CommissionPolicySource;
  version: number;
}

export const NO_COMMISSION: CommissionPolicy = { type: "none", percentage: 0, fixedPerOrder: 0 };

export function round2(n: number): number {
  return Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;
}

/** Legacy store-level setting -> policy (keeps old stores' rates exactly as they were). */
export function policyFromLegacySettings(settings: CommissionSettings | null | undefined): CommissionPolicy {
  if (!settings || settings.type === "none") return NO_COMMISSION;
  if (settings.type === "percentage") return { type: "percentage", percentage: Number(settings.value) || 0, fixedPerOrder: 0 };
  if (settings.type === "fixed") return { type: "fixed", percentage: 0, fixedPerOrder: Number(settings.value) || 0 };
  return NO_COMMISSION;
}

export type PolicyValidation = { ok: true; policy: CommissionPolicy } | { ok: false; error: string };

/** Normalises and validates a policy from untrusted input (UI / server action args). */
export function validateCommissionPolicy(input: Partial<CommissionPolicy> | null | undefined): PolicyValidation {
  const type = input?.type;
  if (type !== "none" && type !== "percentage" && type !== "fixed" && type !== "percentage_plus_fixed") {
    return { ok: false, error: "Choose a commission type." };
  }
  const percentage = Number(input?.percentage ?? 0);
  const fixedPerOrder = Number(input?.fixedPerOrder ?? 0);
  if (!Number.isFinite(percentage) || !Number.isFinite(fixedPerOrder)) return { ok: false, error: "Rates must be numbers." };
  if (type === "none") return { ok: true, policy: NO_COMMISSION };
  if ((type === "percentage" || type === "percentage_plus_fixed") && (percentage < 0 || percentage > 100)) {
    return { ok: false, error: "Percentage must be between 0 and 100." };
  }
  if ((type === "fixed" || type === "percentage_plus_fixed") && fixedPerOrder < 0) {
    return { ok: false, error: "Fixed amount can't be negative." };
  }
  return {
    ok: true,
    policy: {
      type,
      percentage: type === "fixed" ? 0 : round2(percentage),
      fixedPerOrder: type === "percentage" ? 0 : round2(fixedPerOrder),
    },
  };
}

export interface CommissionBreakdown {
  percentagePart: number;
  fixedPart: number;
  /** Total commission - capped at the amount it's charged on. */
  amount: number;
}

/** Commission on one order's recognised payment amount. */
export function calculateOrderCommission(orderAmount: number, policy: CommissionPolicy): CommissionBreakdown {
  const base = Math.max(0, round2(orderAmount));
  const usesPct = policy.type === "percentage" || policy.type === "percentage_plus_fixed";
  const usesFixed = policy.type === "fixed" || policy.type === "percentage_plus_fixed";
  const percentagePart = usesPct ? round2((base * Math.max(0, policy.percentage)) / 100) : 0;
  const fixedPart = usesFixed ? round2(Math.max(0, policy.fixedPerOrder)) : 0;
  const amount = Math.min(base, round2(percentagePart + fixedPart));
  return { percentagePart, fixedPart, amount };
}

/** Commission handed back when `refundAmount` of a `paymentAmount` payment is refunded -
 * proportional, never more than what was charged and not yet returned. */
export function commissionReturnedOnRefund(
  chargedCommission: number,
  paymentAmount: number,
  refundAmount: number,
  alreadyReturned = 0
): number {
  if (paymentAmount <= 0 || refundAmount <= 0 || chargedCommission <= 0) return 0;
  const share = Math.min(1, refundAmount / paymentAmount);
  const due = round2(chargedCommission * share);
  return Math.max(0, Math.min(due, round2(chargedCommission - alreadyReturned)));
}

export function describePolicy(p: CommissionPolicy, formatMoney: (n: number) => string = (n) => String(n)): string {
  if (p.type === "none") return "No commission";
  if (p.type === "percentage") return `${p.percentage}% per order`;
  if (p.type === "fixed") return `${formatMoney(p.fixedPerOrder)} per order`;
  return `${p.percentage}% + ${formatMoney(p.fixedPerOrder)} per order`;
}

export function samePolicy(a: CommissionPolicy, b: CommissionPolicy): boolean {
  return a.type === b.type && round2(a.percentage) === round2(b.percentage) && round2(a.fixedPerOrder) === round2(b.fixedPerOrder);
}

/** @deprecated Legacy helper kept for compatibility - new code uses calculateOrderCommission. */
export function calculateCommission(amount: number, settings: CommissionSettings): number {
  return calculateOrderCommission(amount, policyFromLegacySettings(settings)).amount;
}
