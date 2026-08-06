import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionCookie, isAdminClaim } from "@/lib/firebase/admin-auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/firebase/require-admin";
import { RETURN_SESSION_COOKIE } from "@/lib/firebase/impersonation";
import { requireCurrentTenant } from "@/lib/tenant/current";
import AdminShell from "@/components/admin/AdminShell";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionCookie = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  const decoded = sessionCookie ? await verifySessionCookie(sessionCookie) : null;

  if (!decoded || !isAdminClaim(decoded)) {
    redirect("/admin/login");
  }

  // Cross-check the admin's own tenantId claim against the store resolved for
  // this request's host - without this, every admin *read* (page.tsx calling
  // a repository function directly, never requireAdmin()) would trust the
  // host alone to decide which store's data to show, so a stale session
  // cookie visited against a different tenant's host would leak that
  // tenant's data. requireCurrentTenant() also now rejects suspended/archived
  // stores, so this doubles as that guard for the whole admin panel.
  let tenant;
  try {
    tenant = await requireCurrentTenant();
  } catch {
    redirect("/admin/login");
  }
  if (decoded.tenantId !== tenant.id) {
    redirect("/admin/login");
  }

  // Purely additive/cosmetic - doesn't affect any check above. Presence of this cookie
  // just means a Super Admin is currently viewing as this store's admin (see
  // /api/admin/impersonate/start and /return).
  const isImpersonating = Boolean(cookies().get(RETURN_SESSION_COOKIE)?.value);

  return (
    <>
      {isImpersonating && <ImpersonationBanner />}
      <AdminShell email={decoded.email}>{children}</AdminShell>
    </>
  );
}
