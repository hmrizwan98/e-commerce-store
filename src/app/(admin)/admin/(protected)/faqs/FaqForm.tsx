"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createFaq, updateFaq, type FaqFormInput } from "./actions";
import type { FaqItem } from "@/types/faq";

const FaqForm: React.FC<{ mode: "create" | "edit"; faq?: FaqItem }> = ({ mode, faq }) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const [order, setOrder] = useState(String(faq?.order ?? 0));
  const [isActive, setIsActive] = useState(faq?.isActive ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!question.trim() || !answer.trim()) {
      setError("Question and answer are required.");
      return;
    }
    const payload: FaqFormInput = {
      question: question.trim(),
      answer: answer.trim(),
      order: Number(order) || 0,
      isActive,
    };
    setSubmitting(true);
    try {
      if (mode === "create") {
        await createFaq(payload);
        router.push("/admin/faqs");
      } else if (faq) {
        await updateFaq(faq.id, payload);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent";
  const labelClass = "block text-sm font-medium mb-1";
  const cardClass =
    "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}
      <div className={cardClass}>
        <div>
          <label className={labelClass}>Question</label>
          <input className={inputClass} value={question} onChange={(e) => setQuestion(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Answer</label>
          <textarea className={inputClass} rows={5} value={answer} onChange={(e) => setAnswer(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Sort order</label>
          <input type="number" className={inputClass} value={order} onChange={(e) => setOrder(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Visible on storefront
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-3 rounded-full bg-primary-6000 text-white font-medium disabled:opacity-50"
      >
        {submitting ? "Saving…" : mode === "create" ? "Create FAQ" : "Save changes"}
      </button>
    </form>
  );
};

export default FaqForm;
