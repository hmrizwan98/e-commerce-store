"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { mapFirebaseAuthError } from "@/lib/firebase/auth-errors";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Input from "@/shared/Input/Input";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Label from "@/components/Label/Label";

/** redirectTo/errorMessage let the same form + session-cookie flow serve both the store admin and Super Admin login pages. */
const LoginForm = ({
  redirectTo = "/admin",
  errorMessage = "Invalid email or password, or this account is not an admin.",
  isDarkCard = false,
  resetPasswordPath,
  tenantSlug,
}: {
  redirectTo?: string;
  errorMessage?: string;
  isDarkCard?: boolean;
  /** Defaults to the Super Admin reset page when redirectTo is "/superadmin", otherwise the store-admin one. */
  resetPasswordPath?: string;
  /** Store Admin only - this tenant's slug, so the emailed reset link can carry it as a
   * query param instead of pointing at this store's own admin-{slug} subdomain (see
   * handleForgotSubmit for why that subdomain can't be used directly). */
  tenantSlug?: string;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot" | "sent">("login");
  const [forgotEmail, setForgotEmail] = useState("");

  const [targetStoreInfo, setTargetStoreInfo] = useState<{ slug: string; name: string } | null>(null);

  const effectiveResetPath = resetPasswordPath ?? (redirectTo === "/superadmin" ? "/superadmin/reset-password" : "/admin/reset-password");

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Firebase Auth rejects generatePasswordResetLink/sendPasswordResetEmail's
      // actionCodeSettings.url with "Domain not allowlisted by project" for any hostname
      // not in the project's Authorized Domains list - a finite, manually-configured list
      // that can never contain every per-tenant admin-{slug} subdomain this platform
      // provisions. For a Store Admin login (tenantSlug set), route the link through the
      // stable root domain instead, carrying the slug as a query param so the shared
      // reset-password page can still redirect back to the right store afterward.
      // Mirrors getPlatformBaseUrl()'s fallback chain (src/lib/platform/base-url.ts) so this
      // agrees with the server even when NEXT_PUBLIC_ROOT_DOMAIN isn't explicitly set -
      // production always has a stable root domain to fall back to.
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || (process.env.NODE_ENV === "production" ? "webriiz.com" : undefined);
      const rootOrigin = rootDomain ? `https://${rootDomain}` : window.location.origin;
      const resetUrl = tenantSlug
        ? `${rootOrigin}${effectiveResetPath}?slug=${encodeURIComponent(tenantSlug)}`
        : `${rootOrigin}${effectiveResetPath}`;
      await sendPasswordResetEmail(getFirebaseAuth(), forgotEmail, {
        url: resetUrl,
        handleCodeInApp: false,
      });
    } catch (err: any) {
      // Never reveal whether an account exists - only surface genuinely
      // unexpected failures (network/config), not "no such user".
      if (err?.code !== "auth/user-not-found" && err?.code !== "auth/invalid-email") {
        console.error("[LoginForm] password reset request failed:", err);
        setError(mapFirebaseAuthError(err));
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    setMode("sent");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTargetStoreInfo(null);
    setLoading(true);
    try {
      const attemptCheck = await fetch("/api/admin/login-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const attemptResult = await attemptCheck.json().catch(() => null);
      if (!attemptResult || !attemptResult.allowed) {
        setError(
          attemptResult
            ? `Too many login attempts. Try again in ${Math.ceil((attemptResult.retryAfterSeconds ?? 60) / 60)} minute(s).`
            : "Something went wrong. Please try again."
        );
        setLoading(false);
        return;
      }

      const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      // Force-refresh the ID token so any recently-set custom claims are included.
      const idToken = await credential.user.getIdToken(true);
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.targetSlug) {
          setTargetStoreInfo({ slug: data.targetSlug, name: data.targetName || data.targetSlug });
        }
        throw new Error(data.error || errorMessage);
      }
      // A hard navigation, not router.push()+router.refresh() - confirmed via real
      // browser testing that the two back-to-back client-router calls can leave the
      // browser stuck on /admin/login even though the session cookie was already set
      // correctly and the target route's own fetch succeeded (a Next.js 14.2.x
      // App Router race: refresh() invalidating the Router Cache while push()'s
      // transition is still in flight). A full navigation also guarantees the very
      // first render of the destination page sees the brand-new session cookie
      // rather than a still-in-flight RSC payload.
      window.location.href = redirectTo;
    } catch (err: any) {
      console.error("[LoginForm] sign-in failed:", err);
      // A raw FirebaseError (has a `.code`, e.g. auth/invalid-credential) must never be
      // shown verbatim - map it to a clear message. An error thrown from the
      // /api/admin/session response (a plain Error with a server-authored message, no
      // `.code`) is already professional/clean and can be shown as-is.
      setError(err?.code ? mapFirebaseAuthError(err) : err?.message || errorMessage);
      setLoading(false);
    }
  };

  const labelClass = isDarkCard
    ? "block text-xs font-bold uppercase tracking-wider font-mono text-slate-200 mb-1.5"
    : undefined;

  // Input's own base classes (bg-white, text-neutral-900, etc.) are plain
  // utility classes with no higher specificity than these overrides, so
  // Tailwind's internal stylesheet ordering - not the order classes are
  // written here - decides which one wins; that silently made this dark
  // card's email/password text invisible (white-on-white). The `!` modifier
  // forces these specific overrides to always win, regardless of ordering.
  const inputClass = isDarkCard
    ? "mt-1 !bg-slate-800/90 !border-slate-700 !text-white placeholder-slate-400 focus:!border-cyan-400 focus:!ring-cyan-400/20 rounded-xl px-4 py-3 text-sm font-medium transition-all"
    : "mt-1";

  const linkClass = isDarkCard
    ? "text-xs font-semibold text-sky-400 hover:text-sky-300"
    : "text-xs font-semibold text-primary-6000 hover:underline";

  if (mode === "sent") {
    return (
      <div className="space-y-5">
        <p className={isDarkCard ? "text-sm text-slate-200" : "text-sm text-neutral-700"}>
          If an account exists for <span className="font-semibold">{forgotEmail}</span>, a password reset link has
          been sent. Check the inbox and follow the link to choose a new password.
        </p>
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
          }}
          className={linkClass}
        >
          ← Back to sign in
        </button>
      </div>
    );
  }

  if (mode === "forgot") {
    return (
      <form onSubmit={handleForgotSubmit} className="space-y-5">
        <div>
          {isDarkCard ? (
            <label className={labelClass}>OPERATOR EMAIL</label>
          ) : (
            <Label>Email address</Label>
          )}
          <Input
            type="email"
            className={inputClass}
            placeholder={isDarkCard ? "operator@platform.internal" : "admin@brand.com"}
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        {error && (
          <p className="text-xs font-bold text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</p>
        )}
        {isDarkCard ? (
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-indigo-700 hover:from-sky-400 hover:to-indigo-600 shadow-lg shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        ) : (
          <ButtonPrimary type="submit" className="w-full" loading={loading}>
            Send reset link
          </ButtonPrimary>
        )}
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
          }}
          className={linkClass}
        >
          ← Back to sign in
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        {isDarkCard ? (
          <label className={labelClass}>OPERATOR EMAIL</label>
        ) : (
          <Label>Email address</Label>
        )}
        <Input
          type="email"
          className={inputClass}
          placeholder={isDarkCard ? "operator@platform.internal" : "admin@brand.com"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
      </div>
      <div>
        {isDarkCard ? (
          <label className={labelClass}>AUTHENTICATION PASSWORD</label>
        ) : (
          <Label>Password</Label>
        )}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            className={`${inputClass} !pr-11`}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className={`absolute inset-y-0 right-0 flex items-center px-3.5 ${
              isDarkCard ? "text-slate-400 hover:text-slate-200" : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
          </button>
        </div>
        <div className="mt-2 text-right">
          <button
            type="button"
            onClick={() => {
              setMode("forgot");
              setError(null);
              setForgotEmail(email);
            }}
            className={linkClass}
          >
            Forgot password?
          </button>
        </div>
      </div>
      {error && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</p>
          {targetStoreInfo && (
            <a
              href={`/store/${targetStoreInfo.slug}/admin/login`}
              className="block text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:underline transition-all"
            >
              👉 Click here to sign in to {targetStoreInfo.name} Login (/store/{targetStoreInfo.slug}/admin/login)
            </a>
          )}
        </div>
      )}
      
      {isDarkCard ? (
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-sky-500 via-indigo-600 to-indigo-700 hover:from-sky-400 hover:to-indigo-600 shadow-lg shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Sign in to Control Center"}
        </button>
      ) : (
        <ButtonPrimary type="submit" className="w-full" loading={loading}>
          Sign in
        </ButtonPrimary>
      )}
    </form>
  );
};

export default LoginForm;

