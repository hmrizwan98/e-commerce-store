import React from "react";
import LoginForm from "@/app/(admin)/admin/login/LoginForm";
import { ShieldCheckIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function SuperAdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090d16] text-white p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Radial Gradient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-sky-600/30 via-indigo-600/20 to-purple-600/30 rounded-full blur-[140px] pointer-events-none" />

      {/* Card Container */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 sm:p-10 space-y-7 relative z-10">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-600 to-cyan-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
            <ShieldCheckIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Super Admin Control Center
            </h1>
            <p className="text-xs font-mono font-medium text-sky-400 uppercase tracking-wider">
              Authenticated Platform Operators Only
            </p>
          </div>
        </div>

        <LoginForm
          redirectTo="/superadmin"
          errorMessage="Invalid email or password, or this account is not a super admin."
          isDarkCard={true}
        />

        <div className="pt-4 border-t border-slate-800/80 text-center flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400">
          <LockClosedIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Tenant-Isolated Platform Security Enforced</span>
        </div>
      </div>
    </div>
  );
}


