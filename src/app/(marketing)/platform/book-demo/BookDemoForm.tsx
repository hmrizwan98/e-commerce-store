"use client";

import React, { useState } from "react";
import { submitBookDemoRequest } from "./actions";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const inputClass =
  "w-full px-4 py-3.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/50 dark:bg-neutral-900/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-6000/50 focus:border-primary-6000 transition-all";
const labelClass = "block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5 font-mono";

export default function BookDemoForm() {
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", storeType: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await submitBookDemoRequest(form);
      setResult(res);
      if (res.ok) {
        setForm({ name: "", email: "", company: "", phone: "", storeType: "", message: "" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 sm:p-10 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-2xl shadow-neutral-900/5 space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Name *</label>
          <input
            required
            placeholder="John Doe"
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
            placeholder="john@company.com"
            className={inputClass}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
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
          placeholder="e.g. Fashion, Groceries, Electronics, Luxury Goods"
          className={inputClass}
          value={form.storeType}
          onChange={(e) => setForm({ ...form, storeType: e.target.value })}
        />
      </div>

      <div>
        <label className={labelClass}>Anything else we should know? (optional)</label>
        <textarea
          rows={4}
          placeholder="Tell us about your estimated monthly order volume, custom requirements, or timeline..."
          className={inputClass}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary-6000 via-indigo-600 to-indigo-700 text-white font-extrabold text-base shadow-xl shadow-primary-6000/25 hover:shadow-primary-6000/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all cursor-pointer"
      >
        <span>{submitting ? "Sending Request..." : "Request Personalized Demo"}</span>
        {!submitting && <ArrowRightIcon className="w-5 h-5" />}
      </button>

      {result && (
        <div className={`p-4 rounded-xl text-sm font-semibold text-center ${result.ok ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"}`}>
          {result.message}
        </div>
      )}
    </form>
  );
}

