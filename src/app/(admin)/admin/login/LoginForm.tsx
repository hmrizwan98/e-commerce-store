"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import Input from "@/shared/Input/Input";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Label from "@/components/Label/Label";

/** redirectTo/errorMessage let the same form + session-cookie flow serve both the store admin and Super Admin login pages. */
const LoginForm = ({
  redirectTo = "/admin",
  errorMessage = "Invalid email or password, or this account is not an admin.",
  isDarkCard = false,
}: {
  redirectTo?: string;
  errorMessage?: string;
  isDarkCard?: boolean;
}) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const attemptCheck = await fetch("/api/admin/login-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const attemptResult = await attemptCheck.json();
      if (!attemptResult.allowed) {
        setError(
          `Too many login attempts. Try again in ${Math.ceil((attemptResult.retryAfterSeconds ?? 60) / 60)} minute(s).`
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
      if (!res.ok) throw new Error("session-failed");
      router.push(redirectTo as any);
      router.refresh();
    } catch {
      setError(errorMessage);
      setLoading(false);
    }
  };

  const labelClass = isDarkCard
    ? "block text-xs font-bold uppercase tracking-wider font-mono text-slate-200 mb-1.5"
    : undefined;

  const inputClass = isDarkCard
    ? "mt-1 bg-slate-800/90 border-slate-700 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-xl px-4 py-3 text-sm font-medium transition-all"
    : "mt-1";

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
        <Input
          type="password"
          className={inputClass}
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-xs font-bold text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</p>}
      
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

