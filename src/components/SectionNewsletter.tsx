"use client";

import React, { FC, useState } from "react";
import Input from "@/shared/Input/Input";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { subscribeToNewsletter } from "@/lib/newsletter/actions";
import { trackEvent } from "@/lib/analytics/track";

export interface SectionNewsletterProps {
  className?: string;
  heading?: string;
  subHeading?: string;
}

const SectionNewsletter: FC<SectionNewsletterProps> = ({
  className = "",
  heading = "Join our newsletter 🎉",
  subHeading = "Get the latest deals and new arrivals straight to your inbox.",
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
      <div className="text-center max-w-xl mx-auto space-y-4">
        <h2 className="text-2xl sm:text-3xl font-semibold">{heading}</h2>
        <p className="text-slate-500 dark:text-slate-400">{subHeading}</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="sm:w-80"
          />
          <ButtonPrimary type="submit" loading={status === "loading"}>
            Subscribe
          </ButtonPrimary>
        </form>
        {message && (
          <p className={`text-sm ${status === "error" ? "text-red-600" : "text-green-600"}`}>{message}</p>
        )}
      </div>
    </div>
  );
};

export default SectionNewsletter;
