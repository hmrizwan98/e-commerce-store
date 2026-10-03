import type {
  DeploymentProvider,
  DeploymentTriggerResult,
  DomainVerificationResult,
  ProviderDomainOpResult,
  ProviderDomainStatus,
} from "../provider";

/**
 * Real Vercel integration for custom domains (REST API, docs: vercel.com/docs/rest-api):
 *   POST   /v10/projects/{project}/domains                 attach a domain (optionally as a redirect)
 *   GET    /v9/projects/{project}/domains/{domain}         attached? verified? ownership challenges
 *   POST   /v9/projects/{project}/domains/{domain}/verify  re-check an ownership challenge
 *   DELETE /v9/projects/{project}/domains/{domain}         detach
 *   GET    /v6/domains/{domain}/config                     DNS pointing correctly? recommended records
 * Vercel issues the TLS certificate itself once DNS points at it.
 *
 * Configured by VERCEL_API_TOKEN + VERCEL_PROJECT_ID (+ VERCEL_TEAM_ID when the project
 * belongs to a team). Without them, the stub provider is used and every domain op reports
 * "not configured" instead of pretending to succeed.
 */

const API_BASE = "https://api.vercel.com";

export interface VercelProviderConfig {
  token: string;
  projectId: string;
  teamId?: string;
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

interface VercelResponse {
  status: number;
  data: any;
}

/** Maps Vercel failures to messages that are safe to show a store owner - never the raw
 * response (which can include account/project identifiers). */
function friendlyError(status: number, data: any, action: string): string {
  const code = String(data?.error?.code ?? "");
  if (status === 401) return "The hosting connection is not authorized. Please contact platform support.";
  if (status === 402) return "The hosting account needs attention (billing). Please contact platform support.";
  if (status === 403) return "The hosting account isn't allowed to use this domain. Please contact platform support.";
  if (status === 409 || code.includes("in_use") || code.includes("conflict")) {
    return "This domain is already connected to another website on Vercel. Remove it from that website first, then try again.";
  }
  if (status === 400 && code.includes("invalid")) return "The hosting provider says this domain name is not valid.";
  if (status === 429) return "Too many requests to the hosting provider - please wait a minute and try again.";
  return `Could not ${action} right now. Please try again in a few minutes.`;
}

function isAlreadyExistsError(status: number, data: any): boolean {
  const text = `${data?.error?.code ?? ""} ${data?.error?.message ?? ""}`.toLowerCase();
  return (status === 400 || status === 409) && text.includes("already") && (text.includes("this project") || text.includes("exists") || text.includes("project_domain"));
}

export function createVercelProvider(config: VercelProviderConfig, fetchImpl: FetchLike = fetch): DeploymentProvider {
  const projectPath = `/projects/${encodeURIComponent(config.projectId)}`;

  async function call(method: string, path: string, body?: unknown): Promise<VercelResponse> {
    const url = new URL(API_BASE + path);
    if (config.teamId) url.searchParams.set("teamId", config.teamId);
    try {
      const res = await fetchImpl(url.toString(), {
        method,
        headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    } catch (err) {
      console.error(`[vercel] ${method} ${path} failed`, err instanceof Error ? err.message : err);
      return { status: 0, data: {} };
    }
  }

  async function getProjectDomain(hostname: string) {
    return call("GET", `/v9${projectPath}/domains/${encodeURIComponent(hostname)}`);
  }

  const provider: DeploymentProvider = {
    id: "vercel",
    displayName: "Vercel",

    isConfigured() {
      return true;
    },

    async addDomain(hostname: string, opts?: { redirectTo?: string }): Promise<ProviderDomainOpResult> {
      const body: Record<string, unknown> = { name: hostname };
      if (opts?.redirectTo) {
        body.redirect = opts.redirectTo;
        body.redirectStatusCode = 308;
      }
      const res = await call("POST", `/v10${projectPath}/domains`, body);
      if (res.status >= 200 && res.status < 300) return { ok: true };
      // Idempotent: already attached to THIS project counts as success.
      if (isAlreadyExistsError(res.status, res.data) || res.status === 409) {
        const existing = await getProjectDomain(hostname);
        if (existing.status === 200) return { ok: true };
      }
      if (res.status === 0) return { ok: false, error: "The hosting provider could not be reached. Please try again." };
      console.error(`[vercel] addDomain ${hostname} -> ${res.status} ${res.data?.error?.code ?? ""}`);
      return { ok: false, error: friendlyError(res.status, res.data, "connect the domain") };
    },

    async getDomainStatus(hostname: string): Promise<ProviderDomainStatus> {
      const [domainRes, configRes] = await Promise.all([
        getProjectDomain(hostname),
        call("GET", `/v6/domains/${encodeURIComponent(hostname)}/config?projectIdOrName=${encodeURIComponent(config.projectId)}`),
      ]);
      const recommendedIPv4 = pickRanked(configRes.data?.recommendedIPv4, (v) => (Array.isArray(v) ? v[0] : v));
      const recommendedCNAME = pickRanked(configRes.data?.recommendedCNAME, (v) => v);
      const base = {
        recommendedIPv4: typeof recommendedIPv4 === "string" ? recommendedIPv4 : undefined,
        recommendedCNAME: typeof recommendedCNAME === "string" ? recommendedCNAME.replace(/\.$/, "") : undefined,
      };
      if (domainRes.status === 404) {
        return { attached: false, verified: false, misconfigured: true, verification: [], ...base };
      }
      if (domainRes.status !== 200) {
        return {
          attached: false,
          verified: false,
          misconfigured: true,
          verification: [],
          ...base,
          error: domainRes.status === 0 ? "The hosting provider could not be reached." : friendlyError(domainRes.status, domainRes.data, "check the domain"),
        };
      }
      const verification = Array.isArray(domainRes.data?.verification)
        ? domainRes.data.verification
            .filter((v: any) => v && typeof v.domain === "string" && typeof v.value === "string")
            .map((v: any) => ({ type: String(v.type ?? "TXT"), domain: v.domain, value: v.value }))
        : [];
      return {
        attached: true,
        verified: domainRes.data?.verified === true,
        // No config response = unknown; treat as not yet configured rather than "fine".
        misconfigured: configRes.status === 200 ? configRes.data?.misconfigured !== false : true,
        verification,
        ...base,
      };
    },

    async verifyDomainChallenge(hostname: string): Promise<ProviderDomainOpResult> {
      const res = await call("POST", `/v9${projectPath}/domains/${encodeURIComponent(hostname)}/verify`);
      if (res.status >= 200 && res.status < 300) return { ok: true };
      return { ok: false, error: res.status === 0 ? "The hosting provider could not be reached." : "The hosting provider's verification record isn't visible yet." };
    },

    async removeDomain(hostname: string): Promise<ProviderDomainOpResult> {
      const res = await call("DELETE", `/v9${projectPath}/domains/${encodeURIComponent(hostname)}`);
      if ((res.status >= 200 && res.status < 300) || res.status === 404) return { ok: true };
      console.error(`[vercel] removeDomain ${hostname} -> ${res.status} ${res.data?.error?.code ?? ""}`);
      return { ok: false, error: res.status === 0 ? "The hosting provider could not be reached." : friendlyError(res.status, res.data, "remove the domain") };
    },

    async verifyDomain(hostname: string): Promise<DomainVerificationResult> {
      const status = await provider.getDomainStatus(hostname);
      if (status.error) return { verified: false, dnsStatus: "pending", sslStatus: "pending", message: status.error };
      if (!status.attached) {
        return { verified: false, dnsStatus: "pending", sslStatus: "pending", message: `${hostname} is not attached to the platform's hosting project yet.` };
      }
      const dnsOk = status.verified && !status.misconfigured;
      if (!dnsOk) {
        return { verified: false, dnsStatus: "pending", sslStatus: "pending", message: `${hostname}: DNS is not pointing at the platform yet.` };
      }
      const { isServingHttps } = await import("@/lib/domains/dns-check");
      const https = await isServingHttps(hostname);
      return {
        verified: https,
        dnsStatus: "verified",
        sslStatus: https ? "active" : "pending",
        message: https ? `${hostname} is live with HTTPS.` : `${hostname}: DNS is correct; the SSL certificate is still being issued.`,
      };
    },

    async triggerDeployment(): Promise<DeploymentTriggerResult> {
      return {
        success: false,
        message: "Not needed - every store is served by the same platform deployment (new code ships through the normal git deploy).",
      };
    },
  };
  return provider;
}

function pickRanked(list: unknown, map: (value: any) => unknown): unknown {
  if (!Array.isArray(list) || !list.length) return undefined;
  const sorted = [...list].sort((a: any, b: any) => Number(a?.rank ?? 99) - Number(b?.rank ?? 99));
  return map((sorted[0] as any)?.value);
}

export function vercelConfigFromEnv(): VercelProviderConfig | null {
  const token = process.env.VERCEL_API_TOKEN?.trim();
  const projectId = process.env.VERCEL_PROJECT_ID?.trim();
  if (!token || !projectId) return null;
  return { token, projectId, teamId: process.env.VERCEL_TEAM_ID?.trim() || undefined };
}
