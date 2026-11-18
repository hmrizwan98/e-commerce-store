"use client";

import React, { useRef, useState } from "react";
import imageCompression from "browser-image-compression";

/**
 * Customer uploads a payment screenshot (bank transfer / JazzCash / EasyPaisa). The server
 * re-checks everything (order + contact, file type by bytes, size, limits); this only makes
 * the file small enough to upload quickly.
 */
export default function PaymentProofUpload({ orderNumber, contact, alreadyUploaded = 0 }: { orderNumber: string; contact: string; alreadyUploaded?: number }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [count, setCount] = useState(alreadyUploaded);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setState("error");
      setMessage("Please choose a JPG, PNG or WEBP image.");
      return;
    }
    setState("uploading");
    setMessage("");
    try {
      const small = await imageCompression(file, { maxSizeMB: 1.5, maxWidthOrHeight: 2000, useWebWorker: true }).catch(() => file);
      const body = new FormData();
      body.set("orderNumber", orderNumber);
      body.set("contact", contact);
      body.set("file", small, "payment-proof");
      const res = await fetch("/api/payment-proof", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setState("done");
        setCount((c) => c + 1);
        setMessage(data.message || "Payment screenshot received.");
      } else {
        setState("error");
        setMessage(data.error || "Upload failed. Please try again.");
      }
    } catch {
      setState("error");
      setMessage("Upload failed. Please check your connection and try again.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 p-5 space-y-3" aria-live="polite">
      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Upload your payment screenshot</p>
      <p className="text-xs text-slate-600 dark:text-slate-400">
        Paid by bank transfer, JazzCash or EasyPaisa? Upload the payment screenshot so the store can confirm your payment
        faster. It is shared only with the store. JPG, PNG or WEBP, up to 4 MB.
      </p>
      {count > 0 && <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">✓ {count} screenshot{count > 1 ? "s" : ""} uploaded for this order.</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={state === "uploading"}
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold disabled:opacity-50"
      >
        {state === "uploading" ? "Uploading…" : count > 0 ? "Upload another screenshot" : "Choose screenshot"}
      </button>
      {message && (
        <p className={`text-xs ${state === "error" ? "text-rose-600 dark:text-rose-400" : "text-slate-600 dark:text-slate-300"}`}>{message}</p>
      )}
    </div>
  );
}
