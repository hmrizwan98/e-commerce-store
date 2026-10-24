import Link from "next/link";
import { CheckCircleIcon, CalendarDaysIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { MKT_BTN_PRIMARY } from "./buttons";

const AGENDA = [
  "A live tour of Store Admin - adding products, taking orders and confirming COD orders",
  "How courier tracking links and WhatsApp order updates work for your customers",
  "A commission rate that fits your sales volume, and how to get your store live",
];

export default function CallSchedulingSection() {
  return (
    <section className="border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/50">
      <div className="container py-16 lg:py-24 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <CalendarDaysIcon className="w-3.5 h-3.5" />
            <span>1-on-1 Walkthrough</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
            Prefer to talk it through live?
          </h2>

          <p className="text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Schedule a 20–30 minute demo call. We&apos;ll show you how your store would work day to day and answer every setup and pricing question directly.
          </p>

          <div className="pt-2">
            <Link
              href={"/book-demo" as any}
              className={MKT_BTN_PRIMARY}
            >
              <span>Schedule a Demo Call</span>
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6 p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 shadow-lg shadow-neutral-900/5 space-y-4">
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white tracking-tight">What we&apos;ll cover on the call</h3>
          <ul className="space-y-4 text-sm text-neutral-700 dark:text-neutral-300">
            {AGENDA.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

