"use client";

import React, { useState, useEffect, useRef } from "react";
import { XMarkIcon, SparklesIcon, ShieldCheckIcon, BanknotesIcon, CloudIcon, ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useBookDemoModal } from "./BookDemoContext";
import { submitBookDemoRequest } from "@/app/(marketing)/platform/book-demo/actions";

const inputClass =
  "w-full px-4 py-3 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/60 dark:bg-neutral-900/60 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-6000/50 focus:border-primary-6000 transition-all";
const labelClass = "block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1 font-mono";

export default function BookDemoModal() {
  const { isOpen, closeBookDemoModal } = useBookDemoModal();
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", storeType: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Prevent background scrolling while open & handle focus + escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus first input
    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeBookDemoModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, closeBookDemoModal]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const res = await submitBookDemoRequest(form);
      setResult(res);
      if (res.ok) {
        setForm({ name: "", email: "", company: "", phone: "", storeType: "", message: "" });
        // Auto-close on success after short delay
        setTimeout(() => {
          closeBookDemoModal();
          setResult(null);
        }, 2200);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-demo-drawer-title"
      className="fixed inset-0 z-50 flex justify-end overflow-hidden"
    >
      {/* Backdrop overlay */}
      <div
        onClick={closeBookDemoModal}
        className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-4xl h-full bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 shadow-2xl flex flex-col md:flex-row overflow-y-auto md:overflow-hidden z-10 animate-in slide-in-from-bottom md:slide-in-from-right duration-300 ease-out">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeBookDemoModal}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          aria-label="Close demo request"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Left Side: Brand & Value Proposition Column (Desktop Split) */}
        <div className="w-full md:w-5/12 bg-neutral-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-neutral-800 shrink-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary-6000/30 via-indigo-600/10 to-transparent pointer-events-none" />

          <div className="relative space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold font-mono tracking-wider uppercase text-primary-400">
              <SparklesIcon className="w-4 h-4 text-primary-400" />
              <span>Tradez Glint Platform</span>
            </div>

            <h2 id="book-demo-drawer-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Launch your store without technical complexity.
            </h2>

            <p className="text-sm text-neutral-300 leading-relaxed">
              Schedule a personalized 1-on-1 demo call to tour Store Admin, Super Admin, themes, and commission pricing live.
            </p>

            <ul className="space-y-4 pt-2 text-xs text-neutral-300">
              <li className="flex items-start gap-3">
                <BanknotesIcon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero setup fee — growth-aligned commission model</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheckIcon className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span>Tenant-isolated Firestore data with full security audit trail</span>
              </li>
              <li className="flex items-start gap-3">
                <CloudIcon className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <span>Dedicated Store Admin, 4 Instant Themes & Cloudinary CDN</span>
              </li>
            </ul>
          </div>

          <div className="relative pt-8 border-t border-neutral-800 text-[11px] text-neutral-400 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Dedicated engineering team ready to walk you through</span>
          </div>
        </div>

        {/* Right Side: Form Column */}
        <div className="w-full md:w-7/12 p-8 sm:p-10 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-6000 font-mono">1-on-1 Walkthrough</span>
              <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight mt-1">
                Tell us about your business
              </h3>
            </div>

            {result?.ok ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-center space-y-3 my-8">
                <CheckCircleIcon className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-lg">Request Received!</h4>
                <p className="text-sm">{result.message}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Name *</label>
                    <input
                      ref={nameInputRef}
                      required
                      placeholder="Jane Doe"
                      className={inputClass}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Work Email *</label>
                    <input
                      required
                      type="email"
                      placeholder="jane@brand.com"
                      className={inputClass}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Company (optional)</label>
                    <input
                      placeholder="Retail Brand Co."
                      className={inputClass}
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone (optional)</label>
                    <input
                      placeholder="+1 (555) 000-0000"
                      className={inputClass}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>What are you looking to sell? (optional)</label>
                  <input
                    placeholder="e.g. Fashion, Groceries, Electronics"
                    className={inputClass}
                    value={form.storeType}
                    onChange={(e) => setForm({ ...form, storeType: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelClass}>Anything else we should know? (optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Estimated order volume or custom requirements..."
                    className={inputClass}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                {result && !result.ok && (
                  <p className="text-xs text-red-500 font-semibold">{result.message}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-primary-6000 via-indigo-600 to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-primary-6000/25 hover:shadow-primary-6000/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all cursor-pointer mt-2"
                >
                  <span>{submitting ? "Sending Request..." : "Request Personalized Demo"}</span>
                  {!submitting && <ArrowRightIcon className="w-4 h-4" />}
                </button>
              </form>
            )}
          </div>

          <p className="text-[11px] text-neutral-400 text-center mt-6">
            We respect your privacy. No spam or third-party sharing.
          </p>
        </div>
      </div>
    </div>
  );
}
