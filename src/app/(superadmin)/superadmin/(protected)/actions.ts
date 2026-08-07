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
import { DEFAULT_THEME } from "@/lib/firebase/repositories/themes";
import { getWelcomeEmailService } from "@/lib/email";
import { logStoreActivity } from "@/lib/firebase/repositories/store-activity-logs";
import { installDefaultTheme } from "@/lib/firebase/services/theme-installer";
import { provisionCloudinaryMetadata } from "@/lib/firebase/services/cloudinary-provisioner";
import { provisionDeploymentMetadata } from "@/lib/firebase/services/deployment-provisioner";
import { syncDomainSettings } from "@/lib/superadmin/domain-settings";
import { getPlatformBaseUrl } from "@/lib/platform/base-url";
import { buildTenantUrl } from "@/lib/platform/tenant-url";
import { getActiveDeploymentProvider } from "@/lib/deployment/provider-registry";
import { logDeploymentEvent } from "@/lib/firebase/repositories/deployment-logs";
import {
  generateTraceId,
  logActionError,
  toActionError,
  type ActionError,
  type ActionErrorCode,
} from "@/lib/errors/action-error";
import { createStageTimer } from "@/lib/errors/stage-timer";
import type { ThemePresetKey } from "@/lib/themes/theme-presets";
import type { StoreStatus, StoreTemplate } from "@/types/store";

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
  template?: StoreTemplate;
  themeKey?: ThemePresetKey;
}

export type CreateStoreResult =
  | { success: true; storeId: string; adminEmail: string; adminTempPassword: string }
  | { success: false; error: ActionError };

export interface ResetAdminPasswordResult {
  adminEmail: string;
  newPassword: string;
}

function revalidateStoreList() {
  revalidatePath("/superadmin");
  revalidatePath("/superadmin/stores");
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
      adminUrl: buildTenantUrl(getPlatformBaseUrl(), slug, "/admin"),
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
  const themeKey: ThemePresetKey = input.themeKey ?? "universal-premium";
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
        themeId: themeKey,
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
        },
      },
      stage
    );
  } catch (err) {
    logActionError(traceId, "PROVISION_SHELL", err);
    const message = err instanceof Error ? err.message : "Could not create the store.";
    return { success: false, error: toActionError(traceId, "PROVISION_SHELL", classifyShellError(message), message) };
  }
  const { storeId, ref, storeDocRef, userRecord, adminTempPassword, slug } = shell;

  // --- Synchronous critical path ends here: only what's required for the
  // store to exist and its owner to be able to log in. Everything below
  // (theme/menu install, Cloudinary/deployment metadata, activity log,
  // welcome email) is slow (creating the Auth user alone was observed
  // taking ~9s in production) and non-essential for that - it runs via
  // waitUntil() (@vercel/functions) so the HTTP response returns as soon as
  // the store is usable, instead of the whole request racing the platform's
  // function timeout. Does not raise that timeout - the background work
  // still shares the same invocation's remaining time budget.
  try {
    const storeName = input.brandName?.trim() || input.name;
    await storeDocRef
      .collection("siteSettings")
      .doc("general")
      .set({
        storeName,
        storeEmail: input.email,
        currency: input.currency || "USD",
        currencySymbol: "$",
        taxRatePercent: 0,
        taxInclusive: false,
      });
    stage("SITE_SETTINGS_CREATED", { storeId });

    await adminAuth().setCustomUserClaims(userRecord.uid, { role: "admin", tenantId: storeId });
    stage("OWNER_ASSIGNED", { storeId });
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
  // Not retried on failure (by design) - on error this records
  // provisioningStatus/provisioningError on the store doc and a deployment
  // log entry instead, so the failure is visible rather than silent, without
  // blocking or re-attempting the request that already succeeded.
  //
  // Theme install, Cloudinary metadata, deployment metadata, the activity
  // log entry, and the welcome email are all independent of each other (no
  // step reads another's result) - they run concurrently instead of one
  // after another. Doing them sequentially was still consuming most of the
  // same 10s function budget the synchronous critical path was moved out
  // of, since each step pays its own Firestore/network round-trip latency
  // (observed 300-1800ms per step in production) - confirmed in production
  // via the per-stage timing this same instrumentation reports.
  waitUntil(
    (async () => {
    try {
      await Promise.all([
        installDefaultTheme(storeDocRef, { template: input.template ?? "empty", themeKey }, stage).then(() =>
          stage("THEME_INSTALL_FINISHED", { storeId })
        ),
        provisionCloudinaryMetadata(storeDocRef, slug).then(() => stage("CLOUDINARY_PROVISIONED", { storeId })),
        provisionDeploymentMetadata(storeDocRef, {
          websiteUrl: buildTenantUrl(platformBaseUrl, slug),
          slug,
          rootDomain: new URL(platformBaseUrl).host,
        }).then(() => stage("DEPLOYMENT_TRIGGERED", { storeId })),
        logStoreActivity(storeId, "created", decoded.uid).then(() => stage("ACTIVITY_LOGGED", { storeId })),
        // Best-effort only - never blocks or fails background provisioning.
        getWelcomeEmailService()
          .sendWelcomeEmail({
            storeName: input.brandName?.trim() || input.name,
            storeUrl: buildTenantUrl(platformBaseUrl, slug),
            adminUrl: buildTenantUrl(platformBaseUrl, slug, "/admin"),
            email: input.email!,
            temporaryPassword: adminTempPassword,
          })
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

  return { success: true, storeId, adminEmail: input.email, adminTempPassword };
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

  const { storeId, ref, storeDocRef, userRecord, adminTempPassword, slug } = await provisionStoreShell(
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

  await getWelcomeEmailService()
    .sendWelcomeEmail({
      storeName: input.name,
      storeUrl: buildTenantUrl(platformBaseUrl, slug),
      adminUrl: buildTenantUrl(platformBaseUrl, slug, "/admin"),
      email: input.email,
      temporaryPassword: adminTempPassword,
    })
    .catch((err) => console.error("[welcome-email] failed to send", err));

  return { success: true, storeId, adminEmail: input.email, adminTempPassword };
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
    .update({ domains, domainSettings, updatedAt: FieldValue.serverTimestamp() });
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

export async function resetStoreAdminPassword(storeId: string): Promise<ResetAdminPasswordResult> {
  const decoded = await requireSuperAdmin();
  await enforceRateLimit(decoded.uid);
  const store = await getStoreById(storeId);
  if (!store) throw new Error("Store not found.");
  if (!store.email) throw new Error("This store has no admin email on file.");

  const userRecord = await adminAuth().getUserByEmail(store.email);
  const newPassword = generateTempPassword();
  await adminAuth().updateUser(userRecord.uid, { password: newPassword });
  await logStoreActivity(storeId, "password_reset", decoded.uid);

  return { adminEmail: store.email, newPassword };
}

/** The original one-time temp password from creation was never persisted (reveal-once by
 * design), so "resending" the welcome email issues a fresh password, same as a manual reset,
 * then sends it through the same welcome-email service used at creation. */
export async function resendWelcomeEmail(storeId: string): Promise<ResetAdminPasswordResult> {
  const decoded = await requireSuperAdmin();
  await enforceRateLimit(decoded.uid);
  const store = await getStoreById(storeId);
  if (!store) throw new Error("Store not found.");
  if (!store.email) throw new Error("This store has no admin email on file.");

  const userRecord = await adminAuth().getUserByEmail(store.email);
  const newPassword = generateTempPassword();
  await adminAuth().updateUser(userRecord.uid, { password: newPassword });

  const platformBaseUrl = getPlatformBaseUrl();
  await getWelcomeEmailService()
    .sendWelcomeEmail({
      storeName: store.brandName?.trim() || store.name,
      storeUrl: store.websiteUrl ?? buildTenantUrl(platformBaseUrl, store.slug),
      adminUrl: store.adminUrl ?? buildTenantUrl(platformBaseUrl, store.slug, "/admin"),
      email: store.email,
      temporaryPassword: newPassword,
    })
    .catch((err) => console.error("[welcome-email] failed to resend", err));

  await logStoreActivity(storeId, "welcome_email_resent", decoded.uid);
  return { adminEmail: store.email, newPassword };
}

export interface TransferOwnershipResult {
  newOwnerEmail: string;
  newOwnerTempPassword: string;
}

/** Strips the old owner's admin access to this store immediately (claims cleared + sessions
 * revoked) and finds-or-creates a Firebase Auth user for the new owner with a fresh temp
 * password, so a transfer never leaves two people able to administer the same store. */
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

  const newOwnerTempPassword = generateTempPassword();
  let newUser;
  try {
    newUser = await adminAuth().getUserByEmail(email);
    await adminAuth().updateUser(newUser.uid, { password: newOwnerTempPassword });
  } catch {
    newUser = await adminAuth().createUser({
      email,
      password: newOwnerTempPassword,
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

  return { newOwnerEmail: email, newOwnerTempPassword };
}
