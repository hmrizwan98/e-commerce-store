"use client";

const SESSION_KEY = "analytics_session_id";
const VISITOR_KEY = "analytics_visitor_id";

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** One id per browser tab session (sessionStorage) - the unit "sessions"/"bounce rate" are computed over. */
export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = generateId();
    window.sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** One id per browser (localStorage, persists across tabs/visits) - what "unique/returning visitors" are computed over. */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = generateId();
    window.localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

const UTM_KEY = "analytics_session_utm";

/** First-touch UTM attribution for this session - captured once from the landing URL, reused for every event in the session (utm params disappear from the URL after the first navigation). */
export function getSessionUtm(): { utmSource?: string; utmMedium?: string } {
  if (typeof window === "undefined") return {};
  const stored = window.sessionStorage.getItem(UTM_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }
  const params = new URLSearchParams(window.location.search);
  const utm = {
    utmSource: params.get("utm_source") ?? undefined,
    utmMedium: params.get("utm_medium") ?? undefined,
  };
  window.sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
  return utm;
}
