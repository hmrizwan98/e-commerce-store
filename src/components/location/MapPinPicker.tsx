"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapPinIcon, XMarkIcon, ViewfinderCircleIcon } from "@heroicons/react/24/solid";
import { getCurrentPosition, PositionError } from "@/lib/location/geocode";

export interface MapPinPickerProps {
  open: boolean;
  /** Where to start - the detected/selected location if any. */
  initial?: { lat: number; lon: number } | null;
  onClose: () => void;
  onConfirm: (lat: number, lon: number) => void;
}

/** Pakistan overview when nothing is known yet. */
const DEFAULT_CENTER: [number, number] = [30.3753, 69.3451];

/**
 * "Adjust on map": the shopper pans the map so the fixed centre pin sits on their door (more
 * reliable on phones than dragging a small marker), then confirms. Free OpenStreetMap tiles
 * via Leaflet, loaded only when this opens. Closes with Escape or the backdrop.
 */
export default function MapPinPicker({ open, initial, onClose, onConfirm }: MapPinPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const [ready, setReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true }).setView(
        initial ? [initial.lat, initial.lon] : DEFAULT_CENTER,
        initial ? 17 : 5
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      }).addTo(map);
      mapRef.current = map;
      setReady(true);
      // The modal animates in - recompute size once it's laid out.
      setTimeout(() => map.invalidateSize(), 150);
    })();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      mapRef.current?.remove();
      mapRef.current = null;
      setReady(false);
      setNotice(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const locate = async () => {
    setLocating(true);
    setNotice(null);
    try {
      const pos = await getCurrentPosition();
      mapRef.current?.setView([pos.lat, pos.lon], Math.max(mapRef.current.getZoom(), 17));
      if (pos.accuracy > 150) setNotice(`Your location is approximate (±${Math.round(pos.accuracy)} m) - move the map so the pin is on your exact address.`);
    } catch (err) {
      setNotice(err instanceof PositionError ? err.message : "Couldn't get your location.");
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Set your delivery location on the map"
        className="w-full sm:max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Set your delivery location</h3>
            <p className="text-xs text-slate-500 mt-0.5">Move the map until the pin is on your house/building.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close">
            <XMarkIcon className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="relative h-[55vh] sm:h-[420px] bg-slate-100 dark:bg-slate-800">
          <div ref={containerRef} className="absolute inset-0 z-0" />
          {/* Fixed centre pin - the location confirmed is the map centre. */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-[500] -translate-x-1/2 -translate-y-full">
            <MapPinIcon className="w-10 h-10 text-rose-600 drop-shadow-lg" />
          </div>
          <button
            type="button"
            onClick={locate}
            disabled={locating || !ready}
            className="absolute right-3 bottom-3 z-[500] inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white dark:bg-slate-900 shadow-lg text-xs font-bold text-slate-800 dark:text-slate-100 disabled:opacity-60"
          >
            <ViewfinderCircleIcon className={`w-4 h-4 ${locating ? "animate-spin" : ""}`} />
            {locating ? "Locating…" : "Use my location"}
          </button>
        </div>

        {notice && <p className="px-5 pt-3 text-xs text-amber-700 dark:text-amber-400">{notice}</p>}

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end px-5 py-4">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Cancel
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={() => {
              const c = mapRef.current?.getCenter();
              if (c) onConfirm(c.lat, c.lng);
            }}
            className="px-5 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold disabled:opacity-50"
          >
            Use this location
          </button>
        </div>
      </div>
    </div>
  );
}
