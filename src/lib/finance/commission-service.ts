import "server-only";
import { AggregateField, FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { docData, stripUndefined } from "@/lib/firebase/repositories/utils";
import { createSuperAdminNotification, setNotificationStatus } from "@/lib/firebase/repositories/superadmin-notifications";
import {
  NO_COMMISSION,
  calculateOrderCommission,
  commissionReturnedOnRefund,
  policyFromLegacySettings,
  round2,
  samePolicy,
  validateCommissionPolicy,
  type CommissionPolicy,
  type CommissionSnapshot,
  type EffectiveCommissionPolicy,
} from "./commission";
import { groupByOrder, orderLedgerState, type LedgerEntry } from "./ledger-math";
import type { CommissionSettings } from "@/types/site-settings";
import type { CommissionAuditLog, CommissionChangeRequest } from "@/types/commission";
import type { Order, PaymentMethod } from "@/types/order";
import type { Store } from "@/types/store";
import type { Transaction } from "@/types/transaction";

/**
 * Server-authoritative commission + ledger. Every function takes a storeId resolved on the
 * server (never a client-sent rate/total); writes go through Firestore transactions so the
 * same payment can't be recorded twice and a decision can't be applied twice.
 */

const AUDIT = "commissionAuditLogs";
const REQUESTS = "commissionChangeRequests";

export type ServiceResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

export interface Actor {
  uid: string;
  email?: string;
}

const storeRef = (storeId: string) => adminDb().collection("stores").doc(storeId);
const ledgerCol = (storeId: string) => storeRef(storeId).collection("transactions");

function plainPolicy(p: CommissionPolicy): CommissionPolicy {
  return { type: p.type, percentage: p.percentage, fixedPerOrder: p.fixedPerOrder };
}

/** Policy in force: Super Admin's platform policy, else the store's legacy setting, else none. */
export async function getEffectiveCommissionPolicy(storeId: string, store?: Store | null): Promise<EffectiveCommissionPolicy> {
  const s = store ?? docData<Store>(await storeRef(storeId).get());
  if (s?.commissionPolicy) return { ...s.commissionPolicy, source: "platform" };
  const legacy = await storeRef(storeId).collection("siteSettings").doc("commission").get();
  if (legacy.exists) {
    return { ...policyFromLegacySettings(legacy.data() as CommissionSettings), source: "legacy_store_setting", version: 0 };
  }
  return { ...NO_COMMISSION, source: "default", version: 0 };
}

function snapshotOf(p: EffectiveCommissionPolicy): CommissionSnapshot {
  return { ...plainPolicy(p), source: p.source, version: p.version };
}

// ---------------------------------------------------------------- policy changes

/** Super Admin sets a store's policy (applies immediately, audited). */
export async function setStoreCommissionPolicy(input: {
  storeId: string;
  policy: Partial<CommissionPolicy>;
  reason: string;
  actor: Actor;
}): Promise<ServiceResult<EffectiveCommissionPolicy>> {
  const validated = validateCommissionPolicy(input.policy);
  if (!validated.ok) return validated;
  const reason = (input.reason ?? "").trim();
  if (reason.length < 3) return { ok: false, error: "Please give a reason for this change (it's kept in the audit trail)." };
  const store = docData<Store>(await storeRef(input.storeId).get());
  if (!store) return { ok: false, error: "Store not found." };
  const previous = await getEffectiveCommissionPolicy(input.storeId, store);
  if (previous.source === "platform" && samePolicy(previous, validated.policy)) {
    return { ok: false, error: "That's already the store's current rate." };
  }
  const result = await applyPolicy({ store, previous, policy: validated.policy, reason, actor: input.actor, action: "policy_set" });
  return { ok: true, data: result };
}

async function applyPolicy(input: {
  store: Store;
  previous: EffectiveCommissionPolicy;
  policy: CommissionPolicy;
  reason: string;
  actor: Actor;
  action: "policy_set" | "change_approved";
  requestId?: string;
  tx?: FirebaseFirestore.Transaction;
}): Promise<EffectiveCommissionPolicy> {
  const now = Date.now();
  const record: EffectiveCommissionPolicy = {
    ...plainPolicy(input.policy),
    source: "platform",
    version: (input.store.commissionPolicy?.version ?? 0) + 1,
    setBy: input.actor.email || input.actor.uid,
    setAt: now,
    reason: input.reason,
  };
  const audit: Omit<CommissionAuditLog, "id" | "createdAt"> = {
    storeId: input.store.id,
    storeName: input.store.name,
    action: input.action,
    previous: plainPolicy(input.previous),
    next: plainPolicy(input.policy),
    actorUid: input.actor.uid,
    actorEmail: input.actor.email,
    actorRole: "superadmin",
    reason: input.reason,
    approvalStatus: input.action === "change_approved" ? "approved" : "applied",
    requestId: input.requestId,
  };
  const auditRef = adminDb().collection(AUDIT).doc();
  const write = (tx: FirebaseFirestore.Transaction) => {
    tx.update(storeRef(input.store.id), { commissionPolicy: stripUndefined(record), updatedAt: FieldValue.serverTimestamp() });
    tx.create(auditRef, { ...stripUndefined(audit), createdAt: FieldValue.serverTimestamp() });
  };
  if (input.tx) write(input.tx);
  else await adminDb().runTransaction(async (tx) => write(tx));
  return record;
}

/** Store Admin asks for a different rate - recorded, Super Admin notified, NOT applied. */
export async function requestCommissionChange(input: {
  storeId: string;
  proposed: Partial<CommissionPolicy>;
  reason: string;
  actor: Actor;
}): Promise<ServiceResult<CommissionChangeRequest>> {
  const validated = validateCommissionPolicy(input.proposed);
  if (!validated.ok) return validated;
  const reason = (input.reason ?? "").trim();
  if (reason.length < 3) return { ok: false, error: "Please explain why you're requesting this change." };
  const store = docData<Store>(await storeRef(input.storeId).get());
  if (!store) return { ok: false, error: "Store not found." };
  const current = await getEffectiveCommissionPolicy(input.storeId, store);
  if (samePolicy(current, validated.policy)) return { ok: false, error: "That's already your current rate." };

  const pending = await adminDb().collection(REQUESTS).where("storeId", "==", input.storeId).where("status", "==", "pending").limit(1).get();
  if (!pending.empty) return { ok: false, error: "You already have a pending request. Please wait for the platform to review it." };

  const reqRef = adminDb().collection(REQUESTS).doc();
  const request: Omit<CommissionChangeRequest, "id"> = {
    storeId: input.storeId,
    storeName: store.name,
    current: plainPolicy(current),
    proposed: validated.policy,
    reason,
    status: "pending",
    requestedBy: input.actor.uid,
    requestedByEmail: input.actor.email,
  };
  await adminDb().runTransaction(async (tx) => {
    tx.create(reqRef, { ...stripUndefined(request), createdAt: FieldValue.serverTimestamp() });
    tx.create(adminDb().collection(AUDIT).doc(), {
      ...stripUndefined({
        storeId: input.storeId,
        storeName: store.name,
        action: "change_requested",
        previous: plainPolicy(current),
        next: validated.policy,
        actorUid: input.actor.uid,
        actorEmail: input.actor.email,
        actorRole: "store_admin",
        reason,
        approvalStatus: "pending",
        requestId: reqRef.id,
      } satisfies Omit<CommissionAuditLog, "id" | "createdAt">),
      createdAt: FieldValue.serverTimestamp(),
    });
  });
  await createSuperAdminNotification({
    type: "commission_change_request",
    storeId: input.storeId,
    storeName: store.name,
    title: `${store.name} requested a commission change`,
    detail: reason,
    refId: reqRef.id,
    href: `/${input.storeId}/edit?tab=Commission`,
  }).catch((err) => console.error("[commission] notification failed", err));
  return { ok: true, data: { id: reqRef.id, ...request } };
}

/** Super Admin approves (applies) or rejects a pending request - exactly once. */
export async function resolveCommissionChangeRequest(input: {
  requestId: string;
  approve: boolean;
  note?: string;
  actor: Actor;
}): Promise<ServiceResult> {
  const reqRef = adminDb().collection(REQUESTS).doc(input.requestId);
  const pre = docData<CommissionChangeRequest>(await reqRef.get());
  if (!pre) return { ok: false, error: "Request not found." };
  const previous = await getEffectiveCommissionPolicy(pre.storeId);
  const note = (input.note ?? "").trim();
  try {
    await adminDb().runTransaction(async (tx) => {
      const snap = await tx.get(reqRef);
      const req = docData<CommissionChangeRequest>(snap);
      if (!req || req.status !== "pending") throw new Error("ALREADY_RESOLVED");
      const store = docData<Store>(await tx.get(storeRef(req.storeId)));
      if (!store) throw new Error("STORE_MISSING");
      if (input.approve) {
        await applyPolicy({
          store,
          previous,
          policy: req.proposed,
          reason: note || `Approved store request: ${req.reason}`,
          actor: input.actor,
          action: "change_approved",
          requestId: req.id,
          tx,
        });
      } else {
        tx.create(adminDb().collection(AUDIT).doc(), {
          ...stripUndefined({
            storeId: req.storeId,
            storeName: req.storeName,
            action: "change_rejected",
            previous: plainPolicy(previous),
            next: req.proposed,
            actorUid: input.actor.uid,
            actorEmail: input.actor.email,
            actorRole: "superadmin",
            reason: note || "Rejected",
            approvalStatus: "rejected",
            requestId: req.id,
          } satisfies Omit<CommissionAuditLog, "id" | "createdAt">),
          createdAt: FieldValue.serverTimestamp(),
        });
      }
      tx.update(reqRef, {
        status: input.approve ? "approved" : "rejected",
        resolvedBy: input.actor.email || input.actor.uid,
        ...(note ? { resolutionNote: note } : {}),
        resolvedAt: Date.now(),
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === "ALREADY_RESOLVED") return { ok: false, error: "This request was already decided." };
    if (err instanceof Error && err.message === "STORE_MISSING") return { ok: false, error: "Store not found." };
    throw err;
  }
  await setNotificationStatus("commission_change_request", input.requestId, input.approve ? "approved" : "rejected").catch(() => {});
  return { ok: true, data: undefined };
}

// ---------------------------------------------------------------- ledger writes

async function ledgerEntriesInTx(tx: FirebaseFirestore.Transaction, storeId: string, orderId: string): Promise<LedgerEntry[]> {
  const snap = await tx.get(ledgerCol(storeId).where("orderId", "==", orderId));
  return snap.docs.map((d) => docData<Transaction>(d)).filter((t): t is Transaction => t !== null) as LedgerEntry[];
}

/**
 * Order payment recognised (status -> paid). Idempotent: if this order already has a
 * recognised payment, nothing is written. The amount comes from the order document in
 * Firestore (read inside the transaction), the commission from the store's effective
 * policy, which is snapshotted on the entry.
 */
export async function recordPaymentRecognized(input: {
  storeId: string;
  orderId: string;
  actorUid: string;
}): Promise<{ created: boolean; commission: number }> {
  const policy = await getEffectiveCommissionPolicy(input.storeId);
  return adminDb().runTransaction(async (tx) => {
    const order = docData<Order>(await tx.get(ledgerCol(input.storeId).parent!.collection("orders").doc(input.orderId)));
    if (!order) throw new Error("Order not found.");
    const state = orderLedgerState(await ledgerEntriesInTx(tx, input.storeId, input.orderId));
    if (state.isPaid) return { created: false, commission: state.paidCommission };
    const amount = round2(order.total);
    const breakdown = calculateOrderCommission(amount, policy);
    tx.create(ledgerCol(input.storeId).doc(), {
      storeId: input.storeId,
      orderId: input.orderId,
      type: "payment",
      amount,
      commissionAmount: breakdown.amount,
      commissionPolicy: stripUndefined(snapshotOf(policy)),
      method: order.paymentMethod as PaymentMethod,
      status: "completed",
      actorUid: input.actorUid,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { created: true, commission: breakdown.amount };
  });
}

/** Order set back from paid (correction) - reverses the recognised payment and its
 * remaining commission. No-op if nothing is recognised. */
export async function recordPaymentReversed(input: { storeId: string; orderId: string; actorUid: string; note?: string }): Promise<{ created: boolean }> {
  return adminDb().runTransaction(async (tx) => {
    const state = orderLedgerState(await ledgerEntriesInTx(tx, input.storeId, input.orderId));
    if (!state.isPaid) return { created: false };
    const order = docData<Order>(await tx.get(ledgerCol(input.storeId).parent!.collection("orders").doc(input.orderId)));
    tx.create(ledgerCol(input.storeId).doc(), {
      ...stripUndefined({
        storeId: input.storeId,
        orderId: input.orderId,
        type: "reversal",
        amount: round2(Math.max(0, state.paidAmount - state.refunded)),
        commissionAmount: round2(Math.max(0, state.paidCommission - state.commissionReturnedOnRefunds)),
        method: order?.paymentMethod,
        status: "completed",
        actorUid: input.actorUid,
        note: input.note,
      }),
      createdAt: FieldValue.serverTimestamp(),
    });
    return { created: true };
  });
}

/** Money returned to the customer. Only what was actually recognised can be refunded, and
 * commission comes back proportionally. Returns the amount actually recorded (0 when the
 * order had no recognised payment - the order-side refund state is still the caller's job). */
export async function recordRefund(input: {
  storeId: string;
  orderId: string;
  amount: number;
  actorUid: string;
  note?: string;
}): Promise<{ recorded: number; commissionReturned: number }> {
  return adminDb().runTransaction(async (tx) => {
    const state = orderLedgerState(await ledgerEntriesInTx(tx, input.storeId, input.orderId));
    if (!state.isPaid) return { recorded: 0, commissionReturned: 0 };
    const refundable = round2(state.paidAmount - state.refunded);
    const amount = round2(Math.min(Math.max(0, input.amount), refundable));
    if (amount <= 0) return { recorded: 0, commissionReturned: 0 };
    const commissionReturned = commissionReturnedOnRefund(state.paidCommission, state.paidAmount, amount, state.commissionReturnedOnRefunds);
    const order = docData<Order>(await tx.get(ledgerCol(input.storeId).parent!.collection("orders").doc(input.orderId)));
    tx.create(ledgerCol(input.storeId).doc(), {
      ...stripUndefined({
        storeId: input.storeId,
        orderId: input.orderId,
        type: "refund",
        amount,
        commissionAmount: commissionReturned,
        method: order?.paymentMethod,
        status: "completed",
        actorUid: input.actorUid,
        note: input.note,
      }),
      createdAt: FieldValue.serverTimestamp(),
    });
    return { recorded: amount, commissionReturned };
  });
}

// ---------------------------------------------------------------- reads (Super Admin)

/** All-time ledger totals for one store via aggregation (no document reads). */
export async function getStoreLedgerTotals(storeId: string) {
  const col = ledgerCol(storeId);
  const agg = (type: string) =>
    col
      .where("type", "==", type)
      .aggregate({ amount: AggregateField.sum("amount"), commission: AggregateField.sum("commissionAmount"), count: AggregateField.count() })
      .get()
      .then((s) => s.data());
  const [p, rv, rf] = await Promise.all([agg("payment"), agg("reversal"), agg("refund")]);
  const payments = p.amount ?? 0;
  const reversals = rv.amount ?? 0;
  const refunds = rf.amount ?? 0;
  const charged = p.commission ?? 0;
  const returned = (rv.commission ?? 0) + (rf.commission ?? 0);
  return {
    payments: round2(payments),
    reversals: round2(reversals),
    refunds: round2(refunds),
    grossRevenue: round2(payments - reversals),
    netRevenue: round2(payments - reversals - refunds),
    commissionCharged: round2(charged),
    commissionReturned: round2(returned),
    commissionNet: round2(charged - returned),
    paymentEntries: p.count ?? 0,
  };
}

export interface ReconciliationReport {
  paidOrders: number;
  ledgerPaidOrders: number;
  /** Order is marked paid but has no recognised payment in the ledger (revenue missing). */
  missingPayments: string[];
  /** Ledger has more than one live payment for the order (double counted - usually entries
   * written before duplicate protection existed). */
  duplicatePayments: string[];
  /** Ledger recognises a payment but the order is no longer paid/refunded. */
  orphanPayments: string[];
  /** Recognised amount differs from the order total. */
  amountMismatches: string[];
}

/** Compares a store's paid orders with its ledger. Read-only - never rewrites history. */
export async function reconcileStoreLedger(storeId: string): Promise<ReconciliationReport> {
  const ordersCol = storeRef(storeId).collection("orders");
  const [paidSnap, ledgerSnap] = await Promise.all([
    ordersCol.where("paymentStatus", "in", ["paid", "refunded"]).select("total", "paymentStatus").get(),
    ledgerCol(storeId).select("orderId", "type", "amount", "commissionAmount", "createdAt").get(),
  ]);
  const paid = new Map(paidSnap.docs.map((d) => [d.id, d.data() as { total: number; paymentStatus: string }]));
  const entries = ledgerSnap.docs.map((d) => docData<Transaction>(d)).filter((t): t is Transaction => t !== null) as LedgerEntry[];
  const byOrder = groupByOrder(entries);
  const report: ReconciliationReport = {
    paidOrders: Array.from(paid.values()).filter((o) => o.paymentStatus === "paid").length,
    ledgerPaidOrders: 0,
    missingPayments: [],
    duplicatePayments: [],
    orphanPayments: [],
    amountMismatches: [],
  };
  byOrder.forEach((list, orderId) => {
    const state = orderLedgerState(list);
    if (state.isPaid) report.ledgerPaidOrders++;
    if (state.duplicatePayments) report.duplicatePayments.push(orderId);
    if (state.isPaid && !paid.has(orderId)) report.orphanPayments.push(orderId);
    const order = paid.get(orderId);
    if (state.isPaid && order && round2(order.total) !== round2(state.paidAmount)) report.amountMismatches.push(orderId);
  });
  paid.forEach((o, orderId) => {
    if (o.paymentStatus === "paid" && !orderLedgerState(byOrder.get(orderId) ?? []).isPaid) report.missingPayments.push(orderId);
  });
  return report;
}

export async function getCommissionAuditLogs(storeId: string, limit = 50): Promise<CommissionAuditLog[]> {
  const snap = await adminDb().collection(AUDIT).where("storeId", "==", storeId).limit(300).get();
  return snap.docs
    .map((d) => docData<CommissionAuditLog>(d))
    .filter((l): l is CommissionAuditLog => l !== null)
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    .slice(0, limit);
}

export async function getCommissionRequests(storeId: string): Promise<CommissionChangeRequest[]> {
  const snap = await adminDb().collection(REQUESTS).where("storeId", "==", storeId).limit(100).get();
  return snap.docs
    .map((d) => docData<CommissionChangeRequest>(d))
    .filter((r): r is CommissionChangeRequest => r !== null)
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

/** Newest ledger entries with their commission breakdown (order-level view). */
export async function getRecentLedgerEntries(storeId: string, limit = 30): Promise<Transaction[]> {
  const snap = await ledgerCol(storeId).orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs.map((d) => docData<Transaction>(d)).filter((t): t is Transaction => t !== null);
}

export async function getPendingCommissionRequest(storeId: string): Promise<CommissionChangeRequest | null> {
  const snap = await adminDb().collection(REQUESTS).where("storeId", "==", storeId).where("status", "==", "pending").limit(1).get();
  return snap.empty ? null : docData<CommissionChangeRequest>(snap.docs[0]);
}

export interface StoreCommissionOverview {
  effective: EffectiveCommissionPolicy;
  audit: CommissionAuditLog[];
  requests: CommissionChangeRequest[];
  recent: Transaction[];
  totals: Awaited<ReturnType<typeof getStoreLedgerTotals>>;
  reconciliation: ReconciliationReport;
  currency: { currency?: string; currencySymbol?: string };
}

/** Everything the Super Admin "Commission" tab shows for one store (server-side). */
export async function getStoreCommissionOverview(storeId: string): Promise<StoreCommissionOverview> {
  const [effective, audit, requests, recent, totals, reconciliation, general] = await Promise.all([
    getEffectiveCommissionPolicy(storeId),
    getCommissionAuditLogs(storeId),
    getCommissionRequests(storeId),
    getRecentLedgerEntries(storeId),
    getStoreLedgerTotals(storeId),
    reconcileStoreLedger(storeId),
    storeRef(storeId).collection("siteSettings").doc("general").get(),
  ]);
  const g = (general.data() ?? {}) as { currency?: string; currencySymbol?: string };
  return { effective, audit, requests, recent, totals, reconciliation, currency: { currency: g.currency, currencySymbol: g.currencySymbol } };
}
