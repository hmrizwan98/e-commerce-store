"use client";

import Label from "@/components/Label/Label";
import React, { FC } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Input from "@/shared/Input/Input";
import Radio from "@/shared/Radio/Radio";
import Select from "@/shared/Select/Select";
import SmartAddressInput, { type AddressSuggestion } from "@/components/SmartAddressInput";
import { MapPinIcon, CheckIcon, BuildingStorefrontIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

export interface ShippingAddressValue {
  fullName: string;
  line1: string;
  line2: string;
  landmark?: string;
  city: string;
  country: string;
  state: string;
  postalCode: string;
  addressType: "home" | "office";
}

interface Props {
  isActive: boolean;
  onCloseActive: () => void;
  onOpenActive: () => void;
  value: ShippingAddressValue;
  onChange: (patch: Partial<ShippingAddressValue>) => void;
}

const ShippingAddress: FC<Props> = ({
  isActive,
  onCloseActive,
  onOpenActive,
  value,
  onChange,
}) => {
  const handleSelectSuggestion = (sug: AddressSuggestion) => {
    const patch: Partial<ShippingAddressValue> = {};
    if (sug.line1) patch.line1 = sug.line1;
    if (sug.city) patch.city = sug.city;
    if (sug.state) patch.state = sug.state;
    if (sug.country) patch.country = sug.country;
    if (sug.postalCode) patch.postalCode = sug.postalCode;
    onChange(patch);
  };

  const isCompleted = Boolean(value.fullName && value.line1 && value.city);

  return (
    <div
      className={`border rounded-2xl transition-all ${
        isActive
          ? "border-indigo-600 dark:border-indigo-500 ring-4 ring-indigo-500/10 bg-white dark:bg-slate-900 shadow-md"
          : "border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 hover:border-slate-300"
      }`}
    >
      <div className="p-5 sm:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isCompleted
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                : isActive
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
            }`}
          >
            <MapPinIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. Shipping &amp; Delivery Address
              </h3>
              {isCompleted && !isActive && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  <CheckIcon className="w-3 h-3" /> Set
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">
              {[value.fullName, value.line1, value.landmark, value.city]
                .filter(Boolean)
                .join(", ") || "Enter your recipient name and delivery address"}
            </p>
          </div>
        </div>

        {!isActive && (
          <button
            type="button"
            onClick={onOpenActive}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition-colors shrink-0 cursor-pointer"
          >
            {isCompleted ? "Edit" : "Change"}
          </button>
        )}
      </div>

      {isActive && (
        <div className="border-t border-slate-100 dark:border-slate-800 p-5 sm:p-7 space-y-5">
          {/* Full Name */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Recipient Full Name *
            </Label>
            <Input
              className="mt-1.5"
              placeholder="e.g. Muhammad Ali"
              value={value.fullName}
              onChange={(e) => onChange({ fullName: e.target.value })}
            />
          </div>

          {/* Smart Address Line 1 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Street Address / House / Village / Mohalla *
              </Label>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                ✨ Auto-suggestions &amp; GPS Enabled
              </span>
            </div>
            <SmartAddressInput
              value={value.line1}
              onChange={(line1) => onChange({ line1 })}
              onSelectSuggestion={handleSelectSuggestion}
              placeholder="Start typing your street, colony, village or area..."
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
              <InformationCircleIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Unregistered village or street? You can type your exact custom location freely.</span>
            </p>
          </div>

          {/* Landmark / Nearby Famous Spot (Key for local deliveries!) */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Nearby Landmark / Famous Spot (Optional but Recommended)
            </Label>
            <Input
              className="mt-1.5"
              placeholder="e.g. Near Main Water Tank / Opposite Jamia Masjid / Next to PSO Pump"
              value={value.landmark ?? value.line2}
              onChange={(e) => onChange({ landmark: e.target.value, line2: e.target.value })}
            />
          </div>

          {/* City & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                City / Town *
              </Label>
              <Input
                className="mt-1.5"
                placeholder="e.g. Lahore, Karachi, Islamabad..."
                value={value.city}
                onChange={(e) => onChange({ city: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Country
              </Label>
              <Select
                className="mt-1.5"
                value={value.country}
                onChange={(e) => onChange({ country: e.target.value })}
              >
                <option value="Pakistan">Pakistan</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
              </Select>
            </div>
          </div>

          {/* State & Postal Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                State / Province (Optional)
              </Label>
              <Input
                className="mt-1.5"
                placeholder="e.g. Punjab, Sindh, KPK..."
                value={value.state}
                onChange={(e) => onChange({ state: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Postal / Zip Code (Optional)
              </Label>
              <Input
                className="mt-1.5"
                placeholder="e.g. 54000"
                value={value.postalCode}
                onChange={(e) => onChange({ postalCode: e.target.value })}
              />
            </div>
          </div>

          {/* Delivery Slot Preference */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Delivery Preference
            </Label>
            <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Radio
                label={`<span class="text-xs font-bold">Home Delivery <span class="font-normal text-slate-500">(All Day Delivery)</span></span>`}
                id="Address-type-home"
                name="Address-type"
                defaultChecked={value.addressType === "home"}
                onChange={() => onChange({ addressType: "home" })}
              />
              <Radio
                label={`<span class="text-xs font-bold">Office / Commercial <span class="font-normal text-slate-500">(9 AM - 5 PM)</span></span>`}
                id="Address-type-office"
                name="Address-type"
                defaultChecked={value.addressType === "office"}
                onChange={() => onChange({ addressType: "office" })}
              />
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <ButtonPrimary
              type="button"
              className="sm:!px-7 shadow-sm"
              onClick={onCloseActive}
            >
              Save &amp; Continue to Payment →
            </ButtonPrimary>
            {onCloseActive && (
              <ButtonSecondary
                type="button"
                onClick={onCloseActive}
              >
                Cancel
              </ButtonSecondary>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingAddress;
