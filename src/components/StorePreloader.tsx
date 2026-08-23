"use client";

import React, { useEffect, useState } from "react";

export interface StorePreloaderProps {
  storeName?: string;
  logoUrl?: string;
}

export default function StorePreloader({ storeName = "Store", logoUrl }: StorePreloaderProps) {
  const [mounted, setMounted] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start smooth progress counter from 0% to 100% over ~1200ms
    const intervalTime = 25;
    const increment = 2.5;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + increment + Math.random() * 2;
        return next > 100 ? 100 : next;
      });
    }, intervalTime);

    // Fade out preloader after progress reaches 100%
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setMounted(false);
      }, 600);
    }, 1350);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  if (!mounted) return null;

  const displayPercent = Math.min(100, Math.round(progress));

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl text-slate-900 dark:text-white transition-all duration-600 ease-out ${
        fading ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Background Animated Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center space-y-8">
        {/* Animated Luxury Logo / Shopping Icon */}
        <div className="relative group">
          {/* Pulsing Outer Halo */}
          <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-amber-400 via-indigo-600 to-purple-600 opacity-30 blur-md animate-pulse" />

          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl flex items-center justify-center p-3 transition-transform duration-500 group-hover:scale-105">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={storeName} className="max-h-12 max-w-16 object-contain" />
            ) : (
              <div className="relative flex flex-col items-center justify-center">
                <svg className="w-9 h-9 text-indigo-600 dark:text-indigo-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              </div>
            )}
          </div>
        </div>

        {/* Store Title & Shimmering Status */}
        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-bold tracking-[0.25em] uppercase text-slate-900 dark:text-white font-sans">
            {storeName}
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-widest uppercase">
            {displayPercent < 100 ? "Opening Storefront..." : "Welcome"}
          </p>
        </div>

        {/* Sleek Progress Bar & Counter */}
        <div className="w-60 sm:w-72 space-y-3">
          <div className="h-2 w-full bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden relative border border-slate-300/40 dark:border-slate-700/40 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(99,102,241,0.8)] relative"
              style={{ width: `${displayPercent}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/60 blur-[1px] rounded-full" />
            </div>
          </div>
          <div className="flex justify-between items-center text-xs font-mono text-slate-500 dark:text-slate-400 tracking-wider font-semibold">
            <span>LOADING</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{displayPercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
