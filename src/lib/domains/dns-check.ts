import "server-only";
import { Resolver } from "node:dns/promises";
import { ownershipTxtName, txtRecordsContainToken } from "./custom-domain";

/** Public resolvers, so a freshly-added record is seen without waiting on whatever the
 * hosting region's default resolver has cached. */
const PUBLIC_DNS_SERVERS = ["1.1.1.1", "8.8.8.8"];

/** Checks the owner's `_webriiz-verify.<domain>` TXT record for this request's token.
 * NXDOMAIN / no record / timeout all mean "not found yet" - never throws. */
export async function hasOwnershipTxtRecord(hostname: string, token: string): Promise<boolean> {
  const resolver = new Resolver({ timeout: 4000, tries: 2 });
  resolver.setServers(PUBLIC_DNS_SERVERS);
  try {
    const records = await resolver.resolveTxt(ownershipTxtName(hostname));
    return txtRecordsContainToken(records, token);
  } catch {
    return false;
  }
}

/**
 * Real HTTPS check: a request to https://<host>/ only completes if DNS points somewhere
 * AND a valid TLS certificate is being served for that name. The response must also come
 * from our hosting provider (Vercel sets x-vercel-id), so a domain still pointing at an old
 * host doesn't count as connected. Never throws.
 */
export async function isServingHttps(hostname: string): Promise<boolean> {
  try {
    const res = await fetch(`https://${hostname}/`, {
      method: "HEAD",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return Boolean(res.headers.get("x-vercel-id")) || (res.headers.get("server") ?? "").toLowerCase() === "vercel";
  } catch {
    return false;
  }
}
