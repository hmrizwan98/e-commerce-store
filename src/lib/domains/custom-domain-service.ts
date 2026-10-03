import "server-only";
import { randomBytes } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { getStoreById, isDomainTaken } from "@/lib/firebase/repositories/stores";
import { logStoreActivity } from "@/lib/firebase/repositories/store-activity-logs";
import { getActiveDeploymentProvider } from "@/lib/deployment/provider-registry";
import { getPlatformBaseUrl } from "@/lib/platform/base-url";
import { buildTenantAdminUrl, buildTenantUrl } from "@/lib/platform/tenant-url";
import { syncDomainSettings } from "@/lib/superadmin/domain-settings";
import { hasOwnershipTxtRecord, isServingHttps } from "./dns-check";
import {
  adminHostFor,
  buildDnsRecords,
  getActivePrimaryCustomDomain,
  validateCustomDomain,
  wwwHostFor,
} from "./custom-domain";
import type { Store } from "@/types/store";
import type {
  CustomDomainCheckSnapshot,
  CustomDomainDnsRecord,
  CustomDomainRequest,
  DomainSetting,
} from "@/types/domain-settings";

/**
 * Store Admin self-service custom domains. Lifecycle:
 *
 *   request  -> owner gets DNS records (TXT ownership + A/CNAME pointing at the host)
 *   check    -> 1. ownership TXT visible?  (until then nothing is attached anywhere)
 *               2. attach domain, admin.<domain> (+ www redirect) to the hosting project
 *               3. DNS pointing at the host? (provider config check)
 *               4. HTTPS actually served for both hosts? (real TLS request)
 *               -> all done: domain joins store.domains (routing), becomes primary, and the
 *                  default addresses redirect to it
 *   remove   -> detached from the host, store back on its default addresses
 *
 * Every function takes the store id (never trusts client-sent store data) and returns
 * friendly, display-safe errors.
 */

const COLLECTION = "stores";

export type DomainResult<T = CustomDomainView> = { ok: true; data: T } | { ok: false; error: string };

export interface CustomDomainView {
  providerConfigured: boolean;
  defaultStorefrontUrl: string;
  defaultAdminUrl: string;
  /** Live addresses right now (custom when active, default otherwise). */
  storefrontUrl: string;
  adminUrl: string;
  request: Pick<CustomDomainRequest, "hostname" | "status" | "requestedAt" | "activatedAt" | "lastCheck"> | null;
  adminHostname: string | null;
  records: CustomDomainDnsRecord[];
}

function rootDomain(): string {
  return new URL(getPlatformBaseUrl()).hostname;
}

function defaultUrls(store: Pick<Store, "slug">) {
  const base = getPlatformBaseUrl();
  return { storefront: buildTenantUrl(base, store.slug), admin: buildTenantAdminUrl(base, store.slug) };
}

export function getCustomDomainView(store: Store): CustomDomainView {
  const defaults = defaultUrls(store);
  const req = store.customDomainRequest ?? null;
  const active = getActivePrimaryCustomDomain(store);
  return {
    providerConfigured: getActiveDeploymentProvider().isConfigured(),
    defaultStorefrontUrl: defaults.storefront,
    defaultAdminUrl: defaults.admin,
    storefrontUrl: active ? `https://${active.hostname}` : defaults.storefront,
    adminUrl: active ? `https://${adminHostFor(active.hostname)}` : defaults.admin,
    request: req
      ? { hostname: req.hostname, status: req.status, requestedAt: req.requestedAt, activatedAt: req.activatedAt, lastCheck: req.lastCheck }
      : null,
    adminHostname: req ? adminHostFor(req.hostname) : null,
    records: req
      ? buildDnsRecords({
          hostname: req.hostname,
          ownershipToken: req.ownershipToken,
          recommendedIPv4: req.recommendedIPv4,
          recommendedCNAME: req.recommendedCNAME,
          providerVerification: req.providerVerification,
        })
      : [],
  };
}

async function loadStore(storeId: string): Promise<Store> {
  const store = await getStoreById(storeId);
  if (!store) throw new Error("Store not found.");
  return store;
}

/** Hostnames attached to the provider for one store domain. */
function providerHostsFor(hostname: string): { host: string; redirectTo?: string }[] {
  const hosts: { host: string; redirectTo?: string }[] = [{ host: hostname }, { host: adminHostFor(hostname) }];
  const www = wwwHostFor(hostname);
  if (www) hosts.push({ host: www, redirectTo: hostname });
  return hosts;
}

/** Attach a domain (+ admin. and www redirect) to the hosting project. Used by the Store
 * Admin flow after ownership is proven, and by Super Admin when adding a domain. */
export async function attachDomainToProvider(hostname: string): Promise<{ ok: boolean; error?: string }> {
  const provider = getActiveDeploymentProvider();
  if (!provider.isConfigured()) return { ok: false, error: "Custom domains aren't enabled on this platform yet." };
  for (const { host, redirectTo } of providerHostsFor(hostname)) {
    const res = await provider.addDomain(host, redirectTo ? { redirectTo } : undefined);
    if (!res.ok) return { ok: false, error: res.error };
  }
  return { ok: true };
}

export async function detachDomainFromProvider(hostname: string): Promise<void> {
  const provider = getActiveDeploymentProvider();
  if (!provider.isConfigured()) return;
  for (const { host } of providerHostsFor(hostname)) {
    const res = await provider.removeDomain(host);
    if (!res.ok) console.error(`[custom-domain] could not detach ${host}: ${res.error}`);
  }
}

export async function requestCustomDomain(storeId: string, rawDomain: string, actorUid: string): Promise<DomainResult> {
  const store = await loadStore(storeId);
  const validated = validateCustomDomain(rawDomain, rootDomain());
  if (!validated.ok) return { ok: false, error: validated.error };
  const hostname = validated.hostname;

  const current = store.customDomainRequest;
  if (current?.status === "active") {
    return { ok: false, error: `Your store is already connected to ${current.hostname}. Remove it first to use a different domain.` };
  }
  if (store.domains?.includes(hostname)) {
    return { ok: false, error: `${hostname} is already connected to your store.` };
  }
  if (await isDomainTaken(hostname, storeId)) {
    return { ok: false, error: `${hostname} is already connected to another store. If you own it, please contact support.` };
  }

  // Switching from an unfinished request: detach anything the previous one attached.
  if (current && current.hostname !== hostname && current.lastCheck?.providerAdded === "done") {
    await detachDomainFromProvider(current.hostname);
  }

  const request: CustomDomainRequest =
    current && current.hostname === hostname
      ? current // same domain again - keep the token the owner may already have published
      : {
          hostname,
          ownershipToken: randomBytes(16).toString("hex"),
          status: "awaiting_dns",
          requestedAt: Date.now(),
          requestedBy: actorUid,
        };

  await adminDb().collection(COLLECTION).doc(storeId).update({ customDomainRequest: request, updatedAt: FieldValue.serverTimestamp() });
  await logStoreActivity(storeId, "domain_requested", actorUid, { hostname });
  return { ok: true, data: getCustomDomainView({ ...store, customDomainRequest: request }) };
}

function snapshot(partial: Partial<CustomDomainCheckSnapshot> & { message: string }): CustomDomainCheckSnapshot {
  return { checkedAt: Date.now(), ownership: "pending", providerAdded: "pending", dns: "pending", ssl: "pending", ...partial };
}

/** Runs every step it can and records how far the domain got. Safe to call repeatedly. */
export async function checkCustomDomain(storeId: string, actorUid: string): Promise<DomainResult> {
  const store = await loadStore(storeId);
  const req = store.customDomainRequest;
  if (!req) return { ok: false, error: "No domain has been added yet." };
  const { hostname } = req;
  const adminHost = adminHostFor(hostname);
  const provider = getActiveDeploymentProvider();
  const docRef = adminDb().collection(COLLECTION).doc(storeId);

  // Persists an incomplete check. If the domain was already live and a step now fails
  // (e.g. the owner changed their DNS), its status drops back to pending - which stops the
  // redirects and links that require a live domain - until a check passes again.
  const save = async (lastCheck: CustomDomainCheckSnapshot, extra: Partial<CustomDomainRequest> = {}) => {
    const next = stripUndefinedShallow<CustomDomainRequest>({ ...req, ...extra, lastCheck });
    let domainSettings = store.domainSettings;
    if (req.status === "active" && store.domainSettings?.[hostname]) {
      domainSettings = {
        ...store.domainSettings,
        [hostname]: {
          ...store.domainSettings[hostname],
          dnsStatus: lastCheck.dns === "done" ? "verified" : "pending",
          sslStatus: lastCheck.ssl === "done" ? "active" : "pending",
          lastCheckedAt: lastCheck.checkedAt,
        },
      };
    }
    await docRef.update({
      customDomainRequest: next,
      ...(domainSettings !== store.domainSettings ? { domainSettings } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { ...store, domainSettings, customDomainRequest: next } as Store;
  };

  // 1. Ownership
  if (!(await hasOwnershipTxtRecord(hostname, req.ownershipToken))) {
    const updated = await save(
      snapshot({
        ownership: "pending",
        message:
          "We can't see your TXT (verification) record yet. Add it exactly as shown - new DNS records usually appear within minutes, but can take up to 24-48 hours.",
      })
    );
    return { ok: true, data: getCustomDomainView(updated) };
  }

  // 2. Attach to the hosting project
  if (!provider.isConfigured()) {
    const updated = await save(
      snapshot({ ownership: "done", providerAdded: "error", message: "Your domain ownership is verified. Custom domains aren't switched on for this platform yet - please contact support." })
    );
    return { ok: true, data: getCustomDomainView(updated) };
  }
  const attached = await attachDomainToProvider(hostname);
  if (!attached.ok) {
    const updated = await save(snapshot({ ownership: "done", providerAdded: "error", message: attached.error ?? "Could not connect the domain." }));
    return { ok: true, data: getCustomDomainView(updated) };
  }

  // 3. DNS pointing at the host
  const [main, admin] = await Promise.all([provider.getDomainStatus(hostname), provider.getDomainStatus(adminHost)]);
  const providerVerification = [...main.verification, ...admin.verification];
  if (providerVerification.length) {
    // Owner may have just added the provider's TXT - ask it to re-check.
    await Promise.all([!main.verified && provider.verifyDomainChallenge(hostname), !admin.verified && provider.verifyDomainChallenge(adminHost)]);
  }
  const extra: Partial<CustomDomainRequest> = {
    providerVerification: providerVerification.length ? providerVerification : undefined,
    recommendedIPv4: main.recommendedIPv4 ?? req.recommendedIPv4,
    recommendedCNAME: admin.recommendedCNAME ?? main.recommendedCNAME ?? req.recommendedCNAME,
  };
  const dnsReady = main.verified && !main.misconfigured && admin.verified && !admin.misconfigured;
  if (!dnsReady) {
    const which = [!(main.verified && !main.misconfigured) && hostname, !(admin.verified && !admin.misconfigured) && adminHost].filter(Boolean).join(" and ");
    const message = providerVerification.length
      ? "Ownership confirmed. Your domain is also used on another hosting account - add the extra TXT record shown below, then check again."
      : `Ownership confirmed. ${which} ${which.includes(" and ") ? "are" : "is"} not pointing to us yet - check the A/CNAME records below. Changes can take up to 24-48 hours.`;
    const updated = await save(snapshot({ ownership: "done", providerAdded: "done", dns: "pending", message: main.error || admin.error || message }), extra);
    return { ok: true, data: getCustomDomainView(updated) };
  }

  // 4. HTTPS really served for both hosts
  const [mainHttps, adminHttps] = await Promise.all([isServingHttps(hostname), isServingHttps(adminHost)]);
  if (!mainHttps || !adminHttps) {
    const updated = await save(
      snapshot({
        ownership: "done",
        providerAdded: "done",
        dns: "done",
        ssl: "pending",
        message: "DNS is correct. Your free SSL certificate is being issued - this usually takes a few minutes. Check again shortly.",
      }),
      extra
    );
    return { ok: true, data: getCustomDomainView(updated) };
  }

  // All good - activate.
  if (await isDomainTaken(hostname, storeId)) {
    return { ok: false, error: `${hostname} was just connected to another store. Please contact support.` };
  }
  const now = Date.now();
  const domains = Array.from(new Set([...(store.domains ?? []), hostname]));
  const domainSettings = syncDomainSettings(store.domainSettings, domains);
  for (const key of Object.keys(domainSettings)) domainSettings[key] = { ...domainSettings[key], isPrimary: false };
  domainSettings[hostname] = {
    hostname,
    dnsStatus: "verified",
    sslStatus: "active",
    isPrimary: true,
    redirectPlatformSubdomain: true,
    source: "store_admin",
    lastCheckedAt: now,
  } satisfies DomainSetting;
  const activeRequest: CustomDomainRequest = {
    ...req,
    ...extra,
    status: "active",
    activatedAt: req.activatedAt ?? now,
    lastCheck: snapshot({ ownership: "done", providerAdded: "done", dns: "done", ssl: "done", message: `Connected! Your store is live at ${hostname}.` }),
  };
  await docRef.update({
    domains,
    domainSettings,
    customDomainRequest: stripUndefinedShallow(activeRequest),
    websiteUrl: `https://${hostname}`,
    adminUrl: `https://${adminHost}`,
    updatedAt: FieldValue.serverTimestamp(),
  });
  if (req.status !== "active") await logStoreActivity(storeId, "domain_connected", actorUid, { hostname });
  return { ok: true, data: getCustomDomainView({ ...store, domains, domainSettings, customDomainRequest: activeRequest }) };
}

/** Disconnects the store's self-service domain and returns it to its default addresses. */
export async function removeCustomDomain(storeId: string, actorUid: string): Promise<DomainResult> {
  const store = await loadStore(storeId);
  const req = store.customDomainRequest;
  if (!req) return { ok: false, error: "No domain is connected." };
  const { hostname } = req;

  await detachDomainFromProvider(hostname);

  const domains = (store.domains ?? []).filter((d) => d !== hostname);
  const domainSettings = syncDomainSettings(store.domainSettings, domains);
  const defaults = defaultUrls(store);
  await adminDb().collection(COLLECTION).doc(storeId).update({
    domains,
    domainSettings,
    customDomainRequest: FieldValue.delete(),
    websiteUrl: defaults.storefront,
    adminUrl: defaults.admin,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await logStoreActivity(storeId, "domain_removed", actorUid, { hostname, source: "store_admin" });
  const { customDomainRequest: _removed, ...rest } = store;
  return { ok: true, data: getCustomDomainView({ ...rest, domains, domainSettings } as Store) };
}

/** Firestore rejects undefined values - drop top-level undefined optionals. */
function stripUndefinedShallow<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
}
