import React, { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function AdminResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-center mb-8">Reset your password</h1>
        <Suspense fallback={null}>
          <ResetPasswordForm loginPath="/admin/login" />
        </Suspense>
      </div>
    </div>
  );
}
