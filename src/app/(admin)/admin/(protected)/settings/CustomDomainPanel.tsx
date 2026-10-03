"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  CheckCircleIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { addCustomDomainAction, checkCustomDomainAction, removeCustomDomainAction } from "./domain-actions";
import type { CustomDomainView } from "@/lib/domains/custom-domain-service";
import type { CustomDomainDnsRecord, CustomDomainStepState } from "@/types/domain-settings";

const inputClass =
  "w-full px-4 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-xs";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary-6000 hover:bg-primary-700 text-white text-xs font-bold shadow-lg shadow-primary-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer";
const secondaryBtn =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer";

const PURPOSE_LABELS: Record<CustomDomainDnsRecord["purpose"], string> = {
  ownership: "Proves you own the domain",
  storefront: "Your online store",
  www: "www. address (redirects to your store)",
  admin: "Your Store Admin",
  provider_verification: "Hosting verification",
};

const STEPS: { key: "ownership" | "providerAdded" | "dns" | "ssl"; label: string }[] = [
  { key: "ownership", label: "Domain ownership verified" },
  { key: "providerAdded", label: "Domain connected to your store" },
  { key: "dns", label: "DNS pointing to your store" },
  { key: "ssl", label: "Secure HTTPS (SSL) active" },
];

function StepIcon({ state }: { state: CustomDomainStepState }) {
  if (state === "done") return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />;
  if (state === "error") return <ExclamationTriangleIcon className="w-5 h-5 text-rose-500" />;
  return <span className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 inline-block" />;
}

function CopyValue({ value }: { value: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          toast.success("Copied");
        } catch {
          toast.error("Couldn't copy - please select and copy it manually.");
        }
      }}
      className="group inline-flex items-start gap-1.5 text-left font-mono text-xs text-slate-800 dark:text-slate-200 break-all hover:text-primary-600"
      title="Copy"
    >
      <span>{value}</span>
      <ClipboardDocumentIcon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-primary-600" />
    </button>
  );
}

export default function CustomDomainPanel({ initial }: { initial: CustomDomainView }) {
  const [view, setView] = useState<CustomDomainView>(initial);
  const [domainInput, setDomainInput] = useState("");
  const [busy, setBusy] = useState<null | "add" | "check" | "remove">(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const req = view.request;
  const isActive = req?.status === "active";
  const lastCheck = req?.lastCheck;

  const act = async (kind: "add" | "check" | "remove", fn: () => ReturnType<typeof checkCustomDomainAction>) => {
    setBusy(kind);
    try {
      const result = await fn();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setView(result.data);
      if (kind === "add") {
        setDomainInput("");
        toast.success("Domain added - now add the DNS records below.");
      } else if (kind === "check") {
        const check = result.data.request?.lastCheck;
        if (result.data.request?.status === "active" && check?.ssl === "done") toast.success("Your domain is connected!");
        else toast("Status updated", { icon: "🔄" });
      } else {
        setConfirmRemove(false);
        toast.success("Domain removed. Your store is back on its default address.");
        // If this page is being used ON the removed domain's admin host, that host stops
        // working now - move to the default Store Admin address.
        if (typeof window !== "undefined" && view.adminHostname && window.location.hostname === view.adminHostname) {
          window.location.href = result.data.defaultAdminUrl;
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      {!view.providerConfigured && (
        <div className="flex gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
          <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
          <p>
            Custom domains are not switched on for this platform yet. You can add your domain and its DNS records now -
            ownership will be verified, and the connection completes once platform support enables it.
          </p>
        </div>
      )}

      {/* Current addresses */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { label: "Online store", url: view.storefrontUrl },
          { label: "Store Admin", url: view.adminUrl },
        ].map((a) => (
          <div key={a.label} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{a.label}</p>
            <a href={a.url} target="_blank" rel="noreferrer" className="mt-1 block text-sm font-semibold text-primary-600 hover:underline break-all">
              {a.url.replace(/^https?:\/\//, "")}
            </a>
          </div>
        ))}
      </div>

      {/* Add a domain */}
      {!req && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Use your own domain (for example <span className="font-semibold">mystore.com</span> or{" "}
            <span className="font-semibold">mystore.pk</span>) instead of the default address. Buy it from any domain provider
            (Namecheap, GoDaddy, PKNIC...), then add it here. Your store will open at <span className="font-mono">mystore.com</span>{" "}
            and your Store Admin at <span className="font-mono">admin.mystore.com</span>.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (domainInput.trim()) act("add", () => addCustomDomainAction(domainInput));
            }}
          >
            <input
              className={inputClass}
              placeholder="mystore.com"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <button type="submit" className={`${primaryBtn} shrink-0`} disabled={busy !== null || !domainInput.trim()}>
              <GlobeAltIcon className="w-4 h-4" />
              {busy === "add" ? "Adding…" : "Add domain"}
            </button>
          </form>
        </div>
      )}

      {req && (
        <>
          {/* Status */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Your domain</p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100 break-all">{req.hostname}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isActive && lastCheck?.ssl === "done"
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                    : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                }`}
              >
                {isActive && lastCheck?.ssl === "done" ? "● Connected" : isActive ? "● Needs attention" : "● Waiting for DNS"}
              </span>
            </div>

            <ol className="grid sm:grid-cols-2 gap-2">
              {STEPS.map((step) => (
                <li key={step.key} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <StepIcon state={lastCheck?.[step.key] ?? "pending"} />
                  {step.label}
                </li>
              ))}
            </ol>

            {lastCheck?.message && (
              <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                {lastCheck.message}
                <span className="block mt-1 text-[11px] text-slate-400" suppressHydrationWarning>
                  Last checked {new Date(lastCheck.checkedAt).toLocaleString()}
                </span>
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button type="button" className={primaryBtn} disabled={busy !== null} onClick={() => act("check", () => checkCustomDomainAction())}>
                <ArrowPathIcon className={`w-4 h-4 ${busy === "check" ? "animate-spin" : ""}`} />
                {busy === "check" ? "Checking…" : isActive ? "Check again" : "Check status"}
              </button>
              {!confirmRemove ? (
                <button type="button" className={secondaryBtn} disabled={busy !== null} onClick={() => setConfirmRemove(true)}>
                  {isActive ? "Disconnect domain" : "Remove / change domain"}
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2 p-2 pl-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                    {isActive ? "Your store will go back to its default address. Continue?" : "Remove this domain?"}
                  </span>
                  <button
                    type="button"
                    className="px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50"
                    disabled={busy !== null}
                    onClick={() => act("remove", () => removeCustomDomainAction())}
                  >
                    {busy === "remove" ? "Removing…" : "Yes, remove"}
                  </button>
                  <button type="button" className="px-3 py-1.5 text-xs font-semibold text-slate-600" onClick={() => setConfirmRemove(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
            {isActive && lastCheck?.ssl === "done" && (
              <p className="text-xs text-slate-500">
                Visitors to your old address are sent to <span className="font-semibold">{req.hostname}</span> automatically. Your
                Store Admin now opens at <span className="font-semibold">{view.adminHostname}</span> - you&apos;ll be asked to sign in
                there once.
              </p>
            )}
          </div>

          {/* DNS records */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">DNS records to add at your domain provider</h3>
              <p className="text-xs text-slate-500 mt-1">
                Open your domain provider&apos;s DNS settings and add each record below exactly as shown (tap a value to copy it).
                Remove any other A or CNAME records for the same names first.
              </p>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3 font-bold">Type</th>
                    <th className="p-3 font-bold">Host / Name</th>
                    <th className="p-3 font-bold">Value / Points to</th>
                    <th className="p-3 font-bold hidden md:table-cell">For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {view.records.map((r) => (
                    <tr key={`${r.type}-${r.fqdn}-${r.value}`} className="align-top">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-slate-100">{r.type}</td>
                      <td className="p-3">
                        <CopyValue value={r.host} />
                      </td>
                      <td className="p-3">
                        <CopyValue value={r.value} />
                      </td>
                      <td className="p-3 text-slate-500 hidden md:table-cell">{PURPOSE_LABELS[r.purpose]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="text-xs text-slate-500 space-y-1 list-disc pl-5">
              <li>&quot;@&quot; means the domain itself. Some providers want the full name instead - e.g. {req.hostname}.</li>
              <li>Using Cloudflare? Set these records to &quot;DNS only&quot; (grey cloud), not proxied.</li>
              <li>DNS changes usually work within minutes, but can take up to 24-48 hours. Press &quot;Check status&quot; any time.</li>
              <li>The free SSL certificate (https) is issued automatically once DNS is correct.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
