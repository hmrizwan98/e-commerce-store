/**
 * Custom domain rules + Vercel provider (mocked HTTP - no real Vercel calls).
 * Run: npx tsx --test scripts/test-custom-domains.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildDnsRecords,
  getActivePrimaryCustomDomain,
  isApexDomain,
  registrableDomain,
  relativeHost,
  txtRecordsContainToken,
  validateCustomDomain,
} from "../src/lib/domains/custom-domain";
import { getStoreAdminUrl, getStorefrontUrl } from "../src/lib/platform/tenant-url";
import { createVercelProvider } from "../src/lib/deployment/providers/vercel";

const ROOT = "webriiz.com";

test("validateCustomDomain normalizes what owners type", () => {
  assert.deepEqual(validateCustomDomain("https://www.Glamix.PK/shop?x=1", ROOT), { ok: true, hostname: "glamix.pk" });
  assert.deepEqual(validateCustomDomain("  shop.glamix.com. ", ROOT), { ok: true, hostname: "shop.glamix.com" });
  assert.deepEqual(validateCustomDomain("glamix.com.pk", ROOT), { ok: true, hostname: "glamix.com.pk" });
});

test("validateCustomDomain rejects unusable domains", () => {
  for (const bad of ["", "glamix", "1.2.3.4", "test.webriiz.com", "webriiz.com", "admin.glamix.pk", "my-app.vercel.app", "localhost", "com.pk", "bad_domain.com", "-x.com"]) {
    assert.equal(validateCustomDomain(bad, ROOT).ok, false, bad);
  }
});

test("apex detection understands multi-part TLDs", () => {
  assert.equal(registrableDomain("shop.glamix.pk"), "glamix.pk");
  assert.equal(registrableDomain("glamix.com.pk"), "glamix.com.pk");
  assert.equal(registrableDomain("shop.glamix.com.pk"), "glamix.com.pk");
  assert.equal(isApexDomain("glamix.pk"), true);
  assert.equal(isApexDomain("shop.glamix.pk"), false);
  assert.equal(relativeHost("glamix.pk", "glamix.pk"), "@");
  assert.equal(relativeHost("admin.glamix.pk", "glamix.pk"), "admin");
  assert.equal(relativeHost("_webriiz-verify.shop.glamix.com.pk", "shop.glamix.com.pk"), "_webriiz-verify.shop");
});

test("DNS records: apex domain gets TXT + A + www/admin CNAMEs", () => {
  const records = buildDnsRecords({ hostname: "glamix.pk", ownershipToken: "abc123" });
  assert.deepEqual(
    records.map((r) => [r.purpose, r.type, r.host, r.value]),
    [
      ["ownership", "TXT", "_webriiz-verify", "webriiz-verify=abc123"],
      ["storefront", "A", "@", "76.76.21.21"],
      ["www", "CNAME", "www", "cname.vercel-dns.com"],
      ["admin", "CNAME", "admin", "cname.vercel-dns.com"],
    ]
  );
});

test("DNS records: subdomain uses CNAME, provider values and challenges are used", () => {
  const records = buildDnsRecords({
    hostname: "shop.glamix.pk",
    ownershipToken: "t",
    recommendedCNAME: "abc.vercel-dns-017.com.",
    providerVerification: [{ type: "TXT", domain: "_vercel.glamix.pk", value: "vc-domain-verify=shop.glamix.pk,123" }],
  });
  assert.deepEqual(
    records.map((r) => [r.purpose, r.type, r.host, r.value]),
    [
      ["ownership", "TXT", "_webriiz-verify.shop", "webriiz-verify=t"],
      ["storefront", "CNAME", "shop", "abc.vercel-dns-017.com"],
      ["admin", "CNAME", "admin.shop", "abc.vercel-dns-017.com"],
      ["provider_verification", "TXT", "_vercel", "vc-domain-verify=shop.glamix.pk,123"],
    ]
  );
});

test("TXT ownership matching handles chunked records and rejects others", () => {
  assert.equal(txtRecordsContainToken([["webriiz-verify=", "abc"]], "abc"), true);
  assert.equal(txtRecordsContainToken([["v=spf1 -all"], ["webriiz-verify=abc"]], "abc"), true);
  assert.equal(txtRecordsContainToken([["webriiz-verify=abcd"]], "abc"), false);
  assert.equal(txtRecordsContainToken([], "abc"), false);
});

const liveStore = {
  slug: "glamix",
  domains: ["glamix.pk"],
  domainSettings: { "glamix.pk": { isPrimary: true, dnsStatus: "verified", sslStatus: "active", redirectPlatformSubdomain: true } },
};
const pendingStore = {
  slug: "glamix",
  domains: ["glamix.pk"],
  domainSettings: { "glamix.pk": { isPrimary: true, dnsStatus: "pending", sslStatus: "pending" } },
};

test("only a fully live primary domain is used for links/redirects", () => {
  assert.deepEqual(getActivePrimaryCustomDomain(liveStore), { hostname: "glamix.pk", redirectPlatformSubdomain: true });
  assert.equal(getActivePrimaryCustomDomain(pendingStore), null);
  assert.equal(getStorefrontUrl(liveStore, "https://webriiz.com"), "https://glamix.pk");
  assert.equal(getStoreAdminUrl(liveStore, "https://webriiz.com"), "https://admin.glamix.pk");
  assert.equal(getStorefrontUrl(pendingStore, "https://webriiz.com"), "https://glamix.webriiz.com");
  assert.equal(getStoreAdminUrl(pendingStore, "https://webriiz.com"), "https://admin-glamix.webriiz.com");
});

// --- Vercel provider with a mocked fetch ---
type Call = { method: string; url: string; body?: any };
function mockFetch(handler: (call: Call) => { status: number; body?: any }) {
  const calls: Call[] = [];
  const fn = async (url: string, init?: RequestInit) => {
    const call = { method: init?.method ?? "GET", url, body: init?.body ? JSON.parse(String(init.body)) : undefined };
    calls.push(call);
    const { status, body } = handler(call);
    return new Response(JSON.stringify(body ?? {}), { status, headers: { "Content-Type": "application/json" } });
  };
  return { fn, calls };
}
const SECRET = "tok_SECRET_123";

test("vercel addDomain posts to the project (with team) and supports redirects", async () => {
  const m = mockFetch(() => ({ status: 200, body: { name: "x", verified: true } }));
  const p = createVercelProvider({ token: SECRET, projectId: "prj_1", teamId: "team_9" }, m.fn);
  assert.deepEqual(await p.addDomain("www.glamix.pk", { redirectTo: "glamix.pk" }), { ok: true });
  assert.equal(m.calls[0].method, "POST");
  assert.equal(m.calls[0].url, "https://api.vercel.com/v10/projects/prj_1/domains?teamId=team_9");
  assert.deepEqual(m.calls[0].body, { name: "www.glamix.pk", redirect: "glamix.pk", redirectStatusCode: 308 });
});

test("vercel addDomain is idempotent when already on this project", async () => {
  const m = mockFetch((c) =>
    c.method === "POST" ? { status: 400, body: { error: { code: "domain_already_in_use", message: "Domain already exists on this project" } } } : { status: 200, body: { verified: true } }
  );
  const p = createVercelProvider({ token: SECRET, projectId: "prj_1" }, m.fn);
  assert.deepEqual(await p.addDomain("glamix.pk"), { ok: true });
});

test("vercel addDomain: domain on another account -> friendly error, no secrets", async () => {
  const m = mockFetch((c) => (c.method === "POST" ? { status: 409, body: { error: { code: "domain_taken", message: "prj_other owns it" } } } : { status: 404 }));
  const p = createVercelProvider({ token: SECRET, projectId: "prj_1" }, m.fn);
  const r = await p.addDomain("glamix.pk");
  assert.equal(r.ok, false);
  assert.match(r.error!, /already connected to another website/);
  assert.ok(!r.error!.includes(SECRET) && !r.error!.includes("prj_"));
});

test("vercel getDomainStatus combines project domain + DNS config", async () => {
  const m = mockFetch((c) =>
    c.url.includes("/v6/domains/")
      ? { status: 200, body: { misconfigured: false, recommendedIPv4: [{ rank: 2, value: ["1.1.1.1"] }, { rank: 1, value: ["76.76.21.21"] }], recommendedCNAME: [{ rank: 1, value: "cname.vercel-dns.com." }] } }
      : { status: 200, body: { verified: false, verification: [{ type: "TXT", domain: "_vercel.glamix.pk", value: "vc=1", reason: "pending" }] } }
  );
  const p = createVercelProvider({ token: SECRET, projectId: "prj_1" }, m.fn);
  const s = await p.getDomainStatus("glamix.pk");
  assert.equal(s.attached, true);
  assert.equal(s.verified, false);
  assert.equal(s.misconfigured, false);
  assert.equal(s.recommendedIPv4, "76.76.21.21");
  assert.equal(s.recommendedCNAME, "cname.vercel-dns.com");
  assert.deepEqual(s.verification, [{ type: "TXT", domain: "_vercel.glamix.pk", value: "vc=1" }]);
  assert.ok(m.calls.some((c) => c.url.includes("/v6/domains/glamix.pk/config?projectIdOrName=prj_1")));
});

test("vercel getDomainStatus: not attached / unreachable", async () => {
  const notAttached = createVercelProvider({ token: SECRET, projectId: "prj_1" }, mockFetch(() => ({ status: 404 })).fn);
  assert.equal((await notAttached.getDomainStatus("glamix.pk")).attached, false);
  const down = createVercelProvider({ token: SECRET, projectId: "prj_1" }, async () => {
    throw new Error("ECONNRESET");
  });
  const s = await down.getDomainStatus("glamix.pk");
  assert.equal(s.attached, false);
  assert.ok(s.error);
});

test("vercel removeDomain treats 404 as already removed", async () => {
  const m = mockFetch(() => ({ status: 404 }));
  const p = createVercelProvider({ token: SECRET, projectId: "prj_1" }, m.fn);
  assert.deepEqual(await p.removeDomain("glamix.pk"), { ok: true });
  assert.equal(m.calls[0].method, "DELETE");
  assert.equal(m.calls[0].url, "https://api.vercel.com/v9/projects/prj_1/domains/glamix.pk");
});
