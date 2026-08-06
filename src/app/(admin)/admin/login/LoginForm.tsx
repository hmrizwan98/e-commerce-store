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
}: {
  redirectTo?: string;
  errorMessage?: string;
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label>Email address</Label>
        <Input
          type="email"
          className="mt-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
      </div>
      <div>
        <Label>Password</Label>
        <Input
          type="password"
          className="mt-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <ButtonPrimary type="submit" className="w-full" loading={loading}>
        Sign in
      </ButtonPrimary>
    </form>
  );
};

export default LoginForm;
