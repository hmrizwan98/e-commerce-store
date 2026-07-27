"use client";

const listeners = new Map<string, Set<() => void>>();
// useSyncExternalStore requires getSnapshot to return a referentially stable
// value between real changes (Object.is-compared) - caching the parsed array
// here (rather than re-parsing localStorage on every call) is what prevents
// an infinite render loop ("Maximum update depth exceeded").
const cache = new Map<string, string[]>();

function getListeners(key: string): Set<() => void> {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  return set;
}

export function readList(key: string): string[] {
  if (typeof window === "undefined") return [];
  const cached = cache.get(key);
  if (cached) return cached;

  let parsed: string[];
  try {
    const raw = window.localStorage.getItem(key);
    parsed = raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    parsed = [];
  }
  cache.set(key, parsed);
  return parsed;
}

export function writeList(key: string, ids: string[]): void {
  if (typeof window === "undefined") return;
  cache.set(key, ids);
  window.localStorage.setItem(key, JSON.stringify(ids));
  getListeners(key).forEach((cb) => cb());
}

export function subscribeList(key: string, callback: () => void): () => void {
  const set = getListeners(key);
  set.add(callback);
  return () => set.delete(callback);
}
