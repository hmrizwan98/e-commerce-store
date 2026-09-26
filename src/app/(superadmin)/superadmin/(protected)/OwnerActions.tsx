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
  const [revealed, setRevealed] = useState<{ label: string; email: string; emailSent: boolean } | null>(null);
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
        setRevealed({ label: "Password reset link", email: result.adminEmail, emailSent: result.emailSent });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to reset password");
      }
    });
  };

  const handleResendWelcome = () => {
    startTransition(async () => {
      try {
        const result = await resendWelcomeEmail(storeId);
        setRevealed({ label: "Welcome email (resent)", email: result.adminEmail, emailSent: result.emailSent });
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
        setRevealed({ label: "Set-password email", email: result.newOwnerEmail, emailSent: result.emailSent });
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
          {revealed.emailSent ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ {revealed.label} sent to this address.
            </span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              ⚠ {revealed.label} could not be delivered (no email provider configured, or the send failed) - check
              server logs.
            </span>
          )}
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
        message="Send this store's admin a secure password reset link by email? They'll set their own new password by following it."
        confirmText="Send Reset Link"
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
