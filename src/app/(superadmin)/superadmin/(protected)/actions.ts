"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { waitUntil } from "@vercel/functions";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { requireSuperAdmin } from "@/lib/firebase/require-super-admin";
import { checkRateLimit } from "@/lib/firebase/rate-limit";
import { stripUndefined } from "@/lib/firebase/repositories/utils";
import { isSlugTaken, isDomainTaken, getStoreById } from "@/lib/firebase/repositories/stores";
import { getProductIdsForStore } from "@/lib/firebase/repositories/products";
import { DEFAULT_THEME } from "@/lib/firebase/repositories/themes";
import { getWelcomeEmailService } from "@/lib/email";
import { logStoreActivity } from "@/lib/firebase/repositories/store-activity-logs";
import { installDefaultTheme } from "@/lib/firebase/services/theme-installer";
import { provisionCloudinaryMetadata } from "@/lib/firebase/services/cloudinary-provisioner";
import { provisionDeploymentMetadata } from "@/lib/firebase/services/deployment-provisioner";
import { syncDomainSettings } from "@/lib/superadmin/domain-settings";
import { getPlatformBaseUrl } from "@/lib/platform/base-url";
import { buildTenantUrl, buildTenantAdminUrl, buildResetPasswordLinkUrl } from "@/lib/platform/tenant-url";
import { getActiveDeploymentProvider } from "@/lib/deployment/provider-registry";
import { logDeploymentEvent } from "@/lib/firebase/repositories/deployment-logs";
import { attachDomainToProvider, detachDomainFromProvider } from "@/lib/domains/custom-domain-service";
import { deleteAllByPrefix } from "@/lib/cloudinary/delete";
import {
  generateTraceId,
  logActionError,
  toActionError,
  type ActionError,
  type ActionErrorCode,
} from "@/lib/errors/action-error";
import { createStageTimer } from "@/lib/errors/stage-timer";
import {
  getPlatformEmailSettings,
  updatePlatformEmailSettings,
  type PlatformEmailSettings,
} from "@/lib/firebase/repositories/platform-settings";
import { CURRENCY_OPTIONS } from "@/lib/constants/location-options";
import type { StoreStatus } from "@/types/store";

const HOSTNAME_PATTERN = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

async function enforceRateLimit(uid: string) {
  const result = await checkRateLimit("superadmin-sensitive", uid);
  if (!result.allowed) {
    throw new Error(
      `Too many sensitive actions - try again in ${Math.ceil((result.retryAfterSeconds ?? 60) / 60)} minute(s).`
    );
  }
}

/** Revokes the store admin's existing sessions/refresh tokens so a just-suspended or
 * just-deleted store's admin can't keep operating on a stale-but-unexpired session. */
async function revokeStoreAdminSessions(storeId: string) {
  const store = await getStoreById(storeId);
  if (!store?.email) return;
  try {
    const userRecord = await adminAuth().getUserByEmail(store.email);
    await adminAuth().revokeRefreshTokens(userRecord.uid);
  } catch (err) {
    // "No matching Auth user" (store created without one) is expected and silent;
    // anything else (network/permission failure) means the admin's existing
    // session was NOT revoked despite the store being suspended/archived - log it
    // so that isn't invisible.
    console.error(`[revokeStoreAdminSessions] failed for store ${storeId}`, err);
  }
}

const COLLECTION = "stores";

export interface StoreFormInput {
  name: string;
  brandName?: string;
  slug: string;
  email?: string;
  ownerName?: string;
  phone?: string;
  country?: string;
  currency?: string;
  timezone?: string;
  language?: string;
  storageLimit?: number;
  firebaseProject?: string;
  notes?: string;
  expiryDate?: number;
  domains?: string[];
  status?: StoreStatus;
  themeId?: string;
  adminTheme?: string;
}

export type CreateStoreResult =
  | {
      success: true;
      storeId: string;
      adminEmail: string;
      /** Whether the welcome/set-password email was confirmed delivered - undefined when
       * the send happens in the background (createStore()'s waitUntil) and isn't known yet
       * by the time this resolves. Never includes a plaintext password - the owner sets
       * their own via the emailed secure link (see /admin/reset-password). */
      emailSent?: boolean;
    }
  | { success: false; error: ActionError };

export interface ResetAdminPasswordResult {
  adminEmail: string;
  /** True if the email provider confirmed delivery - false means it only logged
   * server-side (no RESEND_API_KEY configured) or the send attempt failed. */
  emailSent: boolean;
  /** Set when the reset link itself couldn't be generated - nothing was emailed. */
  error?: string;
}

function revalidateStoreList() {
  try {
    revalidatePath("/superadmin");
    revalidatePath("/superadmin/stores");
    revalidatePath("/stores");
    revalidatePath("/");
  } catch (err) {
    console.error("[revalidateStoreList] revalidation error (ignored):", err);
  }
}

/** Builds the set-password link emailed to a store admin, pointing DIRECTLY at Webriiz's own
 * /admin/reset-password page (ResetPasswordForm.tsx reads ?oobCode= and calls
 * confirmPasswordReset()). generatePasswordResetLink() is deliberately called WITHOUT
 * actionCodeSettings: passing a continue URL makes Firebase validate its host against the
 * project's Authorized Domains (auth/unauthorized-continue-uri when missing), and the link it
 * returns lands on Firebase's own hosted reset page rather than ours anyway. Only the
 * one-time oobCode is taken from Firebase's link. */
async function generateSetPasswordLink(email: string, platformBaseUrl: string, slug: string): Promise<string> {
  const firebaseLink = await adminAuth().generatePasswordResetLink(email);
  const oobCode = new URL(firebaseLink).searchParams.get("oobCode");
  if (!oobCode) throw new Error("Firebase did not return a password reset code.");
  const link = new URL(buildResetPasswordLinkUrl(platformBaseUrl, slug));
  link.searchParams.set("mode", "resetPassword");
  link.searchParams.set("oobCode", oobCode);
  return link.toString();
}

function generateTempPassword(): string {
  return randomBytes(9).toString("base64url");
}

/** Trims/lowercases/dedupes a raw domains list, validates each looks like a real hostname, and
 * validates none is already in use by another store. */
async function normalizeAndValidateDomains(domains: string[] | undefined, excludeStoreId?: string): Promise<string[]> {
  const normalized = Array.from(
    new Set((domains ?? []).map((d) => d.trim().toLowerCase()).filter(Boolean))
  );
  for (const domain of normalized) {
    if (!HOSTNAME_PATTERN.test(domain)) {
      throw new Error(`"${domain}" doesn't look like a valid domain (e.g. abcstore.com).`);
    }
  }
  const taken = await Promise.all(normalized.map((domain) => isDomainTaken(domain, excludeStoreId)));
  const takenIndex = taken.findIndex(Boolean);
  if (takenIndex !== -1) {
    throw new Error(`Domain "${normalized[takenIndex]}" is already in use by another store.`);
  }
  return normalized;
}

/** Rolls back a partially-provisioned store (Auth user + Store doc) so a failure mid-way
 * through createStore()/cloneStore() never leaves an orphaned tenant with no admin, and
 * never permanently blocks retrying the same slug. */
async function cleanupPartialStore(ref: FirebaseFirestore.DocumentReference, uid: string): Promise<void> {
  await adminAuth()
    .deleteUser(uid)
    .catch((err) => console.error(`[cleanupPartialStore] failed to delete auth user ${uid}`, err));
  await ref.delete().catch((err) => console.error(`[cleanupPartialStore] failed to delete store doc ${ref.id}`, err));
}

interface ProvisionShellInput {
  name: string;
  brandName?: string;
  slug: string;
  email: string;
  ownerName?: string;
  domains?: string[];
  status?: StoreStatus;
  /** Defaults to DEFAULT_THEME.id (the fallback sentinel). createStore() passes the
   * chosen theme preset's key instead - installDefaultTheme() then writes the actual
   * matching themes/{key} doc right after the shell. cloneStore() overrides this field
   * again post-shell to match its source store, so its value here doesn't matter. */
  themeId?: string;
  extra?: Record<string, unknown>;
}

interface ProvisionShellResult {
  storeId: string;
  ref: FirebaseFirestore.DocumentReference;
  storeDocRef: FirebaseFirestore.DocumentReference;
  userRecord: import("firebase-admin/auth").UserRecord;
  adminTempPassword: string;
  slug: string;
  domains: string[];
}

/**
 * Shared first half of provisioning a tenant, used by both createStore() and cloneStore():
 * validates the slug/email/domains, creates the Auth user FIRST (surfaces "email already in
 * use" before anything is persisted to Firestore), then writes the base Store doc. Callers
 * are responsible for seeding subcollections afterward inside their own try/catch that calls
 * cleanupPartialStore() on failure - this function only rolls back its own Store-doc write.
 */
async function provisionStoreShell(
  input: ProvisionShellInput,
  stage: (name: string, extra?: Record<string, unknown>) => void
): Promise<ProvisionShellResult> {
  const slug = input.slug.trim().toLowerCase();
  if (!slug) throw new Error("Slug is required.");
  if (await isSlugTaken(slug)) throw new Error(`Slug "${slug}" is already in use.`);
  if (!input.email) throw new Error("Email is required to create the store's admin user.");
  const domains = await normalizeAndValidateDomains(input.domains);

  const adminTempPassword = generateTempPassword();
  const userRecord = await adminAuth().createUser({
    email: input.email,
    password: adminTempPassword,
    displayName: input.ownerName || input.name,
  });
  stage("AUTH_CREATED", { uid: userRecord.uid });

  const ref = adminDb().collection(COLLECTION).doc();
  const storeId = ref.id;

  try {
    await ref.set({
      ...stripUndefined({
        name: input.name,
        brandName: input.brandName,
        slug,
        email: input.email,
        ownerName: input.ownerName,
        ...input.extra,
      }),
      nameLower: input.name.trim().toLowerCase(),
      domains,
      domainSettings: syncDomainSettings(undefined, domains),
      websiteUrl: buildTenantUrl(getPlatformBaseUrl(), slug),
      adminUrl: buildTenantAdminUrl(getPlatformBaseUrl(), slug),
      cloudinaryFolder: slug,
      themeId: input.themeId ?? DEFAULT_THEME.id,
      status: input.status ?? ("active" satisfies StoreStatus),
      provisioningStatus: "provisioning",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    stage("STORE_CREATED", { storeId });
  } catch (err) {
    await cleanupPartialStore(ref, userRecord.uid);
    throw err;
  }

  return {
    storeId,
    ref,
    storeDocRef: adminDb().collection(COLLECTION).doc(storeId),
    userRecord,
    adminTempPassword,
    slug,
    domains,
  };
}

/** Classifies provisionStoreShell()'s known thrown messages into a stable
 * error code - the message text itself is unchanged/reused as-is (same
 * validation, same wording), just no longer relies on Next.js's production
 * error redaction to reach the client. */
function classifyShellError(message: string): ActionErrorCode {
  if (message.includes("Slug") && message.includes("already in use")) return "SLUG_TAKEN";
  if (message.includes("already in use by another account")) return "EMAIL_TAKEN";
  if (message.includes("Domain") && message.includes("already in use")) return "DOMAIN_TAKEN";
  return "UNKNOWN";
}

/**
 * Provisions a new tenant, split into a fast synchronous critical path and a
 * slow background phase. Synchronous: Auth user, the Store doc, a
 * store-name-aware general-settings doc (site-settings.ts's
 * DEFAULT_GENERAL_SETTINGS otherwise falls back to this template's own
 * placeholder brand name), and the owner's admin/tenantId claim - everything
 * required for the store to exist and its owner to log in. Background (via
 * waitUntil): the chosen default theme preset (real Theme doc + homepage/
 * nav/banners/testimonials/FAQs/CMS pages - see theme-installer.ts),
 * Cloudinary/deployment metadata, the activity log entry, and the welcome
 * email - all non-essential for the store to be usable, and slow enough
 * (Auth user creation alone was observed taking ~9s in production) that
 * doing them synchronously risked the whole request exceeding the
 * platform's function timeout.
 */
export async function createStore(input: StoreFormInput): Promise<CreateStoreResult> {
  const traceId = generateTraceId();
  const stage = createStageTimer(traceId);
  stage("START", { name: input.name, slug: input.slug });

  try {
    let decoded: Awaited<ReturnType<typeof requireSuperAdmin>>;
    try {
      decoded = await requireSuperAdmin();
      await enforceRateLimit(decoded.uid);
    } catch (err) {
      logActionError(traceId, "AUTH_CHECK", err);
      const message = err instanceof Error ? err.message : "Not authorized to create a store.";
      const code: ActionErrorCode = message.toLowerCase().includes("too many") ? "RATE_LIMITED" : "UNAUTHORIZED";
      return { success: false, error: toActionError(traceId, "AUTH_CHECK", code, message) };
    }

    if (!input.email) {
      return {
        success: false,
        error: toActionError(traceId, "VALIDATION", "VALIDATION_FAILED", "Email is required to create the store's admin user."),
      };
    }
    const platformBaseUrl = getPlatformBaseUrl();

    let shell: ProvisionShellResult;
    try {
      shell = await provisionStoreShell(
        {
          name: input.name,
          brandName: input.brandName,
          slug: input.slug,
          email: input.email,
          ownerName: input.ownerName,
          domains: input.domains,
          status: input.status,
          themeId: "premium-luxury",
          extra: {
            phone: input.phone,
            country: input.country,
            currency: input.currency,
            timezone: input.timezone,
            language: input.language,
            storageLimit: input.storageLimit,
            firebaseProject: input.firebaseProject,
            notes: input.notes,
            expiryDate: input.expiryDate,
            adminTheme: input.adminTheme || "indigo",
          },
        },
        stage
      );
    } catch (err) {
      logActionError(traceId, "PROVISION_SHELL", err);
      const message = err instanceof Error ? err.message : "Could not create the store.";
      return { success: false, error: toActionError(traceId, "PROVISION_SHELL", classifyShellError(message), message) };
    }
    const { storeId, ref, storeDocRef, userRecord, slug } = shell;

    // --- Synchronous critical path ends here: only what's required for the
    // store to exist and its owner to be able to log in.
    try {
      const storeName = input.brandName?.trim() || input.name;
      const currencyCode = input.currency || "USD";
      const currencyOption = CURRENCY_OPTIONS.find((c) => c.code === currencyCode);
      const currencySymbol = currencyOption?.symbol || "$";

      await storeDocRef
        .collection("siteSettings")
        .doc("general")
        .set({
          storeName,
          storeEmail: input.email,
          currency: currencyCode,
          currencySymbol,
          taxRatePercent: 0,
          taxInclusive: false,
        });

      await storeDocRef
        .collection("siteSettings")
        .doc("branding")
        .set({
          adminTheme: input.adminTheme || "indigo",
        }, { merge: true });

      stage("SITE_SETTINGS_CREATED", { storeId });

      await adminAuth().setCustomUserClaims(userRecord.uid, { role: "admin", tenantId: storeId });
      stage("OWNER_ASSIGNED", { storeId });

      // Synchronously install default theme & seed data so storefront is 100% populated on day one
      await installDefaultTheme(storeDocRef, {}, stage);
      stage("THEME_INSTALL_FINISHED", { storeId });
    } catch (err) {
      logActionError(traceId, "OWNER_ASSIGNED", err);
      await cleanupPartialStore(ref, userRecord.uid);
      return {
        success: false,
        error: toActionError(
          traceId,
          "OWNER_ASSIGNED",
          "PROVISIONING_FAILED",
          "Could not finish setting up the store owner account. Please try again."
        ),
      };
    }

    revalidateStoreList();

    // --- Background provisioning (runs after the response is sent).
    waitUntil(
      (async () => {
        try {
          let host = "webriiz.com";
          try {
            host = new URL(platformBaseUrl).host;
          } catch {
            host = platformBaseUrl.replace(/^https?:\/\//, "").split("/")[0] || "webriiz.com";
          }

          await Promise.all([
            provisionCloudinaryMetadata(storeDocRef, slug).then(() => stage("CLOUDINARY_PROVISIONED", { storeId })),
            provisionDeploymentMetadata(storeDocRef, {
              websiteUrl: buildTenantUrl(platformBaseUrl, slug),
              slug,
              rootDomain: host,
            }).then(() => stage("DEPLOYMENT_TRIGGERED", { storeId })),
            logStoreActivity(storeId, "created", decoded.uid).then(() => stage("ACTIVITY_LOGGED", { storeId })),
            syncProviderDomains(storeId, [], Array.from(new Set((input.domains ?? []).map((d) => d.trim().toLowerCase()).filter(Boolean)))).catch((err) =>
              console.error(`[createStore] provider domain sync failed for ${storeId}`, err)
            ),
            (async () => {
              const setPasswordLink = await generateSetPasswordLink(input.email!, platformBaseUrl, slug);
              return getWelcomeEmailService().sendWelcomeEmail({
                storeName: input.brandName?.trim() || input.name,
                storeUrl: buildTenantUrl(platformBaseUrl, slug),
                adminUrl: buildTenantAdminUrl(platformBaseUrl, slug),
                email: input.email!,
                setPasswordLink,
              });
            })()
              .catch((err) => console.error("[welcome-email] failed to send", err))
              .then(() => stage("WELCOME_EMAIL_SENT", { storeId })),
          ]);

          await ref.update({ provisioningStatus: "complete", updatedAt: FieldValue.serverTimestamp() });
          stage("SUCCESS", { storeId });
        } catch (err) {
          logActionError(traceId, "BACKGROUND_PROVISIONING", err);
          const actionError = toActionError(
            traceId,
            "BACKGROUND_PROVISIONING",
            "PROVISIONING_FAILED",
            "Some store setup steps (theme, deployment metadata, or welcome email) did not finish. The store itself is usable - check its Deployment tab for detail."
          );
          await ref
            .update({ provisioningStatus: "failed", provisioningError: actionError, updatedAt: FieldValue.serverTimestamp() })
            .catch((updateErr) => console.error(`[action:${traceId}] failed to record provisioning failure`, updateErr));
          await logDeploymentEvent(storeId, "error", actionError.message).catch(() => {});
        }
      })()
    );

    return { success: true, storeId, adminEmail: input.email };
  } catch (globalErr) {
    logActionError(traceId, "GLOBAL_CREATE_STORE", globalErr);
    const message = globalErr instanceof Error ? globalErr.message : "An unexpected server error occurred during store creation.";
    return {
      success: false,
      error: toActionError(traceId, "GLOBAL_CREATE_STORE", "UNKNOWN", message),
    };
  }
}

export interface CloneStoreInput {
  name: string;
  slug: string;
  ownerName?: string;
  email: string;
}

/**
 * Duplicates a store's CMS/homepage/navigation/settings/theme metadata into a brand-new
 * tenant (its own Auth user, its own Store doc) via provisionStoreShell() - the exact same
 * shell createStore() uses. Deliberately never reads or writes products/categories/brands/
 * orders/customers/reviews - only structural/content configuration is copied.
 */
export async function cloneStore(sourceStoreId: string, input: CloneStoreInput): Promise<CreateStoreResult> {
  const decoded = await requireSuperAdmin();
  await enforceRateLimit(decoded.uid);
  if (!input.email) throw new Error("Email is required to create the cloned store's admin user.");
  const platformBaseUrl = getPlatformBaseUrl();

  const source = await getStoreById(sourceStoreId);
  if (!source) throw new Error("Source store not found.");

  const { storeId, ref, storeDocRef, userRecord, slug } = await provisionStoreShell(
    {
      name: input.name,
      slug: input.slug,
      email: input.email,
      ownerName: input.ownerName,
      status: "active",
    },
    () => {}
  );

  try {
    const sourceDocRef = adminDb().collection(COLLECTION).doc(sourceStoreId);

    const generalSnap = await sourceDocRef.collection("siteSettings").doc("general").get();
    if (generalSnap.exists) {
      await storeDocRef
        .collection("siteSettings")
        .doc("general")
        .set({ ...generalSnap.data(), storeName: input.name, storeEmail: input.email });
    }

    const homepageSnap = await sourceDocRef.collection("homepageSections").get();
    if (!homepageSnap.empty) {
      const batch = adminDb().batch();
      homepageSnap.docs.forEach((doc) => {
        batch.set(storeDocRef.collection("homepageSections").doc(), {
          ...doc.data(),
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
    }

    await Promise.all(
      (["header", "footer"] as const).map(async (menuId) => {
        const menuSnap = await sourceDocRef.collection("menus").doc(menuId).get();
        if (menuSnap.exists) {
          await storeDocRef
            .collection("menus")
            .doc(menuId)
            .set({ ...menuSnap.data(), updatedAt: FieldValue.serverTimestamp() });
        }
      })
    );

    const pagesSnap = await sourceDocRef.collection("pages").get();
    if (!pagesSnap.empty) {
      const batch = adminDb().batch();
      pagesSnap.docs.forEach((doc) => {
        batch.set(storeDocRef.collection("pages").doc(), {
          ...doc.data(),
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
    }

    // Theme metadata only, matching the source - no theme document is copied/created.
    await ref.update({ themeId: source.themeId ?? DEFAULT_THEME.id });

    // New store, new infra - Cloudinary folders and deployment status are per-store
    // provisioning concerns, not content, so they're freshly provisioned rather than copied.
    await provisionCloudinaryMetadata(storeDocRef, slug);
    await provisionDeploymentMetadata(storeDocRef, {
      websiteUrl: buildTenantUrl(platformBaseUrl, slug),
      slug,
      rootDomain: new URL(platformBaseUrl).host,
    });

    await adminAuth().setCustomUserClaims(userRecord.uid, { role: "admin", tenantId: storeId });
  } catch (err) {
    await cleanupPartialStore(ref, userRecord.uid);
    throw err;
  }

  revalidateStoreList();
  await logStoreActivity(storeId, "cloned", decoded.uid, { sourceStoreId });

  let emailSent = false;
  {
    const setPasswordLink = await generateSetPasswordLink(input.email, platformBaseUrl, slug)
      .catch((err) => {
        console.error("[welcome-email] failed to generate set-password link", err);
        return null;
      });
    if (setPasswordLink) {
      const { delivered } = await getWelcomeEmailService()
        .sendWelcomeEmail({
          storeName: input.name,
          storeUrl: buildTenantUrl(platformBaseUrl, slug),
          adminUrl: buildTenantAdminUrl(platformBaseUrl, slug),
          email: input.email,
          setPasswordLink,
        })
        .catch((err) => {
          console.error("[welcome-email] failed to send", err);
          return { delivered: false };
        });
      emailSent = delivered;
    }
  }

  return { success: true, storeId, adminEmail: input.email, emailSent };
}

/** Keeps the hosting provider in step with a store's domains[] after Super Admin edits:
 * newly added domains (+ admin./www.) are attached, removed ones detached. Best-effort and
 * logged to the store's deployment log - a provider hiccup never blocks saving the store.
 * No-op when the provider isn't configured. */
async function syncProviderDomains(storeId: string, before: string[], after: string[]): Promise<void> {
  const provider = getActiveDeploymentProvider();
  if (!provider.isConfigured()) return;
  for (const hostname of after.filter((d) => !before.includes(d))) {
    const result = await attachDomainToProvider(hostname);
    await logDeploymentEvent(
      storeId,
      result.ok ? "info" : "warning",
      result.ok ? `Connected ${hostname} (and admin.${hostname}) to hosting.` : `Could not connect ${hostname} to hosting: ${result.error}`,
      provider.id
    ).catch(() => {});
  }
  for (const hostname of before.filter((d) => !after.includes(d))) {
    await detachDomainFromProvider(hostname);
    await logDeploymentEvent(storeId, "info", `Disconnected ${hostname} from hosting.`, provider.id).catch(() => {});
  }
}

export async function updateStore(id: string, input: StoreFormInput): Promise<void> {
  const decoded = await requireSuperAdmin();
  await enforceRateLimit(decoded.uid);
  const domains = await normalizeAndValidateDomains(input.domains, id);
  const before = await getStoreById(id);
  await adminDb()
    .collection(COLLECTION)
    .doc(id)
    .update({
      ...stripUndefined({
        name: input.name,
        brandName: input.brandName,
        email: input.email,
        ownerName: input.ownerName,
        phone: input.phone,
        country: input.country,
        currency: input.currency,
        timezone: input.timezone,
        language: input.language,
        storageLimit: input.storageLimit,
        firebaseProject: input.firebaseProject,
        notes: input.notes,
        expiryDate: input.expiryDate,
      }),
      nameLower: input.name.trim().toLowerCase(),
      domains,
      domainSettings: syncDomainSettings(before?.domainSettings, domains),
      updatedAt: FieldValue.serverTimestamp(),
    });
  revalidateStoreList();
  await logStoreActivity(id, "updated", decoded.uid);
  await syncProviderDomains(id, before?.domains ?? [], domains).catch((err) =>
    console.error(`[updateStore] provider domain sync failed for ${id}`, err)
  );
  if (input.themeId && before && input.themeId !== before.themeId) {
    // No theme picker UI exists yet - this only gives the log type a real trigger for
    // when theme selection ships; StoreFormInput.themeId isn't set from any form today.
    await adminDb().collection(COLLECTION).doc(id).update({ themeId: input.themeId });
    await logStoreActivity(id, "theme_changed", decoded.uid, { from: before.themeId ?? "", to: input.themeId });
  }
}

/** Flips which hostname in domainSettings is primary (only one at a time) - domains[]
 * itself (and tenant resolution) is unaffected, this only marks intent for a future
 * real DNS/redirect setup. */
export async function setPrimaryDomain(storeId: string, hostname: string): Promise<void> {
  const decoded = await requireSuperAdmin();
  const store = await getStoreById(storeId);
  if (!store) throw new Error("Store not found.");
  if (!store.domainSettings?.[hostname]) throw new Error(`"${hostname}" is not a domain on this store.`);

  const domainSettings: Record<string, (typeof store.domainSettings)[string]> = {};
  for (const [key, value] of Object.entries(store.domainSettings)) {
    domainSettings[key] = { ...value, isPrimary: key === hostname };
  }

  await adminDb()
    .collection(COLLECTION)
    .doc(storeId)
    .update({ domainSettings, updatedAt: FieldValue.serverTimestamp() });
  await logStoreActivity(storeId, "primary_domain_changed", decoded.uid, { hostname });
  revalidateStoreList();
}

/** Removes a single custom domain from a store - previously the only way to remove a
 * domain was replacing the whole domainsText textarea on the General tab. Reuses
 * syncDomainSettings() (already drops entries for hostnames no longer present) rather
 * than duplicating that reconciliation logic. Auto-promotes the first remaining
 * domain to primary if the removed one was primary, so a store isn't left with no
 * primary custom domain after a routine removal. */
export async function removeDomain(storeId: string, hostname: string): Promise<void> {
  const decoded = await requireSuperAdmin();
  const store = await getStoreById(storeId);
  if (!store) throw new Error("Store not found.");
  if (!store.domains?.includes(hostname)) throw new Error(`"${hostname}" is not a domain on this store.`);

  const wasPrimary = store.domainSettings?.[hostname]?.isPrimary ?? false;
  const domains = store.domains.filter((d) => d !== hostname);
  const domainSettings = syncDomainSettings(store.domainSettings, domains);
  if (wasPrimary && domains.length > 0) {
    const [firstRemaining] = domains;
    domainSettings[firstRemaining] = { ...domainSettings[firstRemaining], isPrimary: true };
  }

  await adminDb()
    .collection(COLLECTION)
    .doc(storeId)
    .update({
      domains,
      domainSettings,
      // A Store Admin self-service domain being removed by Super Admin: clear that request too.
      ...(store.customDomainRequest?.hostname === hostname ? { customDomainRequest: FieldValue.delete() } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    });
  await detachDomainFromProvider(hostname).catch((err) => console.error(`[removeDomain] detach failed for ${hostname}`, err));
  await logStoreActivity(storeId, "domain_removed", decoded.uid, { hostname });
  revalidateStoreList();
}

/** Re-runs domain verification through the currently-active deployment provider
 * (architecture-only stub today - see src/lib/deployment/provider-registry.ts). Writes
 * the result back into domainSettings and records it in both the deployment-logs
 * architecture and the store's activity log, so this is a real, exercised code path
 * ready to carry a genuine DNS/SSL check later without any caller changes. */
export async function reverifyDomain(storeId: string, hostname: string): Promise<void> {
  const decoded = await requireSuperAdmin();
  const store = await getStoreById(storeId);
  if (!store) throw new Error("Store not found.");
  const setting = store.domainSettings?.[hostname];
  if (!setting) throw new Error(`"${hostname}" is not a domain on this store.`);

  const provider = getActiveDeploymentProvider();
  const result = await provider.verifyDomain(hostname);
  const domainSettings = {
    ...store.domainSettings,
    [hostname]: { ...setting, dnsStatus: result.dnsStatus, sslStatus: result.sslStatus },
  };

  await adminDb()
    .collection(COLLECTION)
    .doc(storeId)
    .update({ domainSettings, updatedAt: FieldValue.serverTimestamp() });
  await logDeploymentEvent(storeId, result.verified ? "info" : "warning", result.message, provider.id);
  await logStoreActivity(storeId, "domain_reverified", decoded.uid, { hostname });
  revalidateStoreList();
}

/** Triggers a deployment through the currently-active deployment provider
 * (architecture-only stub today). Rounds out the "ready for future Vercel
 * integration" requirement with an actual exercised code path rather than
 * orphaned scaffolding. */
export async function triggerDeployment(storeId: string): Promise<void> {
  const decoded = await requireSuperAdmin();
  const store = await getStoreById(storeId);
  if (!store) throw new Error("Store not found.");

  const provider = getActiveDeploymentProvider();
  const result = await provider.triggerDeployment(storeId);
  await logDeploymentEvent(storeId, result.success ? "info" : "warning", result.message, provider.id);
  await logStoreActivity(storeId, "deployment_status_changed", decoded.uid, { success: String(result.success) });
  revalidateStoreList();
}

export async function toggleStoreAssistant(id: string, enabled: boolean): Promise<void> {
  const decoded = await requireSuperAdmin();
  await enforceRateLimit(decoded.uid);
  await adminDb().collection(COLLECTION).doc(id).update({
    assistantEnabled: enabled,
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidateStoreList();
  await logStoreActivity(id, "updated", decoded.uid, { assistantEnabled: String(enabled) });
}

export async function setStoreStatus(id: string, status: StoreStatus): Promise<void> {
  const decoded = await requireSuperAdmin();
  await enforceRateLimit(decoded.uid);
  await adminDb().collection(COLLECTION).doc(id).update({ status, updatedAt: FieldValue.serverTimestamp() });
  if (status !== "active") {
    // Custom claims/status changes only take effect on a fresh ID token - revoke the
    // store admin's existing sessions so a suspension takes effect immediately instead
    // of waiting for their current session to naturally expire.
    await revokeStoreAdminSessions(id);
  }
  revalidateStoreList();
  await logStoreActivity(id, status === "active" ? "activated" : "suspended", decoded.uid);
}

/** Soft delete only - hides the store from active lists/search and stops its slug/domains from
 * resolving to a tenant (getCurrentTenant() refuses "archived" stores), but keeps every
 * stores/{id}/* subcollection and Cloudinary asset intact so this is reversible via restoreStore(). */
export async function archiveStore(id: string): Promise<void> {
  const decoded = await requireSuperAdmin();
  await enforceRateLimit(decoded.uid);
  await adminDb()
    .collection(COLLECTION)
    .doc(id)
    .update({
      status: "archived" satisfies StoreStatus,
      archivedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  await revokeStoreAdminSessions(id);
  revalidateStoreList();
  await logStoreActivity(id, "archived", decoded.uid);
}

/** Reverses archiveStore() - restores an archived store to "active" or "suspended"
 * (caller's choice), which automatically re-enables its slug/domain resolution. */
export async function restoreStore(id: string, status: "active" | "suspended" = "active"): Promise<void> {
  const decoded = await requireSuperAdmin();
  await enforceRateLimit(decoded.uid);
  await adminDb()
    .collection(COLLECTION)
    .doc(id)
    .update({
      status: status satisfies StoreStatus,
      archivedAt: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  revalidateStoreList();
  await logStoreActivity(id, "restored", decoded.uid);
}

/** Emails a secure one-time set-password link (never a plaintext password) to the
 * store's admin address - the admin sets their own new password by following it. */
export async function resetStoreAdminPassword(storeId: string): Promise<ResetAdminPasswordResult> {
  const decoded = await requireSuperAdmin();
  await enforceRateLimit(decoded.uid);
  const store = await getStoreById(storeId);
  if (!store) throw new Error("Store not found.");
  if (!store.email) throw new Error("This store has no admin email on file.");

  const platformBaseUrl = getPlatformBaseUrl();
  let setPasswordLink: string;
  try {
    setPasswordLink = await generateSetPasswordLink(store.email, platformBaseUrl, store.slug);
  } catch (err) {
    // Returned, not thrown - Next.js replaces a thrown Server Action error's message with a
    // generic one in production, which hid the real Firebase failure from the Super Admin.
    console.error("[reset-password] failed to generate set-password link", err);
    const code = (err as { code?: string })?.code;
    return {
      adminEmail: store.email,
      emailSent: false,
      error: `Could not generate the password reset link${code ? ` (${code})` : ""}. No email was sent.`,
    };
  }
  const { delivered } = await getWelcomeEmailService()
    .sendWelcomeEmail({
      storeName: store.brandName?.trim() || store.name,
      storeUrl: store.websiteUrl ?? buildTenantUrl(platformBaseUrl, store.slug),
      adminUrl: store.adminUrl ?? buildTenantAdminUrl(platformBaseUrl, store.slug),
      email: store.email,
      setPasswordLink,
    })
    .catch((err) => {
      console.error("[reset-password] failed to send email", err);
      return { delivered: false };
    });
  await logStoreActivity(storeId, "password_reset", decoded.uid);

  return { adminEmail: store.email, emailSent: delivered };
}

/** Emails a fresh secure set-password link, same delivery path as store creation. */
export async function resendWelcomeEmail(storeId: string): Promise<ResetAdminPasswordResult> {
  const decoded = await requireSuperAdmin();
  await enforceRateLimit(decoded.uid);
  const store = await getStoreById(storeId);
  if (!store) throw new Error("Store not found.");
  if (!store.email) throw new Error("This store has no admin email on file.");

  const platformBaseUrl = getPlatformBaseUrl();
  let setPasswordLink: string;
  try {
    setPasswordLink = await generateSetPasswordLink(store.email, platformBaseUrl, store.slug);
  } catch (err) {
    // Returned, not thrown - Next.js replaces a thrown Server Action error's message with a
    // generic one in production, which hid the real Firebase failure from the Super Admin.
    console.error("[welcome-email] failed to generate set-password link", err);
    const code = (err as { code?: string })?.code;
    return {
      adminEmail: store.email,
      emailSent: false,
      error: `Could not generate the password reset link${code ? ` (${code})` : ""}. No email was sent.`,
    };
  }
  const { delivered } = await getWelcomeEmailService()
    .sendWelcomeEmail({
      storeName: store.brandName?.trim() || store.name,
      storeUrl: store.websiteUrl ?? buildTenantUrl(platformBaseUrl, store.slug),
      adminUrl: store.adminUrl ?? buildTenantAdminUrl(platformBaseUrl, store.slug),
      email: store.email,
      setPasswordLink,
    })
    .catch((err) => {
      console.error("[welcome-email] failed to resend", err);
      return { delivered: false };
    });

  await logStoreActivity(storeId, "welcome_email_resent", decoded.uid);
  return { adminEmail: store.email, emailSent: delivered };
}

export interface TransferOwnershipResult {
  newOwnerEmail: string;
  /** True if the set-password email was confirmed delivered - see ResetAdminPasswordResult. */
  emailSent: boolean;
}

/** Strips the old owner's admin access to this store immediately (claims cleared + sessions
 * revoked) and finds-or-creates a Firebase Auth user for the new owner, emailing them a secure
 * set-password link (never a plaintext password) so a transfer never leaves two people able to
 * administer the same store, nor a password anyone but the new owner ever sees. */
export async function transferOwnership(
  storeId: string,
  newOwnerEmail: string,
  newOwnerName?: string
): Promise<TransferOwnershipResult> {
  const decoded = await requireSuperAdmin();
  await enforceRateLimit(decoded.uid);
  const store = await getStoreById(storeId);
  if (!store) throw new Error("Store not found.");
  const email = newOwnerEmail.trim().toLowerCase();
  if (!email) throw new Error("New owner email is required.");

  if (store.email && store.email !== email) {
    try {
      const oldUser = await adminAuth().getUserByEmail(store.email);
      await adminAuth().setCustomUserClaims(oldUser.uid, {});
      await adminAuth().revokeRefreshTokens(oldUser.uid);
    } catch (err) {
      // "No matching Auth user" for the old owner is expected and silent;
      // anything else means the old owner's admin access was NOT stripped
      // despite the transfer proceeding - log it so that isn't invisible.
      console.error(`[transferOwnership] failed to strip old owner access for store ${storeId}`, err);
    }
  }

  const throwawayPassword = generateTempPassword();
  let newUser;
  try {
    newUser = await adminAuth().getUserByEmail(email);
    await adminAuth().updateUser(newUser.uid, { password: throwawayPassword });
  } catch {
    newUser = await adminAuth().createUser({
      email,
      password: throwawayPassword,
      displayName: newOwnerName || email,
    });
  }
  await adminAuth().setCustomUserClaims(newUser.uid, { role: "admin", tenantId: storeId });

  await adminDb()
    .collection(COLLECTION)
    .doc(storeId)
    .update({
      ...stripUndefined({ ownerName: newOwnerName }),
      email,
      updatedAt: FieldValue.serverTimestamp(),
    });

  revalidateStoreList();
  await logStoreActivity(storeId, "ownership_changed", decoded.uid, { from: store.email ?? "", to: email });

  const platformBaseUrl = getPlatformBaseUrl();
  const setPasswordLink = await generateSetPasswordLink(email, platformBaseUrl, store.slug);
  const { delivered } = await getWelcomeEmailService()
    .sendWelcomeEmail({
      storeName: store.brandName?.trim() || store.name,
      storeUrl: store.websiteUrl ?? buildTenantUrl(platformBaseUrl, store.slug),
      adminUrl: store.adminUrl ?? buildTenantAdminUrl(platformBaseUrl, store.slug),
      email,
      setPasswordLink,
    })
    .catch((err) => {
      console.error("[transferOwnership] failed to send set-password email", err);
      return { delivered: false };
    });

  return { newOwnerEmail: email, emailSent: delivered };
}

/** Root-level collections keyed by a `storeId` FIELD rather than path-scoped under
 * stores/{id} - see the plan's audit. Every one of these uses "storeId" as the field name. */
const ROOT_STOREID_COLLECTIONS = [
  "storeActivityLogs",
  "payouts",
  "blogPosts",
  "newsletterSubscribers",
  "contactSubmissions",
  "analyticsEvents",
  "activeSessions",
  "visitors",
] as const;

/** Deletes every doc in `collectionName` matching `storeId`, batched at Firestore's 500-
 * writes-per-commit limit, looping until none remain - shared by all 8 root-level
 * storeId-keyed collections deleteStore() cleans up (one function, not eight copies). */
async function deleteWhereStoreId(collectionName: string, storeId: string): Promise<number> {
  let deleted = 0;
  while (true) {
    const snap = await adminDb().collection(collectionName).where("storeId", "==", storeId).limit(500).get();
    if (snap.empty) break;
    const batch = adminDb().batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deleted += snap.docs.length;
    if (snap.docs.length < 500) break;
  }
  return deleted;
}

/** `reviews` has no storeId field (only productId) - joins indirectly via this store's own
 * product IDs, captured by the caller BEFORE anything is deleted. Chunked at 30 per
 * Firestore's `in`-query limit. */
async function deleteReviewsForProducts(productIds: string[]): Promise<number> {
  let deleted = 0;
  for (let i = 0; i < productIds.length; i += 30) {
    const chunk = productIds.slice(i, i + 30);
    const snap = await adminDb().collection("reviews").where("productId", "in", chunk).get();
    if (snap.empty) continue;
    const batch = adminDb().batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deleted += snap.docs.length;
  }
  return deleted;
}

export type DeleteStoreResult =
  | { success: true; storeId: string; alreadyDeleted?: boolean; warnings: string[] }
  | { success: false; error: ActionError };

/**
 * Permanently deletes a store: its Firebase Auth owner, every tenant-scoped Firestore
 * subcollection under stores/{id} (via recursiveDelete - exhaustive by construction, so
 * nothing under the store's own doc can be missed), the 8 root-level storeId-keyed
 * collections, `reviews` (joined via product IDs), and the store's Cloudinary assets.
 *
 * Fully synchronous (not a waitUntil() background split like createStore()) - a delete's
 * outcome must be knowable in the same response for "never report success if critical
 * cleanup failed" to be honest. Ordering is what makes retries safe: the Auth user is
 * deleted FIRST (critical - any other failure aborts before anything else is touched), the
 * store doc itself is deleted LAST via recursiveDelete (critical), and everything in between
 * is best-effort/parallel (Promise.allSettled) with failures collected as warnings rather
 * than aborting. Every step already tolerates "already gone," so a retry after a partial
 * failure - or a retry after full success - both just report success.
 */
export async function deleteStore(storeId: string, confirmSlug: string): Promise<DeleteStoreResult> {
  const traceId = generateTraceId();

  let decoded: Awaited<ReturnType<typeof requireSuperAdmin>>;
  try {
    decoded = await requireSuperAdmin();
    await enforceRateLimit(decoded.uid);
  } catch (err) {
    logActionError(traceId, "AUTH_CHECK", err);
    const message = err instanceof Error ? err.message : "Not authorized to delete a store.";
    const code: ActionErrorCode = message.toLowerCase().includes("too many") ? "RATE_LIMITED" : "UNAUTHORIZED";
    return { success: false, error: toActionError(traceId, "AUTH_CHECK", code, message) };
  }

  const store = await getStoreById(storeId);
  if (!store) {
    // Already gone - deleting an already-deleted store is success, not an error (safe to retry).
    return { success: true, storeId, alreadyDeleted: true, warnings: [] };
  }

  // Server-side re-validation behind the client's own type-to-confirm gate.
  if (confirmSlug.trim().toLowerCase() !== store.slug) {
    return {
      success: false,
      error: toActionError(traceId, "VALIDATION", "VALIDATION_FAILED", "Confirmation text didn't match the store's slug."),
    };
  }

  const { slug, email, cloudinaryFolder } = store;

  // Captured before anything is deleted - reviews has no storeId field, only productId.
  const productIds = await getProductIdsForStore(storeId).catch((err) => {
    logActionError(traceId, "CAPTURE_PRODUCT_IDS", err);
    return [] as string[];
  });

  // Critical, first: the Auth owner. Any failure here aborts before anything else is touched.
  if (email) {
    try {
      const userRecord = await adminAuth().getUserByEmail(email);
      await adminAuth().deleteUser(userRecord.uid);
    } catch (err) {
      if ((err as { code?: string }).code !== "auth/user-not-found") {
        logActionError(traceId, "DELETE_AUTH_USER", err);
        return {
          success: false,
          error: toActionError(
            traceId,
            "DELETE_AUTH_USER",
            "DELETION_FAILED",
            "Could not delete the store owner's account. Nothing else was deleted - safe to retry."
          ),
        };
      }
    }
  }

  // Best-effort, parallel: everything not under stores/{id} itself. Failures are collected
  // as warnings, never abort - the critical recursiveDelete below still runs regardless.
  const cleanupLabels = [...ROOT_STOREID_COLLECTIONS, "reviews", "cloudinary assets"];
  const cleanupResults = await Promise.allSettled([
    ...ROOT_STOREID_COLLECTIONS.map((name) => deleteWhereStoreId(name, storeId)),
    deleteReviewsForProducts(productIds),
    deleteAllByPrefix(`${cloudinaryFolder}/`).then((r) => r.deleted),
  ]);

  const warnings: string[] = [];
  cleanupResults.forEach((result, i) => {
    if (result.status === "rejected") {
      const label = cleanupLabels[i];
      logActionError(traceId, `CLEANUP:${label}`, result.reason);
      warnings.push(`Failed to clean up ${label}: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`);
    }
  });

  // Critical, last: the store doc and everything still under it (its 31 tenant-scoped
  // subcollections). A retry after this fails will still find the doc present, since
  // every earlier step above already tolerates "already gone."
  try {
    await adminDb().recursiveDelete(adminDb().collection(COLLECTION).doc(storeId));
  } catch (err) {
    logActionError(traceId, "RECURSIVE_DELETE", err);
    return {
      success: false,
      error: toActionError(
        traceId,
        "RECURSIVE_DELETE",
        "DELETION_FAILED",
        "The store's own data could not be fully deleted. Some data may be partially removed - retrying is safe."
      ),
    };
  }

  revalidateStoreList();
  // Written after the storeActivityLogs sweep above, so this record survives as the
  // permanent audit trail of the deletion itself.
  await logStoreActivity(storeId, "deleted", decoded.uid, { slug }).catch((err) =>
    logActionError(traceId, "ACTIVITY_LOGGED", err)
  );

  return { success: true, storeId, warnings };
}

export async function getPlatformEmailSettingsAction(): Promise<PlatformEmailSettings> {
  await requireSuperAdmin();
  return getPlatformEmailSettings();
}

export async function updatePlatformEmailSettingsAction(settings: PlatformEmailSettings): Promise<void> {
  await requireSuperAdmin();
  await updatePlatformEmailSettings(settings);
}
