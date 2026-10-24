import type { CommissionPolicy } from "@/lib/finance/commission";

export type CommissionApprovalStatus = "applied" | "pending" | "approved" | "rejected";

/** Top-level `commissionAuditLogs/{id}` - server-written only (Admin SDK), never edited.
 * One record per rate change or change request decision. */
export interface CommissionAuditLog {
  id: string;
  storeId: string;
  storeName?: string;
  action: "policy_set" | "change_requested" | "change_approved" | "change_rejected";
  previous: CommissionPolicy | null;
  next: CommissionPolicy;
  actorUid: string;
  actorRole: "superadmin" | "store_admin";
  actorEmail?: string;
  reason: string;
  approvalStatus: CommissionApprovalStatus;
  requestId?: string;
  createdAt?: number;
}

/** Top-level `commissionChangeRequests/{id}` - a Store Admin's request to change their
 * store's rate. Never takes effect until Super Admin approves it. */
export interface CommissionChangeRequest {
  id: string;
  storeId: string;
  storeName?: string;
  current: CommissionPolicy;
  proposed: CommissionPolicy;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestedBy: string;
  requestedByEmail?: string;
  resolvedBy?: string;
  resolutionNote?: string;
  createdAt?: number;
  resolvedAt?: number;
}
