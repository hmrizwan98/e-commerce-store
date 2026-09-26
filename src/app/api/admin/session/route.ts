import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { createSessionCookie } from "@/lib/firebase/admin-auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/firebase/require-admin";
import { getCurrentTenant } from "@/lib/tenant/current";

const MAX_AGE_SECONDS = 5 * 24 * 60 * 60; // 5 days

/** Defense-in-depth alongside the sameSite:"lax" cookie - rejects a cross-site request
 * whose Origin doesn't match the host this request actually arrived on. Same-origin
 * requests (the only kind LoginForm ever makes) always carry a matching Origin header. */
function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin requests from some browsers/tools omit Origin
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const { idToken } = await req.json();
  if (!idToken || typeof idToken !== "string") {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  try {
    const decodedToken = await adminAuth().verifyIdToken(idToken);
    const referer = req.headers.get("referer") || "";
    const isSuperAdminPortal = referer.includes("/superadmin");

    if (isSuperAdminPortal) {
      if (decodedToken.role !== "superadmin" && decodedToken.role !== "super_admin") {
        return NextResponse.json(
          { error: "This account does not have Super Admin permissions." },
          { status: 403 }
        );
      }
    } else {
      // Store Admin Portal
      const role = decodedToken.role;
      if (role !== "admin") {
        if (role === "superadmin" || role === "super_admin") {
          return NextResponse.json(
            { error: "This is a Super Admin account. Please sign in at /superadmin/login." },
            { status: 403 }
          );
        }
        return NextResponse.json(
          {
            error:
              "This account is not an admin for any store. Please assign admin permissions using 'npm run set-admin -- email password --tenant slug' or create the store in Super Admin panel.",
          },
          { status: 403 }
        );
      }

      if (!decodedToken.tenantId) {
        return NextResponse.json(
          {
            error:
              "This admin account is missing a store assignment (tenantId). Please run 'npm run set-admin -- email password --tenant slug'.",
          },
          { status: 403 }
        );
      }

      // Check tenantId matching current tenant - this MUST mirror requireCurrentTenant()'s
      // strictness exactly (resolved + active tenant required), or a login can succeed here
      // and then silently bounce back to /admin/login when the protected layout's
      // requireCurrentTenant() throws for the same request a moment later (the tenant
      // genuinely can't be resolved on this host, or the store is suspended) - the user
      // never sees why. Failing here instead means the error is visible on the login page.
      const tenant = await getCurrentTenant();
      if (!tenant) {
        return NextResponse.json(
          {
            error:
              "Could not determine which store this login belongs to. Please sign in from your store's own admin login page.",
          },
          { status: 403 }
        );
      }
      if (decodedToken.tenantId !== tenant.id) {
        let targetSlug: string | null = null;
        let targetName: string | null = null;
        try {
          const targetDoc = await adminDb().collection("stores").doc(decodedToken.tenantId).get();
          if (targetDoc.exists) {
            const data = targetDoc.data();
            targetSlug = data?.slug || null;
            targetName = data?.name || data?.slug || null;
          }
        } catch {}

        return NextResponse.json(
          {
            error: targetSlug
              ? `This admin account belongs to store "${targetName || targetSlug}". Please use its store-specific login page below.`
              : `This admin account belongs to a different store ("${decodedToken.tenantId}") and cannot access this store ("${tenant.slug}").`,
            targetSlug,
            targetName,
          },
          { status: 403 }
        );
      }

      if (tenant.status !== "active") {
        return NextResponse.json(
          { error: "This store is currently suspended. Please contact support." },
          { status: 403 }
        );
      }
    }

    const sessionCookie = await createSessionCookie(idToken);
    cookies().set(ADMIN_SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE_SECONDS,
      path: "/",
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[admin/session] verifyIdToken failed:", err);
    return NextResponse.json({ error: "Your session could not be verified. Please sign in again." }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  cookies().set(ADMIN_SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return NextResponse.json({ ok: true });
}
