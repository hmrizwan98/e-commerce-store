"use client";

import type { AnalyticsEventDevice, AnalyticsEventGeo, DeviceType } from "@/types/analytics-event";

function detectDeviceType(ua: string): DeviceType {
  const isIpad =
    /iPad/i.test(ua) || (/Macintosh/i.test(ua) && typeof navigator !== "undefined" && navigator.maxTouchPoints > 1);
  if (isIpad || /Tablet|PlayBook|Silk/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "mobile";
  return "desktop";
}

function detectBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return "Chrome";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Safari\//i.test(ua) && /Version\//i.test(ua)) return "Safari";
  return "Other";
}

function detectOS(ua: string): string {
  if (/Windows/i.test(ua)) return "Windows";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Linux/i.test(ua)) return "Linux";
  return "Other";
}

export function detectDevice(): AnalyticsEventDevice {
  if (typeof navigator === "undefined") {
    return { type: "desktop", browser: "Unknown", os: "Unknown" };
  }
  const ua = navigator.userAgent;
  return {
    type: detectDeviceType(ua),
    browser: detectBrowser(ua),
    os: detectOS(ua),
    screenWidth: typeof screen !== "undefined" ? screen.width : undefined,
    screenHeight: typeof screen !== "undefined" ? screen.height : undefined,
  };
}

export function detectGeo(): AnalyticsEventGeo {
  // Country/city/region: "Unknown" until an IP-geolocation provider is wired
  // in (none configured in this project). Language/timezone are real.
  let timezone: string | undefined;
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    timezone = undefined;
  }
  return {
    country: "Unknown",
    city: "Unknown",
    region: "Unknown",
    language: typeof navigator !== "undefined" ? navigator.language : undefined,
    timezone,
  };
}
