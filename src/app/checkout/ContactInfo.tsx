import Label from "@/components/Label/Label";
import React, { FC } from "react";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Input from "@/shared/Input/Input";
import { UserIcon, CheckIcon } from "@heroicons/react/24/outline";

interface Props {
  isActive: boolean;
  onOpenActive: () => void;
  onCloseActive: () => void;
  phone: string;
  email: string;
  onChange: (patch: { phone?: string; email?: string }) => void;
}

const ContactInfo: FC<Props> = ({
  isActive,
  onCloseActive,
  onOpenActive,
  phone,
  email,
  onChange,
}) => {
  const isCompleted = Boolean(phone || email);

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
            <UserIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                1. Contact Information
              </h3>
              {isCompleted && !isActive && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  <CheckIcon className="w-3 h-3" /> Saved
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">
              {[phone, email].filter(Boolean).join(" · ") || "Guest checkout — Enter phone or email"}
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
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Mobile Phone Number (For Order Updates &amp; Delivery) *
            </Label>
            <Input
              className="mt-1.5"
              type="tel"
              placeholder="e.g. 0300 1234567"
              value={phone}
              onChange={(e) => onChange({ phone: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Email Address (Optional — for order receipt)
            </Label>
            <Input
              className="mt-1.5"
              type="email"
              placeholder="e.g. yourname@example.com"
              value={email}
              onChange={(e) => onChange({ email: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <ButtonPrimary
              type="button"
              className="sm:!px-7 shadow-sm"
              onClick={onCloseActive}
            >
              Save &amp; Continue to Address →
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

export default ContactInfo;
