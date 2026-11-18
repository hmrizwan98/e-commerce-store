/**
 * P1 tenant-isolation tests against the LOCAL Firestore emulator only (never production):
 * contact-message inbox and payment-proof attachment.
 *
 * Run (emulator must be running, e.g. `firebase emulators:start --only firestore --project demo-p0`):
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8086 npx tsx --require ./scripts/stub-server-only.cjs --test scripts/test-p1-emulator.ts
 */
import { test, before } from "node:test";
import assert from "node:assert/strict";

const host = process.env.FIRESTORE_EMULATOR_HOST;
if (!host || !/^(127\.0\.0\.1|localhost):\d+$/.test(host)) {
  console.error("REFUSING TO RUN: set FIRESTORE_EMULATOR_HOST to a local emulator (127.0.0.1:<port>). This test writes data.");
  process.exit(1);
}

import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp, type Firestore } from "firebase-admin/firestore";
import { listContactSubmissions, setContactSubmissionRead, markAllContactSubmissionsRead } from "../src/lib/firebase/repositories/contact-submissions";
import { attachPaymentProof } from "../src/lib/firebase/repositories/payment-proofs";

let db: Firestore;
const run = Date.now().toString(36);
const A = `storeA-${run}`;
const B = `storeB-${run}`;

before(() => {
  if (!getApps().length) initializeApp({ projectId: "demo-p0" });
  db = getFirestore();
});

test("inbox: each store sees only its own messages; legacy messages count as unread", async () => {
  const col = db.collection("contactSubmissions");
  const a1 = await col.add({ storeId: A, name: "A1", email: "a1@x.co", message: "old, no read field", createdAt: Timestamp.fromMillis(1000) }); // legacy doc
  const a2 = await col.add({ storeId: A, name: "A2", email: "a2@x.co", message: "new", read: false, createdAt: Timestamp.fromMillis(2000) });
  const b1 = await col.add({ storeId: B, name: "B1", email: "b1@x.co", message: "store B secret", read: false, createdAt: Timestamp.fromMillis(3000) });

  const listA = await listContactSubmissions(db, A);
  assert.deepEqual(listA.map((m) => m.name), ["A2", "A1"], "newest first, only store A");
  assert.ok(listA.every((m) => m.read !== true));
  assert.deepEqual((await listContactSubmissions(db, B)).map((m) => m.name), ["B1"]);
  assert.deepEqual(await listContactSubmissions(db, ""), []);

  // Store B's admin can't mark store A's message (ids are guessable-ish in principle).
  assert.equal(await setContactSubmissionRead(db, B, a1.id, true), false);
  assert.equal((await a1.get()).data()!.read, undefined, "untouched");
  assert.equal(await setContactSubmissionRead(db, A, a1.id, true), true);
  assert.equal((await a1.get()).data()!.read, true);
  assert.equal(await setContactSubmissionRead(db, A, a1.id, false), true);
  assert.equal(await setContactSubmissionRead(db, A, "../x", true), false);

  assert.equal(await markAllContactSubmissionsRead(db, A), 2);
  assert.equal((await a2.get()).data()!.read, true);
  assert.equal((await b1.get()).data()!.read, false, "store B untouched by store A's mark-all");
  assert.equal((await a1.get()).data()!.message, "old, no read field", "existing submission content preserved");
});

const proof = (n: number) => ({ publicId: `folderA/payment-proofs/o1/${n}-x`, format: "jpg", bytes: 1000, uploadedAt: n });

test("payment proof: attaches to the right store's order; unpaid -> proof_submitted; limit enforced", async () => {
  const ref = db.collection("stores").doc(A).collection("orders").doc("o1");
  await ref.set({ orderNumber: "WR-1", paymentMethod: "bank_transfer", paymentStatus: "unpaid", orderStatus: "pending", total: 500 });
  assert.deepEqual(await attachPaymentProof(db, A, "o1", proof(1)), { ok: true });
  let o = (await ref.get()).data()!;
  assert.equal(o.paymentStatus, "proof_submitted");
  assert.equal(o.paymentProofs.length, 1);
  assert.equal(o.total, 500, "other order fields untouched");
  assert.equal(o.paymentStatusHistory.at(-1).status, "proof_submitted");

  await attachPaymentProof(db, A, "o1", proof(2));
  await attachPaymentProof(db, A, "o1", proof(3));
  const fourth = await attachPaymentProof(db, A, "o1", proof(4));
  assert.equal(fourth.ok, false);
  o = (await ref.get()).data()!;
  assert.equal(o.paymentProofs.length, 3);
});

test("payment proof: other store / COD / paid orders are refused and unchanged", async () => {
  // Store B can't attach to store A's order id (the order lives under stores/A).
  assert.deepEqual(await attachPaymentProof(db, B, "o1", proof(9)), { ok: false, error: "Order not found." });

  const cod = db.collection("stores").doc(A).collection("orders").doc("cod1");
  await cod.set({ paymentMethod: "cod", paymentStatus: "unpaid", orderStatus: "pending" });
  assert.equal((await attachPaymentProof(db, A, "cod1", proof(1))).ok, false);
  assert.equal((await cod.get()).data()!.paymentProofs, undefined);

  const paid = db.collection("stores").doc(A).collection("orders").doc("paid1");
  await paid.set({ paymentMethod: "jazzcash", paymentStatus: "paid", orderStatus: "confirmed" });
  assert.equal((await attachPaymentProof(db, A, "paid1", proof(1))).ok, false);
  assert.equal((await paid.get()).data()!.paymentStatus, "paid");

  // A proof_submitted order keeps its status (no history spam).
  const ps = db.collection("stores").doc(A).collection("orders").doc("ps1");
  await ps.set({ paymentMethod: "bank_transfer", paymentStatus: "proof_submitted", orderStatus: "pending" });
  assert.deepEqual(await attachPaymentProof(db, A, "ps1", proof(1)), { ok: true });
  const after = (await ps.get()).data()!;
  assert.equal(after.paymentStatus, "proof_submitted");
  assert.equal(after.paymentStatusHistory, undefined);
});

test("concurrent uploads can't exceed the per-order limit", async () => {
  const ref = db.collection("stores").doc(A).collection("orders").doc("race1");
  await ref.set({ paymentMethod: "bank_transfer", paymentStatus: "unpaid", orderStatus: "pending" });
  const results = await Promise.all([1, 2, 3, 4, 5, 6].map((n) => attachPaymentProof(db, A, "race1", proof(n))));
  assert.equal(results.filter((r) => r.ok).length, 3);
  assert.equal((await ref.get()).data()!.paymentProofs.length, 3);
});
