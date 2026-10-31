"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useChromeSuppressed } from "@/lib/tenant/useChromeSuppressed";
import { useIsThemePreviewMode } from "@/lib/tenant/ThemePreviewModeContext";
import type { PopupThemeConfig } from "@/lib/theme/theme-types";

export interface ThemePopupModalProps {
  popupConfig?: PopupThemeConfig;
  tenantId?: string;
  themePresetId?: string;
}

export default function ThemePopupModal({
  popupConfig,
  tenantId = "default",
  themePresetId = "modern-minimal",
}: ThemePopupModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isSuppressed = useChromeSuppressed();
  const isPreview = useIsThemePreviewMode();

  const enabled = popupConfig?.enabled ?? false;
  const title = popupConfig?.title || "Special Offer";
  const description = popupConfig?.description || "Subscribe today to get exclusive deals and new arrivals.";
  const imageUrl = popupConfig?.imageUrl;
  const buttonText = popupConfig?.buttonText || "Claim Offer";
  const buttonUrl = popupConfig?.buttonUrl || "#";
  const trigger = popupConfig?.trigger || "page-load";
  const delaySeconds = popupConfig?.delaySeconds ?? 3;
  const frequency = popupConfig?.frequency || "once-per-session";
  const styleVariant = popupConfig?.styleVariant || "center-modal";

  // The editor preview keeps its own "seen" state, so dismissing the popup while editing
  // doesn't hide it on the live store in the same browser (and vice versa).
  const storageKey = `${isPreview ? "preview_" : ""}popup_seen_${tenantId}_${title.replace(/\s+/g, "_").toLowerCase()}`;

  const shouldShowPopup = useCallback(() => {
    if (!enabled) return false;

    try {
      if (frequency === "once-per-session") {
        if (typeof window !== "undefined" && sessionStorage.getItem(storageKey)) return false;
      } else if (frequency === "once-per-day") {
        if (typeof window !== "undefined") {
          const lastSeen = localStorage.getItem(storageKey);
          if (lastSeen) {
            const oneDay = 24 * 60 * 60 * 1000;
            if (Date.now() - parseInt(lastSeen, 10) < oneDay) return false;
          }
        }
      }
    } catch {
      // Storage access disabled or unavailable
    }

    return true;
  }, [enabled, frequency, storageKey]);

  const markAsSeen = useCallback(() => {
    try {
      if (frequency === "once-per-session") {
        sessionStorage.setItem(storageKey, "true");
      } else if (frequency === "once-per-day") {
        localStorage.setItem(storageKey, Date.now().toString());
      }
    } catch {
      // Storage access disabled or unavailable
    }
  }, [frequency, storageKey]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    markAsSeen();
  }, [markAsSeen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Setup Trigger behavior
  useEffect(() => {
    if (!shouldShowPopup()) return;

    if (trigger === "page-load") {
      setIsOpen(true);
    } else if (trigger === "delay") {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, Math.max(0, delaySeconds) * 1000);
      return () => clearTimeout(timer);
    } else if (trigger === "exit-intent") {
      // Desktop: the pointer leaves the page through the top edge (towards the tabs / address
      // bar). `mouseout` on document with no relatedTarget is the reliable signal -
      // `mouseleave` on window doesn't fire in every browser.
      const handleMouseOut = (e: MouseEvent) => {
        if (!e.relatedTarget && e.clientY <= 0) {
          setIsOpen(true);
          cleanup();
        }
      };
      // Touch devices have no pointer to leave with: fall back to a quick scroll back up
      // after the shopper has scrolled down a bit (a common "about to leave" gesture).
      let maxY = 0;
      const handleScroll = () => {
        const y = window.scrollY;
        maxY = Math.max(maxY, y);
        if (maxY > 600 && maxY - y > 250) {
          setIsOpen(true);
          cleanup();
        }
      };
      const isTouch = typeof window !== "undefined" && window.matchMedia?.("(hover: none)").matches;
      const cleanup = () => {
        document.removeEventListener("mouseout", handleMouseOut);
        window.removeEventListener("scroll", handleScroll);
      };
      document.addEventListener("mouseout", handleMouseOut);
      if (isTouch) window.addEventListener("scroll", handleScroll, { passive: true });
      return cleanup;
    }
  }, [shouldShowPopup, trigger, delaySeconds]);

  if (!isOpen || !enabled || isSuppressed) return null;

  // Theme-adapted visual styling
  const isBold = themePresetId === "bold-commerce";
  const isLuxury = themePresetId === "premium-luxury";

  const modalContainerClasses = isBold
    ? "bg-white border-4 border-[var(--primary-600,#dc2626)] rounded-2xl shadow-2xl"
    : isLuxury
    ? "bg-[#fafaf9] border border-[#e7e5e4] rounded-2xl shadow-xl"
    : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl";

  const titleClasses = isBold
    ? "text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white"
    : isLuxury
    ? "text-3xl font-serif tracking-wide text-[#1c1917]"
    : "text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug";

  // Layout per "Style" setting: centred modal (default), a smaller card sliding in at the
  // bottom (no page-blocking backdrop) or a full-screen overlay.
  const overlayClasses =
    styleVariant === "bottom-slide"
      ? "fixed inset-x-0 bottom-0 z-50 flex items-end justify-center sm:justify-end p-4 pointer-events-none"
      : styleVariant === "full-overlay"
      ? "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
      : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200";
  const panelSizeClasses =
    styleVariant === "bottom-slide"
      ? "max-w-sm p-6 space-y-4 pointer-events-auto animate-in slide-in-from-bottom-8 duration-300"
      : styleVariant === "full-overlay"
      ? "max-w-xl sm:max-w-2xl p-8 sm:p-12 space-y-6 animate-in zoom-in-95 duration-200"
      : "max-w-md p-8 space-y-6 animate-in zoom-in-95 duration-200";

  return (
    <div
      className={overlayClasses}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className={`relative w-full overflow-hidden ${panelSizeClasses} ${modalContainerClasses}`}>
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {imageUrl && (
          <div className={`relative w-full overflow-hidden rounded-2xl bg-slate-100 ${styleVariant === "bottom-slide" ? "h-32" : styleVariant === "full-overlay" ? "h-64" : "h-48"}`}>
            <Image src={imageUrl} alt={title} fill className="object-cover" />
          </div>
        )}

        <div className="space-y-2 text-left">
          <h2 id="popup-modal-title" className={titleClasses}>
            {title}
          </h2>
          <p className={`text-sm leading-relaxed ${isLuxury ? "font-serif text-[#78716c]" : "text-slate-600 dark:text-slate-400"}`}>
            {description}
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          {/* One link styled as a button (a <button> nested in an <a> is invalid HTML). */}
          <a
            href={buttonUrl}
            onClick={handleClose}
            className={`w-full inline-flex items-center justify-center py-3.5 rounded-xl text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all ${isBold ? "uppercase tracking-wider bg-[var(--btn-bg)]" : isLuxury ? "font-serif tracking-widest bg-[var(--btn-bg)]" : "bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"}`}
          >
            {buttonText}
          </a>
        </div>

        <div className="pt-2 text-center text-xs text-slate-400">
          Already subscribed? <button onClick={handleClose} className="text-pink-600 font-semibold hover:underline">Dismiss</button>
        </div>
      </div>
    </div>
  );
}

