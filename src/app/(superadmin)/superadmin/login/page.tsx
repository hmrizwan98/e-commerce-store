import React from "react";
import LoginForm from "@/app/(admin)/admin/login/LoginForm";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function SuperAdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-6000/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-6000 via-indigo-600 to-cyan-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-primary-6000/25">
            <ShieldCheckIcon className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Super Admin Control Center</h1>
          <p className="text-xs font-mono text-neutral-400">Authenticated Platform Operators Only</p>
        </div>

        <LoginForm
          redirectTo="/superadmin"
          errorMessage="Invalid email or password, or this account is not a super admin."
        />
      </div>
    </div>
  );
}

