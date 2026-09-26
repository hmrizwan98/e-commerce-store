import React from "react";
import LoginForm from "./LoginForm";
import { getCurrentTenant } from "@/lib/tenant/current";

export default async function AdminLoginPage() {
  // Passed through so a self-service "Forgot password?" reset link can be built against a
  // stable root domain + ?slug= instead of this tenant's own admin-{slug} subdomain - see
  // LoginForm.tsx's handleForgotSubmit for why (Firebase's Authorized Domains list can't
  // contain every per-tenant subdomain that will ever be provisioned).
  const tenant = await getCurrentTenant();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-center mb-8">Admin sign in</h1>
        <LoginForm tenantSlug={tenant?.slug} />
      </div>
    </div>
  );
}
