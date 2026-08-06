"use client";

import React, { useState } from "react";
import { submitBookDemoRequest } from "./actions";

const inputClass =
  "w-full px-4 py-3 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";
const labelClass = "block text-sm font-medium mb-1.5";

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Name</label>
          <input
            required
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            required
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Company (optional)</label>
          <input
            className={inputClass}
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Phone (optional)</label>
          <input
            className={inputClass}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>What are you looking to sell? (optional)</label>
        <input
          placeholder="e.g. fashion, groceries, electronics"
          className={inputClass}
          value={form.storeType}
          onChange={(e) => setForm({ ...form, storeType: e.target.value })}
        />
      </div>
      <div>
        <label className={labelClass}>Anything else we should know? (optional)</label>
        <textarea
          rows={4}
          className={inputClass}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full px-6 py-3 rounded-full bg-primary-6000 text-white font-medium disabled:opacity-50"
      >
        {submitting ? "Sending…" : "Request a Demo"}
      </button>
      {result && (
        <p className={`text-sm text-center ${result.ok ? "text-green-600" : "text-red-600"}`}>{result.message}</p>
      )}
    </form>
  );
}
