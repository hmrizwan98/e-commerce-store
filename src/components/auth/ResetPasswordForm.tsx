"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPasswordReset } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { mapFirebaseAuthError } from "@/lib/firebase/auth-errors";
import Input from "@/shared/Input/Input";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Label from "@/components/Label/Label";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

/** Shared by both /admin/reset-password and /superadmin/reset-password - the page that
 * a "Forgot password?" email link (from LoginForm.tsx's sendPasswordResetEmail call)
 * lands on. Firebase itself never redirects here directly; actionCodeSettings.url points
 * at this route with ?oobCode=... appended automatically. */
const ResetPasswordForm = ({
  loginPath,
  isDarkCard = false,
}: {
  loginPath: string;
  isDarkCard?: boolean;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  // Present when this link was emailed for a specific store (see
  // buildResetPasswordLinkUrl()/LoginForm.tsx's handleForgotSubmit) - the link itself points
  // at the stable root domain, never at that store's own admin-{slug} subdomain, so the slug
  // travels as a query param instead and is used only to redirect back to the right store's
  // login page after a successful reset.
  // Firebase's own "Forgot password?" emails (custom action URL) carry the original link's
  // query inside continueUrl instead, so fall back to the slug found there.
  const slug =
    searchParams.get("slug") ||
    (() => {
      try {
        const continueUrl = searchParams.get("continueUrl");
        return continueUrl ? new URL(continueUrl).searchParams.get("slug") : null;
      } catch {
        return null;
      }
    })();
  const effectiveLoginPath = slug
    ? `https://admin-${slug}.${typeof window !== "undefined" ? window.location.host : ""}/admin/login`
    : loginPath;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const labelClass = isDarkCard
    ? "block text-xs font-bold uppercase tracking-wider font-mono text-slate-200 mb-1.5"
    : undefined;
  const inputClass = isDarkCard
    ? "mt-1 !bg-slate-800/90 !border-slate-700 !text-white placeholder-slate-400 focus:!border-cyan-400 focus:!ring-cyan-400/20 rounded-xl px-4 py-3 text-sm font-medium transition-all"
    : "mt-1";
  const linkClass = isDarkCard
    ? "text-xs font-semibold text-sky-400 hover:text-sky-300"
    : "text-xs font-semibold text-primary-6000 hover:underline";

  if (!oobCode) {
    return (
      <div className="space-y-5">
        <p className="text-xs font-bold text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
          This password reset link is invalid or has expired.
        </p>
        <a href={effectiveLoginPath} className={linkClass}>
          ← Back to sign in
        </a>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-5">
        <p className={isDarkCard ? "text-sm text-slate-200" : "text-sm text-neutral-700"}>
          Your password has been updated. Redirecting you to sign in…
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Please choose a password with at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset(getFirebaseAuth(), oobCode, password);
      setDone(true);
      setTimeout(() => {
        // slug means effectiveLoginPath is a different subdomain (admin-{slug}.<root>) -
        // router.push() can't cross origins, so this needs a real navigation.
        if (slug) window.location.href = effectiveLoginPath;
        else router.push(effectiveLoginPath as any);
      }, 2000);
    } catch (err: any) {
      console.error("[ResetPasswordForm] confirmPasswordReset failed:", err);
      setError(mapFirebaseAuthError(err));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        {isDarkCard ? <label className={labelClass}>NEW PASSWORD</label> : <Label>New password</Label>}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            className={`${inputClass} !pr-11`}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
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
      </div>
      <div>
        {isDarkCard ? <label className={labelClass}>CONFIRM PASSWORD</label> : <Label>Confirm new password</Label>}
        <Input
          type={showPassword ? "text" : "password"}
          className={inputClass}
          placeholder="••••••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
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
          {loading ? "Updating..." : "Set new password"}
        </button>
      ) : (
        <ButtonPrimary type="submit" className="w-full" loading={loading}>
          Set new password
        </ButtonPrimary>
      )}
    </form>
  );
};

export default ResetPasswordForm;
