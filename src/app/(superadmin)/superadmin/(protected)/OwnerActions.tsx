"use client";

import React, { useState, useTransition } from "react";
import toast from "react-hot-toast";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { resetStoreAdminPassword, resendWelcomeEmail, transferOwnership } from "./actions";
import ConfirmModal from "./ConfirmModal";

const inputClass =
  "w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";
const labelClass = "block text-sm font-medium mb-1";

const OwnerActions: React.FC<{ storeId: string }> = ({ storeId }) => {
  const [isPending, startTransition] = useTransition();
  const [revealed, setRevealed] = useState<{ label: string; email: string; password: string } | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [transferError, setTransferError] = useState<string | null>(null);

  // Modals state
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [transferConfirmOpen, setTransferConfirmOpen] = useState(false);

  const executeResetPassword = () => {
    setResetConfirmOpen(false);
    startTransition(async () => {
      try {
        const result = await resetStoreAdminPassword(storeId);
        setRevealed({ label: "New password", email: result.adminEmail, password: result.newPassword });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to reset password");
      }
    });
  };

  const handleResendWelcome = () => {
    startTransition(async () => {
      try {
        const result = await resendWelcomeEmail(storeId);
        setRevealed({ label: "New password (resent)", email: result.adminEmail, password: result.newPassword });
        toast.success("Welcome email resent");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to resend welcome email");
      }
    });
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);
    if (!newOwnerEmail.trim()) {
      setTransferError("New owner email is required.");
      return;
    }
    setTransferConfirmOpen(true);
  };

  const executeTransfer = () => {
    setTransferConfirmOpen(false);
    startTransition(async () => {
      try {
        const result = await transferOwnership(storeId, newOwnerEmail.trim(), newOwnerName.trim() || undefined);
        setRevealed({ label: "New owner password", email: result.newOwnerEmail, password: result.newOwnerTempPassword });
        setTransferOpen(false);
        toast.success("Ownership transferred");
      } catch (err) {
        setTransferError(err instanceof Error ? err.message : "Failed to transfer ownership.");
      }
    });
  };

  if (revealed) {
    return (
      <div className="text-sm space-y-2">
        <div className="text-neutral-500">{revealed.email}</div>
        <div>
          {revealed.label}:{" "}
          <code className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">{revealed.password}</code>
        </div>
        <button type="button" className="text-neutral-500 hover:underline" onClick={() => setRevealed(null)}>
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => setResetConfirmOpen(true)}
          className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          Reset password
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={handleResendWelcome}
          className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          Resend welcome email
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setTransferOpen((v) => !v)}
          className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          Transfer ownership
        </button>
      </div>

      {transferOpen && (
        <form onSubmit={handleTransferSubmit} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4 max-w-md">
          {transferError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{transferError}</div>
          )}
          <div>
            <label className={labelClass}>New owner name</label>
            <input className={inputClass} value={newOwnerName} onChange={(e) => setNewOwnerName(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>New owner email</label>
            <input
              type="email"
              className={inputClass}
              value={newOwnerEmail}
              onChange={(e) => setNewOwnerEmail(e.target.value)}
              required
            />
          </div>
          <ButtonPrimary type="submit" loading={isPending}>
            Confirm transfer
          </ButtonPrimary>
        </form>
      )}

      {/* Modern Confirmation Modals */}
      <ConfirmModal
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={executeResetPassword}
        title="Reset Admin Password?"
        message="Reset this store's admin password? The current password will stop working immediately and a new temporary password will be generated."
        confirmText="Reset Password"
        variant="warning"
        isLoading={isPending}
      />

      <ConfirmModal
        isOpen={transferConfirmOpen}
        onClose={() => setTransferConfirmOpen(false)}
        onConfirm={executeTransfer}
        title="Transfer Store Ownership?"
        message={`Are you sure you want to transfer ownership to "${newOwnerEmail}"? The current owner will immediately lose access to this store.`}
        confirmText="Transfer Ownership"
        variant="danger"
        isLoading={isPending}
      />
    </div>
  );
};

export default OwnerActions;
