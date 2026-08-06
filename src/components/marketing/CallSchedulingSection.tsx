"use client";

import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

const AGENDA = [
  "A walkthrough of the multi-tenant architecture",
  "A live tour of the Store Admin panel",
  "A pricing discussion tailored to your store",
];

export default function CallSchedulingSection() {
  return (
    <section className="border-t border-neutral-200 dark:border-neutral-800">
      <div className="container py-20 lg:py-28 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">Prefer to talk it through?</h2>
          <p className="mt-4 text-neutral-500 dark:text-neutral-400">
            Book a 20-30 minute call and we&apos;ll walk you through the platform live, answer questions, and help you
            decide if it&apos;s the right fit.
          </p>
          <div className="mt-8">
            <Link href={"/book-demo" as any} className="px-6 py-3 rounded-full bg-primary-6000 text-white font-medium">
              Schedule a Call
            </Link>
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <h3 className="font-semibold mb-4">What we&apos;ll cover</h3>
          <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
            {AGENDA.map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircleIcon className="w-5 h-5 text-primary-6000 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
