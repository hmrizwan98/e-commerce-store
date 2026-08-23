"use client";

import React, { Fragment } from "react";
import { Dialog, Transition } from "@/app/headlessui";
import { ExclamationTriangleIcon, InformationCircleIcon, ShieldExclamationIcon } from "@heroicons/react/24/outline";

export type ConfirmVariant = "warning" | "danger" | "info";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
}

const VARIANT_ICONS = {
  warning: ExclamationTriangleIcon,
  danger: ShieldExclamationIcon,
  info: InformationCircleIcon,
};

const VARIANT_ICON_STYLES = {
  warning: "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
  danger: "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20",
  info: "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20",
};

const VARIANT_BUTTON_STYLES = {
  warning: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/25",
  danger: "bg-red-600 hover:bg-red-700 text-white shadow-red-500/25",
  info: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25",
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  isLoading = false,
}: ConfirmModalProps) {
  const IconComponent = VARIANT_ICONS[variant];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={isLoading ? () => {} : onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95 translate-y-4 sm:translate-y-0"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4 sm:translate-y-0"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 px-6 pb-6 pt-6 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${VARIANT_ICON_STYLES[variant]}`}>
                    <IconComponent className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="mt-0.5 flex-1">
                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-neutral-900 dark:text-white">
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
                  <button
                    type="button"
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                    onClick={onClose}
                  >
                    {cancelText}
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all flex items-center gap-2 disabled:opacity-50 ${VARIANT_BUTTON_STYLES[variant]}`}
                    onClick={async () => {
                      await onConfirm();
                    }}
                  >
                    {isLoading && (
                      <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    <span>{confirmText}</span>
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
