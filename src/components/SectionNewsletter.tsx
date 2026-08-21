"use client";

import React, { FC, useState } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { subscribeToNewsletter } from "@/lib/newsletter/actions";
import { trackEvent } from "@/lib/analytics/track";
import { EnvelopeIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

export interface SectionNewsletterProps {
  className?: string;
  heading?: string;
  subHeading?: string;
  buttonText?: string;
  placeholderText?: string;
}

const SectionNewsletter: FC<SectionNewsletterProps> = ({
  className = "",
  heading = "Join our newsletter 🎉",
  subHeading = "Get the latest deals and new arrivals straight to your inbox.",
  buttonText = "Subscribe",
  placeholderText = "Enter your email",
}) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const result = await subscribeToNewsletter(email);
    setMessage(result.message);
    setStatus(result.ok ? "done" : "error");
    if (result.ok) {
      trackEvent("newsletter_signup");
      setEmail("");
    }
  };

  return (
    <div className={`nc-SectionNewsletter relative ${className}`}>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-14 border border-slate-800 shadow-2xl">
        {/* Ambient Glow & Decorative Elements */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold tracking-wide text-indigo-200 backdrop-blur-md">
            <EnvelopeIcon className="w-4 h-4 text-indigo-300" />
            <span>Stay Updated</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {heading || "Join our newsletter 🎉"}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            {subHeading || "Get the latest deals and new arrivals straight to your inbox."}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-4">
            <div className="relative flex-1">
              <input
                type="email"
                required
                placeholder={placeholderText || "Enter your email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/15 text-sm font-medium transition-all shadow-inner"
              />
            </div>
            <ButtonPrimary
              type="submit"
              loading={status === "loading"}
              className="!rounded-2xl px-6 py-3.5 text-sm font-bold shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <span>{buttonText || "Subscribe"}</span>
              <PaperAirplaneIcon className="w-4 h-4" />
            </ButtonPrimary>
          </form>

          {message && (
            <div className={`text-xs font-semibold px-4 py-2 rounded-xl inline-block mt-3 ${
              status === "error"
                ? "bg-red-500/20 text-red-200 border border-red-500/30"
                : "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionNewsletter;
