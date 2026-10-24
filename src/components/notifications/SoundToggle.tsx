"use client";

import React, { useEffect, useState } from "react";
import { isChimeEnabled, playChime, setChimeEnabled, type ChimeResult } from "@/lib/notifications/chime";

const RESULT_TEXT: Record<ChimeResult, string> = {
  played: "Sound is working.",
  muted: "Sound is off.",
  blocked: "Your browser blocked the sound - click anywhere on the page once, then try again.",
  unsupported: "This browser can't play notification sounds - you'll still see the badge and pop-up.",
};

/** Per-browser on/off switch for the notification chime, with a "Test sound" check. */
export default function SoundToggle({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [on, setOn] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => setOn(isChimeEnabled()), []);

  const toggle = () => {
    const next = !on;
    setChimeEnabled(next);
    setOn(next);
    setMessage(next ? "Sound turned on." : "Sound turned off.");
  };

  const test = async () => setMessage(RESULT_TEXT[await playChime("notice")]);

  const muted = tone === "dark" ? "text-neutral-400" : "text-slate-500";
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={toggle}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-bold ${
          on ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" : "border-slate-300 dark:border-neutral-700 text-slate-600 dark:text-neutral-300"
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${on ? "bg-emerald-500" : "bg-slate-400"}`} />
        Sound {on ? "on" : "off"}
      </button>
      <button type="button" onClick={test} className={`font-semibold hover:underline ${muted}`}>
        Test sound
      </button>
      {message && (
        <span role="status" className={muted}>
          {message}
        </span>
      )}
    </div>
  );
}
