import type {
  StoreNotification,
  StoreNotificationDecision,
  StoreNotificationKind,
} from "@/types/store-notification";

/** Pure helpers (no Firestore) - shared by the server writers and the tests. */

/** One id per (request, decision): replaying the same decision can never notify twice, while
 * a later step on the same request (backup approved -> completed) gets its own notification. */
export function storeNotificationId(kind: StoreNotificationKind, refId: string, decision: StoreNotificationDecision): string {
  return `${kind}__${refId}__${decision}`.replace(/[/]/g, "_");
}

const DECISION_WORD: Record<StoreNotificationDecision, string> = {
  approved: "approved",
  rejected: "rejected",
  completed: "completed",
};

export function buildCommissionDecisionNotification(input: {
  requestId: string;
  approved: boolean;
  proposedLabel: string;
  note?: string;
  decidedBy?: string;
}): Omit<StoreNotification, "id" | "createdAt" | "updatedAt"> {
  const decision: StoreNotificationDecision = input.approved ? "approved" : "rejected";
  return {
    kind: "commission_request_decision",
    decision,
    title: `Your commission change request was ${DECISION_WORD[decision]}`,
    detail: input.approved
      ? `New rate in force: ${input.proposedLabel}.`
      : `Requested: ${input.proposedLabel}. Your current rate stays the same.`,
    ...(input.note ? { note: input.note } : {}),
    refId: input.requestId,
    href: "/admin/settings?tab=Commission",
    read: false,
    ...(input.decidedBy ? { decidedBy: input.decidedBy } : {}),
  };
}

const BACKUP_TEXT: Record<StoreNotificationDecision, string> = {
  approved: "The platform team approved it and is preparing it.",
  rejected: "The platform team rejected it.",
  completed: "The platform team marked it as completed.",
};

export function buildBackupDecisionNotification(input: {
  backupId: string;
  backupType: string;
  decision: StoreNotificationDecision;
  note?: string;
  decidedBy?: string;
}): Omit<StoreNotification, "id" | "createdAt" | "updatedAt"> {
  const what = input.backupType === "import" ? "import" : "export";
  return {
    kind: "backup_request_decision",
    decision: input.decision,
    title: `Your backup ${what} request was ${DECISION_WORD[input.decision]}`,
    detail: BACKUP_TEXT[input.decision],
    ...(input.note ? { note: input.note } : {}),
    refId: input.backupId,
    href: "/admin/settings?tab=Backup",
    read: false,
    ...(input.decidedBy ? { decidedBy: input.decidedBy } : {}),
  };
}
