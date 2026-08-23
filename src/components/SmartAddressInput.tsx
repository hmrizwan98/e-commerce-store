"use client";

import React, { useState, useEffect, useRef } from "react";
import Input from "@/shared/Input/Input";
import { MapPinIcon, ArrowPathIcon, SparklesIcon } from "@heroicons/react/24/outline";

export interface AddressSuggestion {
  displayName: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  line1: string;
}

interface SmartAddressInputProps {
  value: string;
  onChange: (val: string) => void;
  onSelectSuggestion?: (sug: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
}

export default function SmartAddressInput({
  value,
  onChange,
  onSelectSuggestion,
  placeholder = "House/Shop #, Street, Village, Mohalla...",
  className = "",
}: SmartAddressInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch address suggestions as user types (debounce 350ms)
  useEffect(() => {
    if (!value || value.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // Query OpenStreetMap Nominatim / Geocoding API with fallback
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}&addressdetails=1&limit=5`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          const mapped: AddressSuggestion[] = data.map((item: any) => {
            const addr = item.address || {};
            const city =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.suburb ||
              addr.county ||
              addr.state_district ||
              "";
            const state = addr.state || addr.region || "";
            const country = addr.country || "Pakistan";
            const postalCode = addr.postcode || "";
            const line1 =
              addr.road || addr.street || addr.neighbourhood || addr.suburb || item.display_name.split(",")[0];

            return {
              displayName: item.display_name,
              city,
              state,
              country,
              postalCode,
              line1: line1 || value,
            };
          });
          setSuggestions(mapped);
          if (mapped.length > 0) setShowDropdown(true);
        }
      } catch (err) {
        // Silent catch: manual free-form typing is always enabled
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [value]);

  const handleSelect = (sug: AddressSuggestion) => {
    onChange(sug.line1 || sug.displayName);
    if (onSelectSuggestion) {
      onSelectSuggestion(sug);
    }
    setShowDropdown(false);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          if (res.ok) {
            const item = await res.json();
            const addr = item.address || {};
            const city =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.suburb ||
              addr.county ||
              "";
            const state = addr.state || "";
            const country = addr.country || "Pakistan";
            const postalCode = addr.postcode || "";
            const line1 =
              [addr.house_number, addr.road || addr.street, addr.neighbourhood || addr.suburb]
                .filter(Boolean)
                .join(", ") || item.display_name.split(",")[0];

            const sug: AddressSuggestion = {
              displayName: item.display_name,
              city,
              state,
              country,
              postalCode,
              line1: line1 || "Current Location",
            };
            handleSelect(sug);
          }
        } catch (e) {
          // ignore
        } finally {
          setDetecting(false);
        }
      },
      () => {
        setDetecting(false);
        alert("Unable to retrieve your location. You can type your address manually below.");
      },
      { timeout: 10000 }
    );
  };

  // Auto-detect current location on mount if value is empty
  useEffect(() => {
    if (!value && typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            if (res.ok) {
              const item = await res.json();
              const addr = item.address || {};
              const city =
                addr.city ||
                addr.town ||
                addr.village ||
                addr.suburb ||
                addr.county ||
                "";
              const state = addr.state || "";
              const country = addr.country || "Pakistan";
              const postalCode = addr.postcode || "";
              const line1 =
                [addr.house_number, addr.road || addr.street, addr.neighbourhood || addr.suburb]
                  .filter(Boolean)
                  .join(", ") || item.display_name.split(",")[0];

              const sug: AddressSuggestion = {
                displayName: item.display_name,
                city,
                state,
                country,
                postalCode,
                line1: line1 || "Current Location",
              };
              handleSelect(sug);
            }
          } catch {}
        },
        () => {}, // silent fallback if permission denied or timeout
        { timeout: 8000 }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          className={className}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {loading && <ArrowPathIcon className="w-4 h-4 text-slate-400 animate-spin" />}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={detecting}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-all border border-indigo-200/60 dark:border-indigo-800/60 cursor-pointer"
            title="Auto-detect current location via GPS"
          >
            {detecting ? (
              <ArrowPathIcon className="w-3 h-3 animate-spin text-indigo-600" />
            ) : (
              <MapPinIcon className="w-3 h-3 text-indigo-600" />
            )}
            <span>{detecting ? "Locating..." : "Auto Location"}</span>
          </button>
        </div>
      </div>

      {/* Suggestion Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>Address Suggestions</span>
            <span className="text-[9px] text-slate-400">Click to fill (Or type manually)</span>
          </div>
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(sug)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-indigo-50/70 dark:hover:bg-slate-800/70 transition-colors border-b border-slate-100 dark:border-slate-800/40 last:border-0 flex items-start gap-2.5 cursor-pointer"
            >
              <MapPinIcon className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {sug.line1 || sug.displayName}
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {[sug.city, sug.state, sug.country].filter(Boolean).join(", ")}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
