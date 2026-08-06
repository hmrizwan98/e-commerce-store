import React from "react";
import LoginForm from "@/app/(admin)/admin/login/LoginForm";

export default function SuperAdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-center mb-8">Super Admin sign in</h1>
        <LoginForm
          redirectTo="/superadmin"
          errorMessage="Invalid email or password, or this account is not a super admin."
        />
      </div>
    </div>
  );
}
