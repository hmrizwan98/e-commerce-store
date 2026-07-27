import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionCookie, isAdminClaim } from "@/lib/firebase/admin-auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/firebase/require-admin";
import AdminShell from "@/components/admin/AdminShell";

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

  return <AdminShell email={decoded.email}>{children}</AdminShell>;
}
