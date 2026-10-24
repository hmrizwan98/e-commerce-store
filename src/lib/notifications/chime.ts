"use client";

/**
 * Notification chime shared by the Store Admin and Super Admin panels - generated with Web
 * Audio (no sound file, no paid service).
 *
 * Browsers start every AudioContext "suspended" until the page has had a user gesture, so
 * one shared context is created and resumed on the first click/keypress (installChimeUnlock).
 * Before that, playChime() resolves to "blocked" and callers fall back to the visual badge /
 * toast only. The on/off preference is per browser (localStorage) - it's a device setting,
 * like a phone's ringer, not store data.
 */

const PREF_KEY = "webriiz:notification-sound";
let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (ctx) return ctx;
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    return null;
  }
  return ctx;
}

export function isChimeEnabled(): boolean {
  try {
    return window.localStorage.getItem(PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setChimeEnabled(on: boolean): void {
  try {
    window.localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {
    // storage blocked (private mode) - preference just won't persist
  }
  window.dispatchEvent(new CustomEvent("webriiz:chime-pref", { detail: on }));
}

/** Resume the shared context on the first user gesture. Returns a cleanup function. */
export function installChimeUnlock(): () => void {
  const unlock = () => {
    const c = getContext();
    if (c && c.state === "suspended") c.resume().catch(() => {});
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
  return () => {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
}

export type ChimeResult = "played" | "muted" | "blocked" | "unsupported";

/** "order" = the existing two-tone new-order bell; "notice" = a softer single tone for
 * request decisions / platform notifications. */
export async function playChime(kind: "order" | "notice" = "notice"): Promise<ChimeResult> {
  if (!isChimeEnabled()) return "muted";
  const c = getContext();
  if (!c) return "unsupported";
  try {
    if (c.state === "suspended") await c.resume();
    // Still suspended -> no user gesture yet; the browser won't let us play.
    if (c.state !== "running") return "blocked";
    const now = c.currentTime;
    const tones: [number, number, number, number][] =
      kind === "order"
        ? [
            [659.25, 0, 0.35, 0.3], // E5
            [987.77, 0.12, 0.65, 0.35], // B5
          ]
        : [
            [880, 0, 0.4, 0.12], // A5, quiet
            [1318.5, 0.09, 0.5, 0.08], // E6 shimmer
          ];
    for (const [freq, start, end, volume] of tones) {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(volume, now + start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + end);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now + start);
      osc.stop(now + end);
    }
    return "played";
  } catch {
    return "blocked";
  }
}
