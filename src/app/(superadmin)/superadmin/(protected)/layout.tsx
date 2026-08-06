import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionCookie } from "@/lib/firebase/admin-auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/firebase/require-admin";
import SuperAdminShell from "@/components/superadmin/SuperAdminShell";

export default async function SuperAdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionCookie = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  const decoded = sessionCookie ? await verifySessionCookie(sessionCookie) : null;

  const role = decoded?.role;
  if (!decoded || (role !== "superadmin" && role !== "super_admin")) {
    redirect("/superadmin/login");
  }

  return <SuperAdminShell email={decoded.email}>{children}</SuperAdminShell>;
}
