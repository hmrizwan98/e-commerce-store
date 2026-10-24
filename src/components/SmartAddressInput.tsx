"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Input from "@/shared/Input/Input";
import { MapPinIcon, ArrowPathIcon, MapIcon } from "@heroicons/react/24/outline";
import {
  geolocationPermission,
  getCurrentPosition,
  PositionError,
  reverseGeocode,
  searchAddresses,
} from "@/lib/location/geocode";
import { line1ForConfidence, locationConfidence, type AddressSuggestion, type LocationConfidence } from "@/lib/location/address-mapping";

export type { AddressSuggestion } from "@/lib/location/address-mapping";

// Leaflet (map + its CSS) is only downloaded when the shopper opens the map.
const MapPinPicker = dynamic(() => import("@/components/location/MapPinPicker"), { ssr: false });

interface SmartAddressInputProps {
  value: string;
  onChange: (val: string) => void;
  /** Receives the resolved address. `line1` is already trimmed to what the location's
   * accuracy supports (empty when only the city is known) - see address-mapping.ts. */
  onSelectSuggestion?: (sug: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
  /** ISO code (e.g. "pk") to keep suggestions inside the shopper's country. */
  countryCode?: string;
}

type Status = { tone: "info" | "success" | "warning"; text: string } | null;

const AUTO_LOCATE_KEY = "checkout:auto-located";

export default function SmartAddressInput({
  value,
  onChange,
  onSelectSuggestion,
  placeholder = "House/Shop #, Street, Village, Mohalla...",
  className = "",
  countryCode,
}: SmartAddressInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [status, setStatus] = useState<Status>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ lat: number; lon: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Only text the shopper TYPED triggers a search - filling the field from a suggestion or
  // from GPS must not search again (that re-opened the list and forced re-selecting).
  const typedRef = useRef(false);
  const listId = useId();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShowDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced, cancellable suggestion search.
  useEffect(() => {
    if (!typedRef.current) return;
    const q = value.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchAddresses(q, { countryCode, signal: controller.signal });
        setSuggestions(results);
        setActiveIndex(-1);
        setShowDropdown(results.length > 0);
      } catch {
        // Network/provider issue - manual typing always works.
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 600);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, countryCode]);

  const apply = useCallback(
    (sug: AddressSuggestion, confidence: LocationConfidence) => {
      typedRef.current = false;
      const line1 = line1ForConfidence(sug, confidence);
      if (line1) onChange(line1);
      onSelectSuggestion?.({ ...sug, line1 });
      if (sug.lat !== undefined && sug.lon !== undefined) setLastPoint({ lat: sug.lat, lon: sug.lon });
      setShowDropdown(false);
      setSuggestions([]);
      const where = [sug.area, sug.city].filter(Boolean).join(", ");
      if (confidence === "street") {
        setStatus({ tone: "success", text: "Address filled from your location - please add your house / flat number and check it." });
      } else if (confidence === "area") {
        setStatus({ tone: "warning", text: `We found your area${where ? ` (${where})` : ""}. Please type your street and house number, or adjust the pin on the map.` });
      } else {
        setStatus({ tone: "warning", text: `We could only find your city${sug.city ? ` (${sug.city})` : ""}. Please type your full address or set it on the map.` });
      }
    },
    [onChange, onSelectSuggestion]
  );

  const handleSelect = (sug: AddressSuggestion) => {
    typedRef.current = false;
    onChange(sug.line1 || sug.displayName.split(",")[0]);
    onSelectSuggestion?.(sug);
    if (sug.lat !== undefined && sug.lon !== undefined) setLastPoint({ lat: sug.lat, lon: sug.lon });
    setShowDropdown(false);
    setSuggestions([]);
    setStatus(null);
  };

  const detect = useCallback(
    async (silent = false) => {
      if (detecting) return;
      setDetecting(true);
      if (!silent) setStatus({ tone: "info", text: "Finding your location…" });
      try {
        const pos = await getCurrentPosition();
        const { suggestion, hasRoad } = await reverseGeocode(pos.lat, pos.lon);
        apply(suggestion, locationConfidence(pos.accuracy, suggestion, hasRoad));
      } catch (err) {
        if (!silent) {
          setStatus({ tone: "warning", text: err instanceof PositionError ? err.message : "We couldn't look up your address. Please type it, or set it on the map." });
        }
      } finally {
        setDetecting(false);
      }
    },
    [apply, detecting]
  );

  // Auto-fill once per session, and only if the shopper ALREADY allowed location - never
  // a permission prompt on page load, never again when this step re-opens.
  useEffect(() => {
    if (value) return;
    let done = false;
    try {
      done = sessionStorage.getItem(AUTO_LOCATE_KEY) === "1";
    } catch {}
    if (done) return;
    geolocationPermission().then((state) => {
      if (state !== "granted") return;
      try {
        sessionStorage.setItem(AUTO_LOCATE_KEY, "1");
      } catch {}
      detect(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmMapPin = async (lat: number, lon: number) => {
    setMapOpen(false);
    setDetecting(true);
    setStatus({ tone: "info", text: "Looking up the address at your pin…" });
    try {
      const { suggestion, hasRoad } = await reverseGeocode(lat, lon);
      // The shopper placed the pin themselves - treat it as precise.
      apply(suggestion, hasRoad ? "street" : "area");
    } catch {
      setLastPoint({ lat, lon });
      setStatus({ tone: "warning", text: "Pin saved, but we couldn't look up its address. Please type your address." });
    } finally {
      setDetecting(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || !suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const toneClass =
    status?.tone === "success"
      ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
      : status?.tone === "warning"
        ? "text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800"
        : "text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700";

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          className={`${className} !pr-32 sm:!pr-36`}
          value={value}
          onChange={(e) => {
            typedRef.current = true;
            onChange(e.target.value);
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoComplete="street-address"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {loading && <ArrowPathIcon className="w-4 h-4 text-slate-400 animate-spin" aria-hidden />}
          <button
            type="button"
            onClick={() => detect(false)}
            disabled={detecting}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-all border border-indigo-200/60 dark:border-indigo-800/60 cursor-pointer disabled:opacity-60"
            title="Use my current location"
          >
            {detecting ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <MapPinIcon className="w-3.5 h-3.5" />}
            <span>{detecting ? "Locating…" : "Use my location"}</span>
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
        {status ? (
          <p role="status" className={`flex-1 min-w-[200px] text-[11px] leading-relaxed px-3 py-2 rounded-xl border ${toneClass}`}>
            {status.text}
          </p>
        ) : (
          <span className="flex-1" />
        )}
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline py-1.5"
        >
          <MapIcon className="w-3.5 h-3.5" />
          {lastPoint ? "Adjust pin on map" : "Set on map"}
        </button>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-50 left-0 right-0 top-[3.25rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto"
        >
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>Suggestions</span>
            <span className="text-[9px] normal-case font-sans">Pick one or keep typing</span>
          </div>
          {suggestions.map((sug, idx) => (
            <button
              key={`${sug.displayName}-${idx}`}
              id={`${listId}-${idx}`}
              role="option"
              aria-selected={idx === activeIndex}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(sug)}
              className={`w-full text-left px-3.5 py-2.5 transition-colors border-b border-slate-100 dark:border-slate-800/40 last:border-0 flex items-start gap-2.5 cursor-pointer ${
                idx === activeIndex ? "bg-indigo-50 dark:bg-slate-800" : "hover:bg-indigo-50/70 dark:hover:bg-slate-800/70"
              }`}
            >
              <MapPinIcon className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{sug.line1 || sug.displayName.split(",")[0]}</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {[sug.city, sug.state, sug.country].filter(Boolean).join(", ")}
                </span>
              </div>
            </button>
          ))}
          <div className="px-3 py-1 text-[9px] text-slate-400 text-right">© OpenStreetMap contributors</div>
        </div>
      )}

      <MapPinPicker open={mapOpen} initial={lastPoint} onClose={() => setMapOpen(false)} onConfirm={confirmMapPin} />
    </div>
  );
}
